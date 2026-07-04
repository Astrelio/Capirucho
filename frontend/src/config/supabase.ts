import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const missing = [
  !url && 'VITE_SUPABASE_URL',
  !anonKey && 'VITE_SUPABASE_ANON_KEY',
].filter(Boolean);

if (missing.length > 0) {
  // Fallar de forma explícita en lugar de crear un cliente con credenciales
  // vacías, que produce errores opacos en cada llamada a Supabase.
  throw new Error(
    `[supabase] Faltan variables de entorno requeridas: ${missing.join(', ')}. ` +
      'Defínelas en frontend/.env (ver .env.example).'
  );
}

export const supabase = createClient(url as string, anonKey as string);
