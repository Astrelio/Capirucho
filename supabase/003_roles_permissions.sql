-- ============================================
-- MIGRACION 003: roles funcionales + permisos de escritura + menu en BD
-- Ejecutar COMPLETO en SQL Editor:
-- https://supabase.com/dashboard/project/nabytadijabadalfmbwa/sql/new
-- Idempotente: seguro de correr varias veces.
-- ============================================

-- ---------- 1) Columnas que pueden faltar (por si no corriste 002) ----------

alter table restaurants add column if not exists canvas_width_m  numeric default 20;
alter table restaurants add column if not exists canvas_height_m numeric default 15;

alter table zones add column if not exists zone_type text default 'comedor';
alter table zones drop constraint if exists zones_zone_type_check;
alter table zones add constraint zones_zone_type_check
  check (zone_type in ('comedor','cocina','baño','pista_baile','jardin','barra'));

alter table tables add column if not exists rotation int default 0;

-- Formas alineadas con el frontend (sin 'booth')
alter table tables drop constraint if exists tables_shape_check;
update tables set shape = 'square' where shape not in ('round','square','rectangle','circle');
alter table tables add constraint tables_shape_check
  check (shape in ('round','square','rectangle','circle'));

-- Email en profiles (para la pagina de Usuarios del admin)
alter table profiles add column if not exists email text;
update profiles p
set email = u.email
from auth.users u
where u.id = p.user_id and (p.email is null or p.email = '');

-- ---------- 2) Trigger: crear perfil al registrarse ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, phone, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    new.email,
    'customer'
  )
  on conflict (user_id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: usuarios existentes sin perfil
insert into public.profiles (user_id, full_name, phone, email, role)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name', ''),
       u.raw_user_meta_data->>'phone',
       u.email,
       'customer'
from auth.users u
where not exists (select 1 from public.profiles p where p.user_id = u.id);

-- ---------- 3) Helpers de rol (security definer evita recursion en RLS) ----------

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where user_id = auth.uid()),
    'customer'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_my_role() in ('admin','super_admin');
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_my_role() = 'super_admin';
$$;

grant execute on function public.get_my_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_super_admin() to anon, authenticated;

-- ---------- 4) RLS: lectura publica + escritura por rol ----------

alter table restaurants enable row level security;
alter table zones enable row level security;
alter table tables enable row level security;
alter table reservations enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table reviews enable row level security;
alter table waitlist enable row level security;
alter table profiles enable row level security;

-- Lectura publica (necesaria para el mapa y el menu)
drop policy if exists "public read" on restaurants;
create policy "public read" on restaurants for select using (true);
drop policy if exists "public read" on zones;
create policy "public read" on zones for select using (true);
drop policy if exists "public read" on tables;
create policy "public read" on tables for select using (true);
drop policy if exists "public read" on reservations;
create policy "public read" on reservations for select using (true);
drop policy if exists "public read" on menu_categories;
create policy "public read" on menu_categories for select using (true);
drop policy if exists "public read" on menu_items;
create policy "public read" on menu_items for select using (true);
drop policy if exists "public read" on reviews;
create policy "public read" on reviews for select using (true);

-- Escritura del layout (zonas, mesas, lienzo): admin y super_admin
drop policy if exists "admin update restaurant" on restaurants;
create policy "admin update restaurant" on restaurants
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin write zones" on zones;
create policy "admin write zones" on zones
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin write tables" on tables;
create policy "admin write tables" on tables
  for all using (public.is_admin()) with check (public.is_admin());

-- Menu: admin y super_admin
drop policy if exists "admin write menu_categories" on menu_categories;
create policy "admin write menu_categories" on menu_categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin write menu_items" on menu_items;
create policy "admin write menu_items" on menu_items
  for all using (public.is_admin()) with check (public.is_admin());

-- Perfiles: cada quien lee el suyo, admins leen todos, solo super_admin edita roles
drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles
  for select using (auth.uid() = user_id);

drop policy if exists "admin read profiles" on profiles;
create policy "admin read profiles" on profiles
  for select using (public.is_admin());

drop policy if exists "super admin update profiles" on profiles;
create policy "super admin update profiles" on profiles
  for update using (public.is_super_admin()) with check (public.is_super_admin());

-- Reservaciones: admins pueden gestionarlas (cambiar estado, cancelar)
drop policy if exists "admin write reservations" on reservations;
create policy "admin write reservations" on reservations
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 5) Seed del menu (categorias + platillos) ----------

