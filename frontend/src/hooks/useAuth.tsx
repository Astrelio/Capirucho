import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import {
  getUserRole,
  signIn as svcSignIn,
  signOut as svcSignOut,
  type UserRole,
} from '../services/authService';

interface AuthContextValue {
  session: Session | null;
  role: UserRole | null;
  /** True mientras se resuelve la sesión inicial de Supabase. */
  loading: boolean;
  /** True mientras se consulta el rol del perfil (tras tener sesión). */
  roleLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<UserRole>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  // 1) Sincronización de SESIÓN: getSession() inicial + suscripción a cambios.
  //    OJO: dentro del callback NO llamamos a otras funciones de Supabase
  //    (p.ej. .from()) para evitar el deadlock del cliente de supabase-js.
  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // 2) Sincronización de ROL: reacciona al usuario de la sesión, fuera del
  //    callback de auth. Ante fallo, degrada a 'customer' (menor privilegio).
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    let active = true;

    if (!userId) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    getUserRole(userId)
      .then((r) => {
        if (active) setRole(r);
      })
      .catch(() => {
        if (active) setRole('customer');
      })
      .finally(() => {
        if (active) setRoleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const nextSession = await svcSignIn(email, password);
    setSession(nextSession);
    // Resolvemos el rol de inmediato para poder redirigir sin esperar el effect.
    const nextRole = await getUserRole(nextSession.user.id).catch(() => 'customer' as UserRole);
    setRole(nextRole);
    return nextRole;
  }, []);

  const signOut = useCallback(async () => {
    await svcSignOut();
    setSession(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      role,
      loading,
      roleLoading,
      isAuthenticated: session != null,
      signIn,
      signOut,
    }),
    [session, role, loading, roleLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}
