import type { Handler } from '@netlify/functions';
import { supabaseAdmin, json } from './_shared/supabase';

// POST /api/reserve
// body: { restaurantId, tableId, userId?, guestName, guestEmail?, guestPhone?, date, timeStart, timeEnd, partySize, notes? }
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const b = JSON.parse(event.body ?? '{}');
    const required = ['restaurantId', 'tableId', 'guestName', 'date', 'timeStart', 'timeEnd', 'partySize'];
    for (const k of required) {
      if (!b[k]) return json(400, { error: `${k} requerido` });
    }

    const { data, error } = await supabaseAdmin.rpc('atomic_reserve', {
      p_restaurant_id: b.restaurantId,
      p_table_id: b.tableId,
      p_user_id: b.userId ?? null,
      p_guest_name: b.guestName,
      p_guest_email: b.guestEmail ?? null,
      p_guest_phone: b.guestPhone ?? null,
      p_date: b.date,
      p_time_start: b.timeStart,
      p_time_end: b.timeEnd,
      p_party_size: b.partySize,
      p_notes: b.notes ?? null,
    });

    if (error) {
      const collision = error.message.includes('COLLISION');
      return json(collision ? 409 : 500, {
        error: collision ? 'Mesa ya reservada en ese horario' : error.message,
      });
    }

    // Webhook n8n post-reserva (no bloqueante)
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: data, ...b }),
      }).catch(() => {});
    }

    return json(200, { ok: true, reservationId: data });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
};
