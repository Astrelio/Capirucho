import { createClient } from '@supabase/supabase-js';

// Lee una variable de entorno requerida y falla de forma explícita si falta,
// en lugar de propagar `undefined` a createClient y provocar errores opacos.
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[supabase] Falta la variable de entorno requerida: ${name}`);
  }
  return value;
};

// Cliente server-side con service role: bypass RLS. Solo usar en functions.
export const supabaseAdmin = createClient(
  requireEnv('SUPABASE_URL'),
  requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { persistSession: false } }
);

export const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
