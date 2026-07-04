import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAdminRole, roleHomePath, type UserRole } from '../services/authService';

interface ProtectedRouteProps {
  /** Roles permitidos. Si se omite, basta con estar autenticado. */
  allow?: UserRole[];
}

/**
 * Guarda de rutas (RBAC):
 * - Mientras resuelve la sesión -> loader (NO redirige a login hasta estar seguro).
 * - Sin sesión -> /login (recordando el origen).
 * - Con sesión: espera a que cargue el rol antes de evaluar permisos.
 * - Rol no permitido -> su home por rol.
 */
export default function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { session, role, loading, roleLoading } = useAuth();
  const location = useLocation();

  // 1) Sesión aún verificándose: no decidimos nada todavía.
  if (loading) {
    return <div className="canvas-message">Verificando sesión…</div>;
  }

  // 2) 100% seguros de que no hay sesión -> login.
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 3) Hay sesión pero la ruta exige roles: esperamos el rol antes de expulsar.
  if (allow) {
    if (roleLoading || role == null) {
      return <div className="canvas-message">Verificando permisos…</div>;
    }
    if (!allow.includes(role)) {
      return <Navigate to={roleHomePath(role)} replace />;
    }
  }

  return <Outlet />;
}

/** Helper opcional para saber si el usuario puede administrar el mapa. */
export function canManageMap(role: UserRole | null): boolean {
  return isAdminRole(role);
}
