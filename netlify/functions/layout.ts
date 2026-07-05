import type { Handler } from '@netlify/functions';
import { supabaseAdmin, json } from './_shared/supabase';

type ZonePayload = {
  id: string;
  name: string;
  color: string;
  zone_type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
};

type TablePayload = {
  id: string;
  zone_id: string;
  label: string;
  seats: number;
  shape: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  status: string;
  rotation: number;
};

type CanvasPatch = {
  canvas_width_m?: number;
  canvas_height_m?: number;
};

class RequestError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_COLOR_RE = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i;
const ZONE_TYPES = new Set(['comedor', 'cocina', 'baño', 'pista_baile', 'jardin', 'barra']);
const TABLE_SHAPES = new Set(['round', 'square', 'rectangle', 'circle']);
const TABLE_STATUSES = new Set(['available', 'occupied', 'reserved', 'blocked']);

function badRequest(message: string): never {
  throw new RequestError(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseBody(rawBody: string | null): Record<string, unknown> {
  if (!rawBody) badRequest('Body JSON requerido');

  try {
    const body: unknown = JSON.parse(rawBody);
    if (!isRecord(body)) badRequest('Body JSON debe ser un objeto');
    return body;
  } catch (error) {
    if (error instanceof RequestError) throw error;
    badRequest('JSON inválido');
  }
}

function readString(record: Record<string, unknown>, key: string, fallback?: string) {
  const value = record[key];
  if (value == null && fallback !== undefined) return fallback;
  if (typeof value !== 'string' || value.trim() === '') badRequest(`${key} inválido`);
  return value.trim();
}

function readUuid(record: Record<string, unknown>, key: string) {
  const value = readString(record, key);
  if (!UUID_RE.test(value)) badRequest(`${key} debe ser UUID`);
  return value;
}

function readNumber(
  record: Record<string, unknown>,
  key: string,
  options: { positive?: boolean; integer?: boolean; fallback?: number } = {},
) {
  const value = record[key];
  if (value == null && options.fallback !== undefined) return options.fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) badRequest(`${key} inválido`);
  if (options.positive && value <= 0) badRequest(`${key} debe ser mayor que 0`);
  if (options.integer && !Number.isInteger(value)) badRequest(`${key} debe ser entero`);
  return value;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function parseCanvas(value: unknown): CanvasPatch | undefined {
  if (value == null) return undefined;
  if (!isRecord(value)) badRequest('canvas debe ser un objeto');

  const patch: CanvasPatch = {};
  if (value.width_m != null) patch.canvas_width_m = readNumber(value, 'width_m', { positive: true });
  if (value.height_m != null) patch.canvas_height_m = readNumber(value, 'height_m', { positive: true });
  return Object.keys(patch).length > 0 ? patch : undefined;
}

function parseZones(value: unknown): ZonePayload[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) badRequest('zones debe ser un array');

  return value.map((item, index) => {
    if (!isRecord(item)) badRequest(`zones[${index}] debe ser un objeto`);

    const zoneType = readString(item, 'zone_type', 'comedor');
    if (!ZONE_TYPES.has(zoneType)) badRequest(`zones[${index}].zone_type inválido`);

    const color = readString(item, 'color');
    if (!HEX_COLOR_RE.test(color)) badRequest(`zones[${index}].color inválido`);

    return {
      id: readUuid(item, 'id'),
      name: readString(item, 'name'),
      color,
      zone_type: zoneType,
      position_x: readNumber(item, 'position_x'),
      position_y: readNumber(item, 'position_y'),
      width: readNumber(item, 'width', { positive: true }),
      height: readNumber(item, 'height', { positive: true }),
    };
  });
}

function parseTables(value: unknown): TablePayload[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) badRequest('tables debe ser un array');

  return value.map((item, index) => {
    if (!isRecord(item)) badRequest(`tables[${index}] debe ser un objeto`);

    const shape = readString(item, 'shape', 'square');
    if (!TABLE_SHAPES.has(shape)) badRequest(`tables[${index}].shape inválido`);

    const status = readString(item, 'status', 'available');
    if (!TABLE_STATUSES.has(status)) badRequest(`tables[${index}].status inválido`);

    return {
      id: readUuid(item, 'id'),
      zone_id: readUuid(item, 'zone_id'),
      label: readString(item, 'label'),
      seats: readNumber(item, 'seats', { positive: true, integer: true }),
      shape,
      position_x: readNumber(item, 'position_x'),
      position_y: readNumber(item, 'position_y'),
      width: readNumber(item, 'width', { positive: true }),
      height: readNumber(item, 'height', { positive: true }),
      status,
      rotation: readNumber(item, 'rotation', { fallback: 0 }),
    };
  });
}

