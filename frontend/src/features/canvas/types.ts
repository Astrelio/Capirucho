export type TableShape = 'round' | 'square' | 'rectangle' | 'booth';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'blocked';
export type AvailabilityStatus = 'available' | 'reserved' | 'blocked' | 'too_small';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Zone {
  id: string;
  restaurantId: string;
  name: string;
  color: string;
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
  zones: Zone[];
  tables: RestaurantTable[];
}

export interface AvailabilityResult {
  table: RestaurantTable;
  status: AvailabilityStatus;
  label: string;
}
