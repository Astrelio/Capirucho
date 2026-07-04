-- ============================================
-- MIGRACION AUTH: perfil automatico + RLS profiles
-- Ejecutar en SQL Editor:
-- https://supabase.com/dashboard/project/nabytadijabadalfmbwa/sql/new
-- ============================================

-- Trigger: crea fila en profiles al registrarse un usuario
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: cada usuario lee/actualiza su propio perfil
drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles
  for select using (auth.uid() = user_id);

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles
  for update using (auth.uid() = user_id);

-- Backfill: perfiles para usuarios ya existentes sin perfil
insert into public.profiles (user_id, full_name, role)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', ''), 'customer'
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;