function parseUuidList(value: unknown, key: string): string[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) badRequest(`${key} debe ser un array`);

  return unique(value.map((item, index) => {
    if (typeof item !== 'string' || !UUID_RE.test(item)) badRequest(`${key}[${index}] debe ser UUID`);
    return item;
  }));
}

async function assertZonesBelongToRestaurant(restaurantId: string, zoneIds: string[]) {
  if (zoneIds.length === 0) return;

  const { data, error } = await supabaseAdmin
    .from('zones')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .in('id', zoneIds);

  if (error) throw new Error(error.message);

  const found = new Set(((data ?? []) as Array<{ id: string }>).map((row) => row.id));
  const missing = zoneIds.filter((id) => !found.has(id));
  if (missing.length > 0) badRequest('Una o más zonas no pertenecen al restaurante');
}

async function replaceZones(restaurantId: string, zones: ZonePayload[]) {
  if (zones.length > 0) {
    const { error } = await supabaseAdmin.from('zones').upsert(
      zones.map((zone) => ({ ...zone, restaurant_id: restaurantId })),
    );
    if (error) throw new Error(error.message);
  }

  const { data, error } = await supabaseAdmin
    .from('zones')
    .select('id')
    .eq('restaurant_id', restaurantId);

  if (error) throw new Error(error.message);

  const keepIds = new Set(zones.map((zone) => zone.id));
  const staleIds = ((data ?? []) as Array<{ id: string }>)
    .map((row) => row.id)
    .filter((id) => !keepIds.has(id));

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabaseAdmin
      .from('zones')
      .delete()
      .eq('restaurant_id', restaurantId)
      .in('id', staleIds);
    if (deleteError) throw new Error(deleteError.message);
  }
}

async function replaceTables(restaurantId: string, tables: TablePayload[], scopeZoneIds: string[]) {
  await assertZonesBelongToRestaurant(restaurantId, unique([
    ...tables.map((table) => table.zone_id),
    ...scopeZoneIds,
  ]));

  if (scopeZoneIds.length > 0) {
    const outOfScope = tables.some((table) => !scopeZoneIds.includes(table.zone_id));
    if (outOfScope) badRequest('tables contiene mesas fuera de tableScopeZoneIds');
  }

  if (tables.length > 0) {
    const { error } = await supabaseAdmin.from('tables').upsert(
      tables.map((table) => ({ ...table, restaurant_id: restaurantId })),
    );
    if (error) throw new Error(error.message);
  }

  if (scopeZoneIds.length === 0) return;

  const { data, error } = await supabaseAdmin
    .from('tables')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .in('zone_id', scopeZoneIds);

  if (error) throw new Error(error.message);

  const keepIds = new Set(tables.map((table) => table.id));
  const staleIds = ((data ?? []) as Array<{ id: string }>)
    .map((row) => row.id)
    .filter((id) => !keepIds.has(id));

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabaseAdmin
      .from('tables')
      .delete()
      .eq('restaurant_id', restaurantId)
      .in('id', staleIds);
    if (deleteError) throw new Error(deleteError.message);
  }
}

// POST /api/layout
// Body: { restaurantId, zones?, tables?, canvas?, tableScopeZoneIds? }
// Zonas reemplazan el macro layout completo; mesas reemplazan solo el alcance indicado.
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = parseBody(event.body);
    const restaurantId = readUuid(body, 'restaurantId');
    const canvas = parseCanvas(body.canvas);
    const zones = parseZones(body.zones);
    const tables = parseTables(body.tables);
    const explicitTableScopeZoneIds = parseUuidList(body.tableScopeZoneIds, 'tableScopeZoneIds');

    if (canvas) {
      const { error } = await supabaseAdmin.from('restaurants').update(canvas).eq('id', restaurantId);
      if (error) throw new Error(error.message);
    }

    if (zones) await replaceZones(restaurantId, zones);

    if (tables) {
      const scopeZoneIds = explicitTableScopeZoneIds ?? unique(tables.map((table) => table.zone_id));
      await replaceTables(restaurantId, tables, scopeZoneIds);
    }

    return json(200, { ok: true });
  } catch (e) {
    if (e instanceof RequestError) return json(e.status, { error: e.message });
    return json(500, { error: (e as Error).message });
  }
};
