-- ============================================
-- FIX: elimina triggers rotos sobre auth.users y recrea el correcto.
-- Ejecutar COMPLETO en SQL Editor:
-- https://supabase.com/dashboard/project/nabytadijabadalfmbwa/sql/new
-- ============================================

-- 1) Ver triggers actuales (informativo, aparece en Results)
select tgname, p.proname
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
where tgrelid = 'auth.users'::regclass and not tgisinternal;

-- 2) Dropear TODOS los triggers de usuario sobre auth.users
do $$
declare r record;
begin
  for r in
    select tgname from pg_trigger
    where tgrelid = 'auth.users'::regclass and not tgisinternal
  loop
    execute format('drop trigger if exists %I on auth.users', r.tgname);
  end loop;
end $$;

-- 3) Funciones huerfanas del schema viejo (nombres comunes)
drop function if exists public.handle_new_user() cascade;
drop function if exists public.create_profile_for_user() cascade;
drop function if exists public.on_new_user() cascade;

-- 4) Recrear trigger correcto -> inserta en profiles (snake_case)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) RLS de profiles (idempotente)
alter table profiles enable row level security;

drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles
  for select using (auth.uid() = user_id);

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles
  for update using (auth.uid() = user_id);

-- 6) Backfill perfiles faltantes
insert into public.profiles (user_id, full_name, role)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', ''), 'customer'
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;
