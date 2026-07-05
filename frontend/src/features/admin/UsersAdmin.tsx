import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../services/authService';
import './admin.css';

interface ProfileRow {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'customer', label: 'Cliente' },
  { value: 'waiter', label: 'Mesero' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export default function UsersAdmin() {
  const { session } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    supabase
      .from('profiles')
      .select('id, user_id, full_name, email, phone, role, created_at')
      .order('created_at')
      .then(({ data, error }) => {
        if (error) setNotice(`Error: ${error.message}`);
        else setProfiles((data ?? []) as ProfileRow[]);
        setLoading(false);
      });
  }, []);

  useEffect(reload, [reload]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const changeRole = async (profile: ProfileRow, role: UserRole) => {
    setSavingId(profile.id);
    const { error } = await supabase.from('profiles').update({ role }).eq('id', profile.id);
    setSavingId(null);

    if (error) {
      const msg = /row-level security/i.test(error.message)
        ? 'No tienes permisos para cambiar roles (se requiere super_admin).'
        : error.message;
      setNotice(`Error: ${msg}`);
      return;
    }
    setNotice(`Rol de ${profile.full_name || profile.email || 'usuario'} actualizado a ${role}`);
    reload();
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header">
        <p className="caption">Administración</p>
        <h1>Usuarios y Roles</h1>
      </div>

      {notice ? (
        <div className={`admin-notice${notice.startsWith('Error') ? ' error' : ''}`} role="status">
          {notice}
        </div>
      ) : null}

      <div className="admin-card">
        <h2>Perfiles registrados</h2>
        {loading ? (
          <div className="admin-empty">Cargando usuarios…</div>
        ) : profiles.length === 0 ? (
          <div className="admin-empty">
            No hay perfiles visibles. Verifica que corriste
            {' '}
            <code>003_roles_permissions.sql</code> en Supabase.
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const isSelf = p.user_id != null && p.user_id === session?.user?.id;
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.full_name || 'Sin nombre'}</strong>
                        {isSelf ? ' (tú)' : ''}
                      </td>
                      <td>{p.email ?? '—'}</td>
                      <td>{p.phone ?? '—'}</td>
                      <td>
                        <select
                          value={p.role}
                          disabled={savingId === p.id || isSelf}
                          title={isSelf ? 'No puedes cambiar tu propio rol' : 'Cambiar rol'}
                          onChange={(e) => void changeRole(p, e.target.value as UserRole)}
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-notice">
        Cliente: solo reserva. Mesero: personal de piso. Admin: edita mapa, menú y reservaciones.
        Super Admin: todo lo anterior + gestión de roles.
      </div>
    </div>
  );
}
