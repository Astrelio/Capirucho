import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, PUBLIC_MAP } from '../../services/authService';
import type { AuthFormProps } from './types';

export default function RegisterForm({ onSwitch }: AuthFormProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const session = await signUp({ fullName: fullName.trim(), email: email.trim(), password });
      if (session) {
        navigate(PUBLIC_MAP, { replace: true });
      } else {
        setInfo('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view">
      <span className="auth-eyebrow">Únete a la mesa</span>
      <h1 className="auth-title">Crear Cuenta</h1>
      <p className="auth-subtitle">
        Reserva más rápido y guarda tus lugares favoritos del restaurante.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="register-name">Nombre completo</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="register-confirm">Confirmar contraseña</label>
          <input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" style={{ color: 'var(--error)', fontSize: 14, margin: 0 }}>
            {error}
          </p>
        )}
        {info && (
          <p role="status" style={{ color: 'var(--tertiary)', fontSize: 14, margin: 0 }}>
            {info}
          </p>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creando…' : 'Crear Cuenta'}
        </button>
      </form>

      <p className="auth-footnote">
        ¿Ya tienes cuenta?
        <button type="button" className="auth-link" onClick={() => onSwitch('login')}>
          Iniciar sesión
        </button>
      </p>
    </div>
  );
}
