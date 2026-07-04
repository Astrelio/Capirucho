import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin/layout', label: 'Layout' },
  { to: '/admin/menu', label: 'Menú' },
  { to: '/admin/reservations', label: 'Reservaciones' },
  { to: '/admin/reviews', label: 'Reseñas' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 240,
          background: 'var(--surface-container)',
          borderRight: 'var(--border)',
          padding: 'var(--stack-lg) var(--stack-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--stack-sm)',
        }}
      >
        <h2 className="headline-md" style={{ marginBottom: 'var(--stack-lg)' }}>
          El Capirucho
        </h2>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className="label-md"
            style={({ isActive }) => ({
              padding: '12px 16px',
              color: isActive ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              background: isActive ? 'var(--primary)' : 'transparent',
            })}
          >
            {l.label}
          </NavLink>
        ))}
      </aside>
      <main style={{ flex: 1, padding: 'var(--stack-lg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
