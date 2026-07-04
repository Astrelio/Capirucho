import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AuthFormProps } from './types';

export default function ForgotPasswordForm({ onSwitch }: AuthFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Solo UI por ahora: aquí iría el envío del enlace de recuperación.
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

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Enviar enlace
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
