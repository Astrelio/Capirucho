import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AuthFormProps } from './types';

export default function RegisterForm({ onSwitch }: AuthFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Solo UI por ahora: aquí iría el registro.
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

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Crear Cuenta
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
