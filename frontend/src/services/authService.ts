import type { Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

export type UserRole = 'customer' | 'waiter' | 'admin' | 'super_admin';

const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin'];

/** Traduce los mensajes crudos de Supabase Auth a texto amigable en español. */
function friendlyError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión.',
    'missing email or phone': 'Ingresa tu correo y contraseña.',
  };
  return map[message] ?? message;
}

/** Inicia sesión con email/password. Lanza Error (traducido) si falla. */
export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendlyError(error.message));
  if (!data.session) throw new Error('No se pudo iniciar la sesión.');
  return data.session;
}

/** Registra un usuario nuevo. El perfil se crea vía trigger en la DB. */
export async function signUp(input: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName, phone: input.phone ?? null },
    },
  });
  if (error) throw new Error(friendlyError(error.message));
  // session null => proyecto requiere confirmación por email
  return data.session;
}

/** Envía email de recuperación de contraseña. */
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw new Error(friendlyError(error.message));
}

/** Cierra la sesión activa. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Devuelve la sesión actual (o null si no hay). */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

/**
 * Lee el rol del usuario desde la tabla `profiles`.
 * Si no existe perfil o no hay rol, se asume 'customer' (menor privilegio).
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.role as UserRole | undefined) ?? 'customer';
}

/** True si el rol tiene privilegios de administración del mapa. */
export function isAdminRole(role: UserRole | null): boolean {
  return role != null && ADMIN_ROLES.includes(role);
}

/** Rutas destino tras login según el rol (redirección inteligente). */
export const ADMIN_HOME = '/admin/layout';
export const PUBLIC_MAP = '/reservar/mapa';

export function roleHomePath(role: UserRole | null): string {
  return isAdminRole(role) ? ADMIN_HOME : PUBLIC_MAP;
}
