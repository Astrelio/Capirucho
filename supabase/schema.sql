-- ============================================
-- EL CAPIRUCHO - Schema completo (Supabase)
-- Ejecutar en SQL Editor de supabase.com
-- ============================================

-- ---------- TABLAS ----------

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  address text,
  phone text,
  logo_url text,
  cover_url text,
  layout_json jsonb default '{}',
  canvas_width_m numeric default 20,
  canvas_height_m numeric default 15,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role text default 'customer' check (role in ('customer','waiter','admin','super_admin')),
  restaurant_id uuid references restaurants(id),
  created_at timestamptz default now()
);

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  color text default '#555555',
  zone_type text default 'comedor' check (zone_type in ('comedor','cocina','baño','pista_baile','jardin','barra')),
  position_x float default 0,
  position_y float default 0,
  width float default 400,
  height float default 300,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  zone_id uuid not null references zones(id) on delete cascade,
  label text not null,
  seats int not null default 4,
  shape text default 'square' check (shape in ('round','square','rectangle','circle')),
  position_x float default 0,
  position_y float default 0,
  width float default 80,
  height float default 80,
  status text default 'available' check (status in ('available','occupied','reserved','blocked')),
  rotation int default 0,
  created_at timestamptz default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_id uuid references tables(id) on delete set null,
  user_id uuid references auth.users(id),
  guest_name text not null,
  guest_email text,
  guest_phone text,
  date date not null,
  time_start time not null,
  time_end time not null,
  party_size int not null default 2,
  status text default 'pending' check (status in ('pending','confirmed','seated','completed','cancelled','no_show')),
  notes text,
  created_at timestamptz default now()
);

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  guest_name text not null,
  guest_phone text,
  guest_email text,
  party_size int not null default 2,
  status text default 'waiting' check (status in ('waiting','notified','seated','expired')),
  created_at timestamptz default now()
);

create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  sort_order int default 0
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  ai_generated boolean default false,
  available boolean default true,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id uuid references auth.users(id),
  guest_name text,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  sentiment text check (sentiment in ('positive','negative','neutral')),
  sentiment_summary text,
  created_at timestamptz default now()
);

-- ---------- INDICES ----------

create index if not exists idx_reservations_date on reservations(restaurant_id, date, time_start);
create index if not exists idx_reservations_table on reservations(table_id, date);
create index if not exists idx_tables_zone on tables(zone_id);
create index if not exists idx_tables_restaurant on tables(restaurant_id);

-- ---------- RPC: atomic_reserve (anti-colision) ----------

