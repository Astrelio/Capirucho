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
  /** Resolución inicial de la sesión (primer render). */
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<UserRole>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Resuelve el rol asociado a una sesión; ante fallo asume 'customer'. */
async function resolveRole(session: Session | null): Promise<UserRole | null> {
  if (!session?.user) return null;
  try {
    return await getUserRole(session.user.id);
  } catch {
    return 'customer';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        setSession(data.session);
        setRole(await resolveRole(data.session));
      })
      .catch(() => {
        if (active) setRole(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void resolveRole(nextSession).then((r) => {
        if (active) setRole(r);
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const nextSession = await svcSignIn(email, password);
    const nextRole = (await resolveRole(nextSession)) ?? 'customer';
    setSession(nextSession);
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
      isAuthenticated: session != null,
      signIn,
      signOut,
    }),
    [session, role, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}
