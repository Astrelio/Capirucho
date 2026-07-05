# El Capirucho

SaaS de reservas para restaurantes — Hackathon 24h Cursor Buildathon UFG.

## Stack

- **Frontend:** Vite + React 18 + TypeScript, React Router v6, React Flow, Recharts
- **DB:** Supabase (PostgreSQL + Realtime + Auth + RLS por roles + Storage)
- **IA:** fal (imágenes), Mistral (NLP), OpenAI (queries), Minsky AtlasIQ (predicciones)
- **Orquestación:** n8n · **Scraping:** Firecrawl + Exa

## Arranque

```bash
# 1. Dependencias
npm install
npm install --prefix frontend

# 2. Variables de entorno
cp .env.example .env   # llenar keys

# 3. Supabase: crear proyecto en supabase.com y ejecutar en el SQL Editor,
#    en este orden: supabase/schema.sql (o reset.sql) y supabase/003_roles_permissions.sql
#    Al final de 003 hay un snippet para asignarte el rol super_admin con tu correo.

# 4. Dev
npm run dev
```

## Verificación

```bash
npm run typecheck
npm run build
```

## Estructura

```
frontend/           # App Vite + React (src/features por dominio)
supabase/           # schema.sql + 003_roles_permissions.sql (RLS, roles, seed de menú)
contexto/           # Plan del hackathon + diseño v1
skills/             # Skills de Cursor
```

## Roles

| Rol | Permisos |
| --- | --- |
| customer | Reservar mesa (por defecto al registrarse) |
| waiter | Personal de piso (asignable) |
| admin | Editar mapa (zonas/mesas), menú y reservaciones |
| super_admin | Todo lo anterior + asignar roles en /admin/users |

## n8n — email de confirmación

Tras cada reserva exitosa la app llama tu webhook de n8n Cloud. Guía paso a paso (workflow Gmail + botones):

→ [docs/n8n-reserva-gmail.md](docs/n8n-reserva-gmail.md)

También ejecuta `supabase/004_cancel_reservation.sql` para el botón **Cancelar** del correo.
