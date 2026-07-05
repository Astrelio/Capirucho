import { supabase } from '../config/supabase';
import type { Dish } from '../data/dishes';

export const RESTAURANT_SLUG = 'el-capirucho';

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string | null;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  available: boolean;
}

export interface MenuData {
  restaurantId: string;
  categories: MenuCategory[];
  items: MenuItem[];
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80';

/** Convierte un platillo de BD al formato que renderizan las tarjetas. */
export function menuItemToDish(item: MenuItem, categories: MenuCategory[]): Dish {
  const category = categories.find((c) => c.id === item.categoryId);
  return {
    name: item.name,
    description: item.description,
    price: `$${item.price % 1 === 0 ? item.price : item.price.toFixed(2)}`,
    category: category?.name ?? 'Especiales',
    image: item.imageUrl || FALLBACK_IMAGE,
  };
}

function friendlyDbError(message: string): string {
  if (/row-level security/i.test(message)) {
    return 'No tienes permisos para editar el menú. Inicia sesión con una cuenta admin.';
  }
  return message;
}

let cachedRestaurantId: string | null = null;

export async function getRestaurantId(): Promise<string> {
  if (cachedRestaurantId) return cachedRestaurantId;
  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', RESTAURANT_SLUG)
    .single<{ id: string }>();
  if (error || !data) throw new Error(error?.message ?? 'Restaurante no encontrado');
  cachedRestaurantId = data.id;
  return data.id;
}

type CategoryRow = { id: string; name: string; sort_order: number | null };
type ItemRow = {
  id: string; category_id: string | null; name: string; description: string | null;
  price: number; image_url: string | null; available: boolean | null;
};

/**
 * Carga el menú completo. Con includeUnavailable (admin) trae también
 * los platillos marcados como no disponibles.
 */
export async function loadMenu(opts: { includeUnavailable?: boolean } = {}): Promise<MenuData> {
  const restaurantId = await getRestaurantId();

  let itemsQuery = supabase
    .from('menu_items')
    .select('id, category_id, name, description, price, image_url, available')
    .eq('restaurant_id', restaurantId)
    .order('created_at');
  if (!opts.includeUnavailable) itemsQuery = itemsQuery.eq('available', true);

  const [cats, items] = await Promise.all([
    supabase
      .from('menu_categories')
      .select('id, name, sort_order')
      .eq('restaurant_id', restaurantId)
      .order('sort_order'),
    itemsQuery,
  ]);
  if (cats.error) throw new Error(cats.error.message);
  if (items.error) throw new Error(items.error.message);

  return {
    restaurantId,
    categories: ((cats.data ?? []) as CategoryRow[]).map((c) => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sort_order ?? 0,
    })),
    items: ((items.data ?? []) as ItemRow[]).map((i) => ({
      id: i.id,
      categoryId: i.category_id,
      name: i.name,
      description: i.description ?? '',
      price: Number(i.price),
      imageUrl: i.image_url,
      available: i.available ?? true,
    })),
  };
}

// ---------- Escrituras (RLS exige rol admin/super_admin) ----------

export interface MenuItemInput {
  id?: string;
  categoryId: string | null;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  available: boolean;
}

export async function saveMenuItem(input: MenuItemInput): Promise<void> {
  const restaurantId = await getRestaurantId();
  const row = {
    restaurant_id: restaurantId,
    category_id: input.categoryId,
    name: input.name,
    description: input.description,
    price: input.price,
    image_url: input.imageUrl,
    available: input.available,
  };

  const { error } = input.id
    ? await supabase.from('menu_items').update(row).eq('id', input.id)
    : await supabase.from('menu_items').insert(row);
  if (error) throw new Error(friendlyDbError(error.message));
}

export async function setMenuItemAvailable(id: string, available: boolean): Promise<void> {
  const { error } = await supabase.from('menu_items').update({ available }).eq('id', id);
  if (error) throw new Error(friendlyDbError(error.message));
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw new Error(friendlyDbError(error.message));
}

export async function createCategory(name: string): Promise<void> {
  const restaurantId = await getRestaurantId();
  const { data } = await supabase
    .from('menu_categories')
    .select('sort_order')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = ((data?.[0]?.sort_order as number | undefined) ?? 0) + 1;

  const { error } = await supabase
    .from('menu_categories')
    .insert({ restaurant_id: restaurantId, name, sort_order: nextOrder });
  if (error) throw new Error(friendlyDbError(error.message));
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('menu_categories').delete().eq('id', id);
  if (error) throw new Error(friendlyDbError(error.message));
}
