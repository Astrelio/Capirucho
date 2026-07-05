# n8n Cloud — Email de confirmación con Gmail (El Capirucho)

Este workflow envía un correo personalizado al cliente cuando confirma una reserva, con dos botones: **Ver reserva** y **Cancelar reservación**.

## 1. SQL en Supabase (una vez)

Ejecuta `supabase/004_cancel_reservation.sql` en el SQL Editor para que el botón "Cancelar" del email funcione.

## 2. Variables en `.env` del proyecto

```env
VITE_N8N_WEBHOOK_URL=https://TU-CUENTA.app.n8n.cloud/webhook/capirucho-reserva
VITE_N8N_WEBHOOK_SECRET=un-secreto-largo-opcional
VITE_APP_URL=http://localhost:5173
```

En producción cambia `VITE_APP_URL` por tu dominio (ej. `https://el-capirucho.netlify.app`).

Reinicia `npm run dev` después de editar `.env`.

## 3. Crear el workflow en n8n Cloud

### Nodo 1 — Webhook

| Campo | Valor |
|-------|--------|
| HTTP Method | POST |
| Path | `capirucho-reserva` |
| Authentication | Header Auth (opcional) |
| Header Name | `X-Webhook-Secret` |
| Header Value | el mismo que `VITE_N8N_WEBHOOK_SECRET` |

Activa el workflow y copia la **Production URL** → pégala en `VITE_N8N_WEBHOOK_URL`.

### Nodo 2 — Code (construir HTML del email)

Modo: **Run Once for All Items**. Pega este JavaScript:

```javascript
const p = $input.first().json;

const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;font-family:Georgia,serif;background:#f5efe6;color:#2c241d;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#fffdfa;border:1px solid #d8cdc0;border-radius:12px;">
    <tr>
      <td style="padding:32px 28px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#a03b28;">El Capirucho</p>
        <h1 style="margin:0 0 20px;font-size:26px;font-weight:normal;">Hola, ${p.guestName} 👋</h1>
        <p style="margin:0 0 16px;line-height:1.6;color:#6b5f54;">
          Tu reservación está <strong>confirmada</strong>. Te esperamos con gusto.
        </p>
        <table width="100%" style="margin:24px 0;background:#f8f4ee;border-radius:8px;">
          <tr><td style="padding:16px 20px;line-height:1.8;">
            <strong>Fecha:</strong> ${p.date}<br>
            <strong>Hora:</strong> ${p.time} – ${p.timeEnd}<br>
            <strong>Personas:</strong> ${p.partySize}<br>
            <strong>Zona:</strong> ${p.zoneName}<br>
            <strong>Mesa:</strong> ${p.tableName}
            ${p.notes ? `<br><strong>Notas:</strong> ${p.notes}` : ''}
          </td></tr>
        </table>
        <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
          <tr>
            <td style="padding-right:12px;">
              <a href="${p.viewUrl}" style="display:inline-block;padding:14px 24px;background:#a03b28;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Ver mi reserva</a>
            </td>
            <td>
              <a href="${p.cancelUrl}" style="display:inline-block;padding:14px 24px;background:transparent;color:#a03b28;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;border:2px solid #a03b28;">Cancelar reservación</a>
            </td>
          </tr>
        </table>
        <p style="margin:28px 0 0;font-size:13px;color:#8a716d;line-height:1.5;">
          Si no fuiste tú, ignora este correo o cancela desde el botón de arriba.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

return [{
  json: {
    to: p.guestEmail,
    subject: `Reserva confirmada — El Capirucho, ${p.date} a las ${p.time}`,
    html,
  },
}];
```

### Nodo 3 — Gmail

1. Conecta tu cuenta de Gmail (OAuth en n8n).
2. **To:** `{{ $json.to }}`
3. **Subject:** `{{ $json.subject }}`
4. **Email Type:** HTML
5. **Message:** `{{ $json.html }}`

### Conexión entre nodos

```
Webhook → Code → Gmail
```

## 4. Probar

1. Reserva una mesa en `/reservar/mapa` con **nombre y correo** reales.
2. En n8n → **Executions** debe aparecer la ejecución.
3. Revisa la bandeja de entrada (y spam).

Prueba manual del webhook:

```bash
curl -X POST "https://TU-CUENTA.app.n8n.cloud/webhook/capirucho-reserva" \
  -H "Content-Type: application/json" \
  -d "{\"event\":\"reservation.confirmed\",\"guestName\":\"Manuel\",\"guestEmail\":\"tu@gmail.com\",\"date\":\"2026-07-10\",\"time\":\"19:00\",\"timeEnd\":\"20:30\",\"partySize\":2,\"zoneName\":\"Comedor\",\"tableName\":\"M1\",\"restaurantName\":\"El Capirucho\",\"viewUrl\":\"http://localhost:5173/reservar/mapa\",\"cancelUrl\":\"http://localhost:5173/reservar/cancelar?id=test&email=tu@gmail.com\"}"
```

## Payload que envía la app

| Campo | Descripción |
|-------|-------------|
| `guestName` | Nombre del cliente |
| `guestEmail` | Correo (destino del Gmail) |
| `date`, `time`, `timeEnd` | Fecha y horario |
| `partySize` | Número de personas |
| `zoneName`, `tableName` | Ubicación en el restaurante |
| `viewUrl` | Botón "Ver mi reserva" |
| `cancelUrl` | Botón "Cancelar reservación" |
