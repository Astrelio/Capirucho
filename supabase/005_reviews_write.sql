-- ============================================
-- Reseñas: políticas de escritura + RPCs
-- Ejecutar en SQL Editor de Supabase (idempotente).
-- ============================================

create index if not exists idx_reviews_restaurant_created
  on public.reviews (restaurant_id, created_at desc);

create unique index if not exists idx_reviews_one_per_user
  on public.reviews (restaurant_id, user_id)
  where user_id is not null;

drop policy if exists "authenticated insert own" on public.reviews;
create policy "authenticated insert own" on public.reviews
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and rating >= 1
    and rating <= 5
    and comment is not null
    and trim(comment) <> ''
  );

drop policy if exists "admin delete" on public.reviews;
create policy "admin delete" on public.reviews
  for delete
  to authenticated
  using (public.is_admin());

-- RPC: publicar reseña (bypass RLS de forma segura)
create or replace function public.submit_review(
  p_restaurant_id uuid,
  p_rating int,
  p_comment text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_guest_name text;
  v_review_id uuid;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED: Debes iniciar sesión para publicar una reseña.';
  end if;

  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'INVALID_RATING: Selecciona una calificación entre 1 y 5 estrellas.';
  end if;

  if p_comment is null or length(trim(p_comment)) < 10 then
    raise exception 'INVALID_COMMENT: El comentario debe tener al menos 10 caracteres.';
  end if;

  select coalesce(nullif(trim(full_name), ''), nullif(trim(email), ''))
    into v_guest_name
    from public.profiles
    where user_id = v_user_id;

  if v_guest_name is null then
    select coalesce(
      nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(u.email), '')
    )
    into v_guest_name
    from auth.users u
    where u.id = v_user_id;
  end if;

  v_guest_name := coalesce(v_guest_name, 'Cliente');

  insert into public.reviews (restaurant_id, user_id, guest_name, rating, comment)
  values (p_restaurant_id, v_user_id, v_guest_name, p_rating, trim(p_comment))
  returning id into v_review_id;

  return v_review_id;
exception
  when unique_violation then
    raise exception 'DUPLICATE: Ya publicaste una reseña. Solo se permite una por persona.';
end;
$$;

grant execute on function public.submit_review(uuid, int, text) to authenticated;

-- RPC: eliminar reseña (solo admin)
create or replace function public.delete_review(p_review_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN: No tienes permisos para eliminar reseñas.';
  end if;

  delete from public.reviews where id = p_review_id;
  if not found then
    raise exception 'NOT_FOUND: Reseña no encontrada';
  end if;

  return true;
end;
$$;

grant execute on function public.delete_review(uuid) to authenticated;
