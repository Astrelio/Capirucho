import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAdminRole, roleHomePath, type UserRole } from '../services/authService';

interface ProtectedRouteProps {
  /** Roles permitidos. Si se omite, basta con estar autenticado. */
  allow?: UserRole[];
}

/**
 * Guarda de rutas (RBAC):
 * - Mientras resuelve la sesión -> loader.
 * - Sin sesión -> /login (recordando el origen).
 * - Con sesión pero rol no permitido -> su home por rol.
 */
export default function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { session, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="canvas-message">Verificando sesión…</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const allowed = !allow || (role != null && allow.includes(role));
  if (!allowed) {
    return <Navigate to={roleHomePath(role)} replace />;
  }

  return <Outlet />;
}

/** Helper opcional para saber si el usuario puede administrar el mapa. */
export function canManageMap(role: UserRole | null): boolean {
  return isAdminRole(role);
}
