import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ADMIN_HOME, isAdminRole } from '../services/authService';

const NAV = [
  { label: 'Story', to: '/#story' },
  { label: 'Menu', to: '/menu' },
  { label: 'Reserve', to: '/reservar' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, loading, role, roleLoading, session, signOut } = useAuth();
  const canAccessAdmin = isAdminRole(role);

  const displayName =
    (session?.user?.user_metadata?.full_name as string | undefined) ??
    session?.user?.email ??
    'Mi cuenta';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`home-header${scrolled ? ' home-header--scrolled' : ''}`}>
      <div className="home-header-inner">
        <Link to="/" className="home-logo">
          El Capirucho
        </Link>

        <nav className="home-nav">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="home-cta-desktop">
          {loading ? null : isAuthenticated ? (
            <div className="home-session">
              <span className="home-session-name">{displayName}</span>
              {!roleLoading && canAccessAdmin ? (
                <Link to={ADMIN_HOME} className="btn btn-primary btn-sm">
                  Administrar
                </Link>
              ) : null}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => void signOut()}
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">
              Iniciar Sesión
            </Link>
          )}
        </div>

        <button className="home-burger" type="button" aria-label="Abrir menú">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
