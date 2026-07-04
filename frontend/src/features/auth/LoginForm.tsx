import { useState } from 'react';
import type { AuthFormProps } from './types';
import TextField from '../../components/ui/TextField';
import AuthFormShell from './AuthFormShell';
import AuthLinkButton from './AuthLinkButton';

export default function LoginForm({ onSwitch }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Solo UI por ahora: aquí iría la autenticación.
  };

  return (
    <AuthFormShell
      eyebrow="Bienvenido de vuelta"
      title="Iniciar Sesión"
      subtitle="Accede para gestionar tus reservas y vivir la experiencia El Capirucho."
      submitLabel="Iniciar Sesión"
      onSubmit={handleSubmit}
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
    </AuthFormShell>
  );
}
