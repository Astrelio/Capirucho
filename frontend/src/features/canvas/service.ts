import { supabase } from '../../config/supabase';
import {
  DEFAULT_CANVAS,
  type AvailabilityResult,
  type CanvasConfig,
  type CanvasData,
  type ReservationSlot,
  type Restaurant,
  type RestaurantTable,
  type TableShape,
  type TableStatus,
  type Zone,
  type ZoneType,
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
  zone_type: string | null;
  position_x: number; position_y: number; width: number; height: number;
};

type TableRow = {
  id: string; restaurant_id: string; zone_id: string; label: string;
  seats: number; shape: string; position_x: number; position_y: number;
  width: number; height: number; status: string; rotation: number | null;
};

const zoneFromRow = (r: ZoneRow): Zone => ({
  id: r.id, restaurantId: r.restaurant_id, name: r.name, color: r.color,
  zoneType: (r.zone_type as ZoneType | null) ?? 'comedor',
  x: r.position_x, y: r.position_y, width: r.width, height: r.height,
});

const zoneToRow = (z: Zone) => ({
  id: z.id, name: z.name, color: z.color, zone_type: z.zoneType,
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

type RestaurantRow = {
  id: string; name: string; slug: string; description: string | null;
  canvas_width_m: number | null; canvas_height_m: number | null;
};

/**
 * Carga el restaurante. Si la migración de canvas aún no se aplicó
 * (faltan columnas canvas_width_m/height_m), degrada a la selección básica
 * en lugar de fallar, usando los valores por defecto del lienzo.
 */
async function fetchRestaurantRow(): Promise<RestaurantRow> {
  const full = await supabase
    .from('restaurants')
    .select('id, name, slug, description, canvas_width_m, canvas_height_m')
    .eq('slug', RESTAURANT_SLUG)
    .single<RestaurantRow>();

  if (!full.error && full.data) return full.data;

  const basic = await supabase
    .from('restaurants')
    .select('id, name, slug, description')
    .eq('slug', RESTAURANT_SLUG)
    .single<Omit<RestaurantRow, 'canvas_width_m' | 'canvas_height_m'>>();

  if (basic.error || !basic.data) {
    throw new Error(basic.error?.message ?? full.error?.message ?? 'Restaurante no encontrado');
  }
  return { ...basic.data, canvas_width_m: null, canvas_height_m: null };
}

export async function loadCanvas(): Promise<CanvasData> {
  const rest = await fetchRestaurantRow();

  const [{ data: zones, error: zErr }, { data: tables, error: tErr }] = await Promise.all([
    supabase.from('zones').select('*').eq('restaurant_id', rest.id).order('sort_order'),
    supabase.from('tables').select('*').eq('restaurant_id', rest.id),
  ]);
  if (zErr) throw new Error(zErr.message);
  if (tErr) throw new Error(tErr.message);

  const canvas: CanvasConfig = {
    widthM: rest.canvas_width_m ?? DEFAULT_CANVAS.widthM,
    heightM: rest.canvas_height_m ?? DEFAULT_CANVAS.heightM,
  };

  const restaurant: Restaurant = {
    id: rest.id, name: rest.name, slug: rest.slug, description: rest.description,
  };

  return {
    restaurant,
    canvas,
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

export async function saveLayout(
  restaurantId: string,
  zones?: Zone[],
  tables?: RestaurantTable[],
  canvas?: CanvasConfig,
  tableScopeZoneIds?: string[],
) {
  const res = await fetch(`${FN}/layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      restaurantId,
      zones: zones?.map(zoneToRow),
      tables: tables?.map(tableToRow),
      canvas: canvas ? { width_m: canvas.widthM, height_m: canvas.heightM } : undefined,
      tableScopeZoneIds,
    }),
  });
  const body = await res.json().catch(() => ({ error: 'Respuesta inválida del servidor' }));
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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, onChange)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