create or replace function atomic_reserve(
  p_restaurant_id uuid,
  p_table_id uuid,
  p_user_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_date date,
  p_time_start time,
  p_time_end time,
  p_party_size int,
  p_notes text default null
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_conflict int;
  v_reservation_id uuid;
begin
  -- Bloquea la mesa: serializa reservas concurrentes sobre la misma mesa
  perform 1 from tables where id = p_table_id for update;

  select count(*) into v_conflict
  from reservations
  where table_id = p_table_id
    and date = p_date
    and status in ('pending','confirmed','seated')
    and (p_time_start, p_time_end) overlaps (time_start, time_end);

  if v_conflict > 0 then
    raise exception 'COLLISION: Mesa ya reservada en ese horario';
  end if;

  insert into reservations (
    restaurant_id, table_id, user_id, guest_name, guest_email, guest_phone,
    date, time_start, time_end, party_size, status, notes
  ) values (
    p_restaurant_id, p_table_id, p_user_id, p_guest_name, p_guest_email, p_guest_phone,
    p_date, p_time_start, p_time_end, p_party_size, 'confirmed', p_notes
  ) returning id into v_reservation_id;

  return v_reservation_id;
end;
$$;

-- ---------- ROW LEVEL SECURITY ----------
-- El frontend usa la anon key (publica, incrustada en el bundle de Vite).
-- Sin RLS, cualquiera con esa key puede leer/escribir TODAS las tablas via
-- PostgREST (PII de clientes, auto-escalar su rol a admin, etc.).
-- Estas politicas cierran ese hueco. security definer + search_path fijo evita
-- recursion de RLS y secuestro de search_path.

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

-- Evita que un usuario autenticado se auto-escale el rol via UPDATE directo.
-- auth.uid() es null para service_role / SQL editor, que si pueden asignar roles.
create or replace function prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null
     and new.role is distinct from old.role
     and not is_admin() then
    raise exception 'No autorizado para cambiar el rol';
  end if;
  return new;
end;
$$;

alter table restaurants     enable row level security;
alter table profiles        enable row level security;
alter table zones           enable row level security;
alter table tables          enable row level security;
alter table reservations    enable row level security;
alter table waitlist        enable row level security;
alter table menu_categories enable row level security;
alter table menu_items      enable row level security;
alter table reviews         enable row level security;

-- Datos publicos del sitio (solo lectura para todos; escritura solo admin).
drop policy if exists restaurants_read on restaurants;
create policy restaurants_read on restaurants for select using (true);
drop policy if exists restaurants_write on restaurants;
create policy restaurants_write on restaurants for all using (is_admin()) with check (is_admin());

drop policy if exists zones_read on zones;
create policy zones_read on zones for select using (true);
drop policy if exists zones_write on zones;
create policy zones_write on zones for all using (is_admin()) with check (is_admin());

drop policy if exists tables_read on tables;
create policy tables_read on tables for select using (true);
drop policy if exists tables_write on tables;
create policy tables_write on tables for all using (is_admin()) with check (is_admin());

drop policy if exists menu_categories_read on menu_categories;
create policy menu_categories_read on menu_categories for select using (true);
drop policy if exists menu_categories_write on menu_categories;
create policy menu_categories_write on menu_categories for all using (is_admin()) with check (is_admin());

drop policy if exists menu_items_read on menu_items;
create policy menu_items_read on menu_items for select using (true);
drop policy if exists menu_items_write on menu_items;
create policy menu_items_write on menu_items for all using (is_admin()) with check (is_admin());

-- Perfiles: cada quien ve/edita el suyo; admins todo. El rol lo protege el trigger.
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select
  using (user_id = auth.uid() or is_admin());
drop policy if exists profiles_insert on profiles;
create policy profiles_insert on profiles for insert
  with check (user_id = auth.uid() or is_admin());
drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles for update
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());
drop trigger if exists trg_prevent_role_escalation on profiles;
create trigger trg_prevent_role_escalation
  before update on profiles
  for each row execute function prevent_role_escalation();

-- Reservas: contienen PII. El cliente solo ve las suyas; admin todo.
-- Las inserciones van por atomic_reserve() (security definer), no directo.
drop policy if exists reservations_select on reservations;
create policy reservations_select on reservations for select
  using (user_id = auth.uid() or is_admin());
drop policy if exists reservations_modify on reservations;
create policy reservations_modify on reservations for update
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());
drop policy if exists reservations_delete on reservations;
create policy reservations_delete on reservations for delete
  using (is_admin());

-- Waitlist: cualquiera puede anotarse; solo admin la lee/gestiona.
drop policy if exists waitlist_insert on waitlist;
create policy waitlist_insert on waitlist for insert with check (true);
drop policy if exists waitlist_manage on waitlist;
create policy waitlist_manage on waitlist for select using (is_admin());
drop policy if exists waitlist_update on waitlist;
create policy waitlist_update on waitlist for update using (is_admin()) with check (is_admin());
drop policy if exists waitlist_delete on waitlist;
create policy waitlist_delete on waitlist for delete using (is_admin());

-- Reseñas: lectura publica; cualquiera puede dejar una; admin modera.
drop policy if exists reviews_read on reviews;
create policy reviews_read on reviews for select using (true);
drop policy if exists reviews_insert on reviews;
create policy reviews_insert on reviews for insert with check (true);
drop policy if exists reviews_update on reviews;
create policy reviews_update on reviews for update
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());
drop policy if exists reviews_delete on reviews;
create policy reviews_delete on reviews for delete using (is_admin());

-- Permite invocar el RPC de reserva sin exponer INSERT directo a reservations.
grant execute on function atomic_reserve(
  uuid, uuid, uuid, text, text, text, date, time, time, int, text
) to anon, authenticated;

-- ---------- REALTIME ----------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'restaurants'
  ) then
    alter publication supabase_realtime add table restaurants;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'zones'
  ) then
    alter publication supabase_realtime add table zones;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'tables'
  ) then
    alter publication supabase_realtime add table tables;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'reservations'
  ) then
    alter publication supabase_realtime add table reservations;
  end if;
end $$;

-- ---------- SEED: restaurante demo ----------

insert into restaurants (name, slug, description, address, phone)
values (
  'El Capirucho',
  'el-capirucho',
  'Traditional Heritage, Modern Taste. Experience the warmth of our hearth.',
  '123 Culinary Ave, Gourmet City',
  '+503 0000-0000'
)
on conflict (slug) do nothing;
