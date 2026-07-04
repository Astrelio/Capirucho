import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AuthFormProps } from './types';

export default function LoginForm({ onSwitch }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Solo UI por ahora: aquí iría la autenticación.
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

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Iniciar Sesión
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
