import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { roleHomePath } from '../../services/authService';
import type { AuthFormProps } from './types';

export default function LoginForm({ onSwitch }: AuthFormProps) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      const role = await signIn(email.trim(), password);
      // Si venía redirigido (state o ?redirect=), respétala; si no, redirección por rol.
      const fromState = (location.state as { from?: string } | null)?.from;
      const redirectParam = new URLSearchParams(location.search).get('redirect');
      const destination =
        fromState ??
        (redirectParam?.startsWith('/') ? redirectParam : null) ??
        roleHomePath(role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view">
      <span className="auth-eyebrow">Bienvenido de vuelta</span>
      <h1 className="auth-title">Iniciar Sesión</h1>
      <p className="auth-subtitle">
        Accede para gestionar tus reservas y vivir la experiencia El Capirucho.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="auth-row-between">
          <button type="button" className="auth-link" onClick={() => onSwitch('forgot')}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {error && (
          <p role="alert" style={{ color: 'var(--error)', fontSize: 14, margin: 0 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Ingresando…' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="auth-footnote">
        ¿Aún no tienes cuenta?
        <button type="button" className="auth-link" onClick={() => onSwitch('register')}>
          Crear cuenta
        </button>
      </p>
    </div>
  );
}
