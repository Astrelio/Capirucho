# El Capirucho

SaaS de reservas para restaurantes — Hackathon 24h Cursor Buildathon UFG.

## Stack

- **Frontend:** Vite + React 18 + TypeScript, React Router v6, React Flow, Recharts
- **Backend:** Netlify Functions (TypeScript)
- **DB:** Supabase (PostgreSQL + Realtime + Auth + Storage)
- **IA:** fal (imágenes), Mistral (NLP), OpenAI (queries), Minsky AtlasIQ (predicciones)
- **Orquestación:** n8n · **Scraping:** Firecrawl + Exa

## Arranque

```bash
# 1. Dependencias
npm install
npm install --prefix frontend

# 2. Variables de entorno
cp .env.example .env   # llenar keys

# 3. Supabase: crear proyecto en supabase.com y ejecutar supabase/schema.sql en el SQL Editor

# 4. Dev (frontend + functions)
npx netlify dev
# o solo frontend:
npm run dev --prefix frontend
```

## Verificación

```bash
npm run typecheck
npm run build
```

## Estructura

```
frontend/           # App Vite + React (src/features por dominio)
netlify/functions/  # Serverless functions (TS)
supabase/           # schema.sql (tablas + RPC atomic_reserve + realtime)
contexto/           # Plan del hackathon + diseño v1
skills/             # Skills de Cursor
```
