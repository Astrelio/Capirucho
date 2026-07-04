import { useState } from 'react';
import type { FormEvent } from 'react';
import { resetPassword } from '../../services/authService';
import type { AuthFormProps } from './types';

export default function ForgotPasswordForm({ onSwitch }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await resetPassword(email.trim());
      setInfo('Enlace enviado. Revisa tu correo.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view">
      <span className="auth-eyebrow">Recuperación</span>
      <h1 className="auth-title">Recuperar Contraseña</h1>
      <p className="auth-subtitle">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="forgot-email">Correo electrónico</label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>

      <p className="auth-footnote">
        ¿Recordaste tu contraseña?
        <button type="button" className="auth-link" onClick={() => onSwitch('login')}>
          Volver a iniciar sesión
        </button>
      </p>
    </div>
  );
}