do $$
declare
  v_rest uuid;
  v_entradas uuid;
  v_fuertes uuid;
  v_postres uuid;
  v_bebidas uuid;
begin
  select id into v_rest from restaurants where slug = 'el-capirucho';
  if v_rest is null then
    raise notice 'Restaurante el-capirucho no existe; corre schema.sql primero';
    return;
  end if;

  -- Categorias
  select id into v_entradas from menu_categories where restaurant_id = v_rest and name = 'Entradas';
  if v_entradas is null then
    insert into menu_categories (restaurant_id, name, sort_order) values (v_rest, 'Entradas', 1) returning id into v_entradas;
  end if;

  select id into v_fuertes from menu_categories where restaurant_id = v_rest and name = 'Platos Fuertes';
  if v_fuertes is null then
    insert into menu_categories (restaurant_id, name, sort_order) values (v_rest, 'Platos Fuertes', 2) returning id into v_fuertes;
  end if;

  select id into v_postres from menu_categories where restaurant_id = v_rest and name = 'Postres';
  if v_postres is null then
    insert into menu_categories (restaurant_id, name, sort_order) values (v_rest, 'Postres', 3) returning id into v_postres;
  end if;

  select id into v_bebidas from menu_categories where restaurant_id = v_rest and name = 'Bebidas';
  if v_bebidas is null then
    insert into menu_categories (restaurant_id, name, sort_order) values (v_rest, 'Bebidas', 4) returning id into v_bebidas;
  end if;

  -- Platillos (solo si no existen por nombre)
  insert into menu_items (restaurant_id, category_id, name, description, price, image_url, available)
  select v_rest, x.cat, x.name, x.descr, x.price, x.img, true
  from (values
    (v_entradas, 'Ceviche Tradicional', 'Pesca del día curada en cítricos, con ají y camote dulce.', 22.00,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZbThG4zDsMoaM_MMPbcodtvGtvgzTVFiuxmPmzMtDCifM2ZrZQviI2Rd-Dsf5TO0Q196wHDkQzPEFhpb1o7gAT_e9KhS4p7D-s49hnDUmn34ifVbCFObzOSfnbDJY4dJeiwRNdsAeVB1JjvKvZ62wsBZbpvsqD5lMJpWxlHyJMpEPvfKZux1At2QBvRe1NxjlK9oNvEtPEx9cgls15TOZroY9BqVH4enK9ImRBIhCjIwvUZgoUYyU8sn94RAilZleTL7SXjM_4rM'),
    (v_entradas, 'Tiradito de Pescado', 'Láminas finas de pescado fresco en leche de tigre cítrica con toque de chile.', 20.00,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZbThG4zDsMoaM_MMPbcodtvGtvgzTVFiuxmPmzMtDCifM2ZrZQviI2Rd-Dsf5TO0Q196wHDkQzPEFhpb1o7gAT_e9KhS4p7D-s49hnDUmn34ifVbCFObzOSfnbDJY4dJeiwRNdsAeVB1JjvKvZ62wsBZbpvsqD5lMJpWxlHyJMpEPvfKZux1At2QBvRe1NxjlK9oNvEtPEx9cgls15TOZroY9BqVH4enK9ImRBIhCjIwvUZgoUYyU8sn94RAilZleTL7SXjM_4rM'),
    (v_entradas, 'Yuca Frita con Chicharrón', 'Yuca dorada y crujiente con chicharrón de cerdo y curtido de la casa.', 14.00,
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=900&q=80'),
    (v_entradas, 'Pupusas Gourmet', 'Trío de pupusas artesanales de queso, chicharrón y loroco, con curtido fermentado.', 12.00,
      'https://images.unsplash.com/photo-1625938145744-e380515399b7?w=900&q=80'),
    (v_fuertes, 'Costilla Estofada', 'Costilla de res cocida a fuego lento con hierbas rústicas, sobre puré cremoso de maíz.', 28.00,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCyazzAfwBAjo0dJ4n0PYjjUD2FszQFsPvj-n9EqhGdOEaBYdShDIfbxA4IZ60WIH9qxkIC52r-02qt0r10GOCBIL6AjJLqMsRyZ1xdKGZb0XorxhtxotuEnwBiwBQ3cH_i5ikcp5u0kHDOqa_8w5rO4-wfvXq8H8HPBqNu5QV_7KSeEXjI0pjHrb1MV9Rk0OnRRGsZxE2etNqNijrhmojv9rAb2xP9QSXtbzjTUZSWvGm2E_63BvQ0ly83hDIgW8ZlI74b2S3orE'),
    (v_fuertes, 'Parrillada de la Casa', 'Carnes a la parrilla y vegetales rostizados en salsa brillante, servidos en hierro fundido.', 34.00,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAADo0thPmFSgo2cs-rbEedL_JSyQsz4bhcDURgMs6bJGFjRoLm6LWfF5wSI0aBet9DtfiWxMmj8JtSp-H5LCeyCDMGZe22VGf5XNdwgxBeYTVnu6G34ruVS4516it6yUcIy7SMTpnnp8mAxPXSgsv7-v4MaquOHnrj5y7-7GZK5r8cSujIKyzUjcIYjOBlycYpOb5sCR3_IPJ1dKAFkdqvG7AnUk4HBf1jfCQLJrOtGRvs4jpSAX7cwbq6plpoB7_rLi2s_xe_A8E'),
    (v_fuertes, 'Brasa Ancestral', 'Nuestro corte insignia al fuego de leña, con granos criollos y raíces rostizadas.', 30.00,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAADo0thPmFSgo2cs-rbEedL_JSyQsz4bhcDURgMs6bJGFjRoLm6LWfF5wSI0aBet9DtfiWxMmj8JtSp-H5LCeyCDMGZe22VGf5XNdwgxBeYTVnu6G34ruVS4516it6yUcIy7SMTpnnp8mAxPXSgsv7-v4MaquOHnrj5y7-7GZK5r8cSujIKyzUjcIYjOBlycYpOb5sCR3_IPJ1dKAFkdqvG7AnUk4HBf1jfCQLJrOtGRvs4jpSAX7cwbq6plpoB7_rLi2s_xe_A8E'),
    (v_fuertes, 'Pollo en Crema de Loroco', 'Pechuga dorada en crema de loroco con arroz aromático y vegetales de temporada.', 24.00,
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=900&q=80'),
    (v_fuertes, 'Pescado a la Talla', 'Pescado entero a las brasas con adobo rojo, tortillas hechas a mano y salsas.', 32.00,
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=900&q=80'),
    (v_postres, 'Volcán de Chocolate', 'Pastel tibio de chocolate fundido con especias locales y helado de vainilla.', 12.00,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQGTdDpN8s9h6bdK6N9snj8sLPGey-yBNom_qIzsaQGlTKn8IDFXJUZ-_1M_ZC3z8sM98a2EojxpkQS1RSFB7k4swkStF4hGhcnowFAFE92Gaz4Vve9dcyu6LXLKZxUI1XLkzPY47_b_DCfsg2UENPwer_J0CRWncvTED0eWS8HCbod8bhibxgvI2SqtWoE6ft5lFMkd2sMj6V_1i-H0WzZk5mVVZeRC87bMWFgEdyiPI3s02H6e6z4XMEHrfYOSzRW28DJNsjQwQ'),
    (v_postres, 'Flan de Café de Altura', 'Flan sedoso infusionado con café de montaña y caramelo quemado.', 10.00,
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=900&q=80'),
    (v_postres, 'Semita Alta de Piña', 'Versión de autor del clásico hojaldre relleno de piña, con crema batida.', 9.00,
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80'),
    (v_bebidas, 'Horchata de Morro', 'Horchata artesanal de semilla de morro, servida bien fría.', 6.00,
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=900&q=80'),
    (v_bebidas, 'Fresco de Tamarindo', 'Refresco natural de tamarindo con un toque de panela.', 5.00,
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=900&q=80'),
    (v_bebidas, 'Café de la Finca', 'Café de altura de finca local, prensa francesa o espresso.', 4.50,
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80')
  ) as x(cat, name, descr, price, img)
  where not exists (
    select 1 from menu_items mi where mi.restaurant_id = v_rest and mi.name = x.name
  );
end $$;

-- ---------- 6) HAZTE SUPER ADMIN ----------
-- Cambia el correo por el tuyo (el que usaste para registrarte) y corre esta linea:
--
-- update profiles set role = 'super_admin'
-- where user_id = (select id from auth.users where email = 'TU-CORREO@ejemplo.com');
--
-- Roles disponibles: 'customer', 'waiter', 'admin', 'super_admin'.
-- Con super_admin puedes asignar los demas roles desde /admin/users en la app.
