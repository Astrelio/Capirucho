-- ============================================
-- Migración: Canvas arquitectónico (escala en metros,
-- zonas tipadas y mesas avanzadas). Ejecutar en SQL Editor.
-- Idempotente: seguro de correr varias veces.
-- ============================================

-- 1) Terreno / lienzo global (en metros) a nivel restaurante
alter table restaurants add column if not exists canvas_width_m  numeric default 20;
alter table restaurants add column if not exists canvas_height_m numeric default 15;

-- 2) Tipo arquitectónico de zona
alter table zones add column if not exists zone_type text default 'comedor';
alter table zones drop constraint if exists zones_zone_type_check;
alter table zones add constraint zones_zone_type_check
  check (zone_type in ('comedor','cocina','baño','pista_baile','jardin','barra'));

-- 3) Mesas avanzadas
--    - rotation (grados)
alter table tables add column if not exists rotation int default 0;

--    - formas soportadas (compat: 'circle' se mapea a 'round' en el front)
alter table tables drop constraint if exists tables_shape_check;
alter table tables add constraint tables_shape_check
  check (shape in ('round','square','rectangle','circle'));

-- Nota: `seats` (capacidad) ya existe en la tabla `tables`.
-- Las dimensiones reales en metros se derivan de width/height (px) usando
-- la constante PX_PER_METER=50 del front, por lo que no requieren columnas nuevas.

-- 4) Realtime para cambios del mapa completo
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
