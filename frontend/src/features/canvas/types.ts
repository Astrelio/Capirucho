export type TableShape = 'round' | 'square' | 'rectangle';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'blocked';
export type AvailabilityStatus = 'available' | 'reserved' | 'blocked' | 'too_small';

export type ZoneType = 'comedor' | 'cocina' | 'baño' | 'pista_baile' | 'jardin' | 'barra';

/** Escala visual: 1 metro = PX_PER_METER px en el lienzo. */
export const PX_PER_METER = 50;

export const metersToPx = (meters: number) => Math.round(meters * PX_PER_METER);
export const pxToMeters = (px: number) => Math.round((px / PX_PER_METER) * 10) / 10;

/** Catálogo de tipos de zona arquitectónica (label + color por defecto). */
export const ZONE_TYPES: { value: ZoneType; label: string; color: string }[] = [
  { value: 'comedor', label: 'Comedor', color: '#a03b28' },
  { value: 'cocina', label: 'Cocina', color: '#964900' },
  { value: 'baño', label: 'Baño', color: '#386739' },
  { value: 'pista_baile', label: 'Pista de baile', color: '#7b3fa0' },
  { value: 'jardin', label: 'Jardín', color: '#508050' },
  { value: 'barra', label: 'Barra', color: '#8a716d' },
];

export const ZONE_TYPE_LABELS: Record<ZoneType, string> = ZONE_TYPES.reduce(
  (acc, z) => ({ ...acc, [z.value]: z.label }),
  {} as Record<ZoneType, string>,
);

export const TABLE_SHAPES: { value: TableShape; label: string }[] = [
  { value: 'round', label: 'Redonda' },
  { value: 'square', label: 'Cuadrada' },
  { value: 'rectangle', label: 'Rectangular' },
];

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/** Configuración global del terreno/lienzo, en metros. */
export interface CanvasConfig {
  widthM: number;
  heightM: number;
}

export const DEFAULT_CANVAS: CanvasConfig = { widthM: 20, heightM: 15 };

export interface Zone {
  id: string;
  restaurantId: string;
  name: string;
  color: string;
  zoneType: ZoneType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  zoneId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: TableShape;
  seats: number;
  rotation: number;
  status: TableStatus;
}

export interface ReservationSlot {
  tableId: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: string;
}

export interface CanvasData {
  restaurant: Restaurant;
  canvas: CanvasConfig;
  zones: Zone[];
  tables: RestaurantTable[];
}

export interface AvailabilityResult {
  table: RestaurantTable;
  status: AvailabilityStatus;
  label: string;
}
