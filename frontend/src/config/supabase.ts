import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  console.warn('[supabase] Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env');
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    // Persiste la sesión en localStorage y la restaura al recargar/navegar.
    persistSession: true,
    // Refresca el token de acceso automáticamente antes de expirar.
    autoRefreshToken: true,
    // Detecta tokens en la URL tras confirmar el correo (magic link / signup).
    detectSessionInUrl: true,
    storageKey: 'capirucho-auth',
  },
});
