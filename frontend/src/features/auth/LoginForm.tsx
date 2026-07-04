import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { roleHomePath } from '../../services/authService';
import type { AuthFormProps } from './types';
import TextField from '../../components/ui/TextField';
import AuthFormShell from './AuthFormShell';
import AuthLinkButton from './AuthLinkButton';

export default function LoginForm({ onSwitch }: AuthFormProps) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      const role = await signIn(email.trim(), password);
      // Si venía redirigido desde una ruta protegida, respétala; si no, redirección por rol.
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? roleHomePath(role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormShell
      eyebrow="Bienvenido de vuelta"
      title="Iniciar Sesión"
      subtitle="Accede para gestionar tus reservas y vivir la experiencia El Capirucho."
      submitLabel={loading ? 'Ingresando…' : 'Iniciar Sesión'}
      onSubmit={handleSubmit}
      submitDisabled={loading}
      footnote={
        <>
          ¿Aún no tienes cuenta?
          <AuthLinkButton onClick={() => onSwitch('register')}>Crear cuenta</AuthLinkButton>
        </>
      }
    >
      <TextField
        id="login-email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={setEmail}
        required
      />

      <TextField
        id="login-password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
        required
      />

      <div className="auth-row-between">
        <AuthLinkButton onClick={() => onSwitch('forgot')}>
          ¿Olvidaste tu contraseña?
        </AuthLinkButton>
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--error)', fontSize: 14, margin: 0 }}>
          {error}
        </p>
      )}
    </AuthFormShell>
  );
}
