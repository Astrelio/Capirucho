-- ============================================
-- MIGRACION: soporte MicroCanva + lectura publica
-- Ejecutar en SQL Editor:
-- https://supabase.com/dashboard/project/nabytadijabadalfmbwa/sql/new
-- ============================================

-- Formas extra (round, booth) + rotacion
alter table tables drop constraint if exists tables_shape_check;
alter table tables add constraint tables_shape_check
  check (shape in ('round','square','rectangle','booth','circle'));
alter table tables add column if not exists rotation float default 0;

-- RLS: lectura publica (escrituras solo via functions con service role)
alter table restaurants enable row level security;
alter table zones enable row level security;
alter table tables enable row level security;
alter table reservations enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table reviews enable row level security;
alter table waitlist enable row level security;
alter table profiles enable row level security;

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
