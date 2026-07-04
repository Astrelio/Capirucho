import { supabase } from '../../config/supabase';
import type {
  AvailabilityResult,
  CanvasData,
  ReservationSlot,
  Restaurant,
  RestaurantTable,
  TableShape,
  TableStatus,
  Zone,
} from './types';

export const RESTAURANT_SLUG = 'el-capirucho';
export const SLOT_MINUTES = 90;
export const timeSlots = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

export function createId() {
  return crypto.randomUUID();
}

export function todayInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function slotEnd(time: string, minutes = SLOT_MINUTES) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// ---------- Mappers DB <-> dominio ----------

type ZoneRow = {
  id: string; restaurant_id: string; name: string; color: string;
  position_x: number; position_y: number; width: number; height: number;
};

type TableRow = {
  id: string; restaurant_id: string; zone_id: string; label: string;
  seats: number; shape: string; position_x: number; position_y: number;
  width: number; height: number; status: string; rotation: number | null;
};

const zoneFromRow = (r: ZoneRow): Zone => ({
  id: r.id, restaurantId: r.restaurant_id, name: r.name, color: r.color,
  x: r.position_x, y: r.position_y, width: r.width, height: r.height,
});

const zoneToRow = (z: Zone) => ({
  id: z.id, name: z.name, color: z.color,
  position_x: z.x, position_y: z.y, width: z.width, height: z.height,
});

const tableFromRow = (r: TableRow): RestaurantTable => ({
  id: r.id, restaurantId: r.restaurant_id, zoneId: r.zone_id, name: r.label,
  seats: r.seats, shape: (r.shape === 'circle' ? 'round' : r.shape) as TableShape,
  x: r.position_x, y: r.position_y, width: r.width, height: r.height,
  status: r.status as TableStatus, rotation: r.rotation ?? 0,
});

const tableToRow = (t: RestaurantTable) => ({
  id: t.id, zone_id: t.zoneId, label: t.name, seats: t.seats, shape: t.shape,
  position_x: t.x, position_y: t.y, width: t.width, height: t.height,
  status: t.status, rotation: t.rotation,
});

// ---------- Lecturas (Supabase directo, RLS public read) ----------

export async function loadCanvas(): Promise<CanvasData> {
  const { data: rest, error: rErr } = await supabase
    .from('restaurants')
    .select('id, name, slug, description')
    .eq('slug', RESTAURANT_SLUG)
    .single();
  if (rErr || !rest) throw new Error(rErr?.message ?? 'Restaurante no encontrado');

  const [{ data: zones, error: zErr }, { data: tables, error: tErr }] = await Promise.all([
    supabase.from('zones').select('*').eq('restaurant_id', rest.id).order('sort_order'),
    supabase.from('tables').select('*').eq('restaurant_id', rest.id),
  ]);
  if (zErr) throw new Error(zErr.message);
  if (tErr) throw new Error(tErr.message);

  return {
    restaurant: rest as Restaurant,
    zones: (zones as ZoneRow[]).map(zoneFromRow),
    tables: (tables as TableRow[]).map(tableFromRow),
  };
}

export async function loadReservations(restaurantId: string, date: string): Promise<ReservationSlot[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('table_id, date, time_start, time_end, status')
    .eq('restaurant_id', restaurantId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed', 'seated']);
  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => ({
    tableId: r.table_id as string,
    date: r.date as string,
    timeStart: r.time_start as string,
    timeEnd: r.time_end as string,
    status: r.status as string,
  }));
}

// ---------- Disponibilidad (overlap en cliente, solo para pintar) ----------

export function getAvailability(
  tables: RestaurantTable[],
  reservations: ReservationSlot[],
  query: { zoneId: string; time: string; partySize: number },
): AvailabilityResult[] {
  const start = query.time;
  const end = slotEnd(query.time);

  return tables
    .filter((t) => t.zoneId === query.zoneId)
    .map((table) => {
      if (table.status === 'blocked') return { table, status: 'blocked' as const, label: 'Bloqueada' };
      if (table.seats < query.partySize) return { table, status: 'too_small' as const, label: 'Capacidad insuficiente' };

      const taken = reservations.some(
        (r) => r.tableId === table.id && r.timeStart < end && start < r.timeEnd,
      );
      if (taken) return { table, status: 'reserved' as const, label: 'Reservada' };

      return { table, status: 'available' as const, label: 'Disponible' };
    });
}

// ---------- Escrituras (Netlify Functions, service role) ----------

const FN = '/.netlify/functions';

export async function saveLayout(restaurantId: string, zones?: Zone[], tables?: RestaurantTable[]) {
  const res = await fetch(`${FN}/layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      restaurantId,
      zones: zones?.map(zoneToRow),
      tables: tables?.map(tableToRow),
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Error guardando layout');
  return body;
}

export async function reserveTable(input: {
  restaurantId: string;
  tableId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  date: string;
  time: string;
  partySize: number;
  notes?: string;
}) {
  const res = await fetch(`${FN}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      restaurantId: input.restaurantId,
      tableId: input.tableId,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      date: input.date,
      timeStart: input.time,
      timeEnd: slotEnd(input.time),
      partySize: input.partySize,
      notes: input.notes,
    }),
  });
  const body = await res.json();
  if (!res.ok) return { ok: false as const, message: body.error ?? 'Error al reservar' };
  return { ok: true as const, reservationId: body.reservationId as string };
}

// ---------- Realtime ----------

export function subscribeCanvas(onChange: () => void) {
  const channel = supabase
    .channel('canvas-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, onChange)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
