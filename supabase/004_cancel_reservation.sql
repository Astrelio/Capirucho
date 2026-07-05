-- ============================================
-- RPC: cancelar reserva (link del email de n8n)
-- Ejecutar en SQL Editor de Supabase (idempotente).
-- ============================================

create or replace function public.cancel_reservation(
  p_reservation_id uuid,
  p_guest_email text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row reservations%rowtype;
begin
  select * into v_row from reservations where id = p_reservation_id for update;

  if not found then
    raise exception 'NOT_FOUND: Reserva no encontrada';
  end if;

  if v_row.status in ('cancelled', 'completed', 'no_show') then
    raise exception 'ALREADY_CANCELLED: Esta reserva ya fue cancelada o finalizó';
  end if;

  -- Si la reserva tiene email, exige que coincida (evita cancelaciones ajenas).
  if v_row.guest_email is not null and trim(v_row.guest_email) <> '' then
    if p_guest_email is null or lower(trim(p_guest_email)) <> lower(trim(v_row.guest_email)) then
      raise exception 'FORBIDDEN: El correo no coincide con la reserva';
    end if;
  end if;

  update reservations set status = 'cancelled' where id = p_reservation_id;
  return true;
end;
$$;

grant execute on function public.cancel_reservation(uuid, text) to anon, authenticated;
