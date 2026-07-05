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
