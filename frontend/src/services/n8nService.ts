/** URL pública de la app (para links en el email). En local: http://localhost:5173 */
const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, '')
  ?? (typeof window !== 'undefined' ? window.location.origin : '');

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
const WEBHOOK_SECRET = import.meta.env.VITE_N8N_WEBHOOK_SECRET as string | undefined;

export type ReservationConfirmedPayload = {
  event: 'reservation.confirmed';
  reservationId: string;
  restaurantId: string;
  restaurantName: string;
  zoneName: string;
  tableName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  date: string;
  time: string;
  timeEnd: string;
  partySize: number;
  notes?: string;
  /** Link para ver la reserva en la app */
  viewUrl: string;
  /** Link con botón "Cancelar" del email */
  cancelUrl: string;
};

export function buildReservationUrls(reservationId: string, guestEmail: string, date: string, time: string) {
  const viewParams = new URLSearchParams({ date, time });
  return {
    viewUrl: `${APP_URL}/reservar/mapa?${viewParams.toString()}`,
    cancelUrl: `${APP_URL}/reservar/cancelar?id=${reservationId}&email=${encodeURIComponent(guestEmail)}`,
  };
}

/**
 * Dispara el workflow de n8n (fire-and-forget).
 * No bloquea la reserva si n8n falla o no está configurado.
 */
export function notifyReservationConfirmed(payload: ReservationConfirmedPayload): void {
  if (!WEBHOOK_URL) return;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (WEBHOOK_SECRET) headers['X-Webhook-Secret'] = WEBHOOK_SECRET;

  void fetch(WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  }).catch(() => {
    // La reserva ya quedó guardada; el email es secundario.
  });
}
