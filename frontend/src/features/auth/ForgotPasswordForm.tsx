import { useState } from 'react';
import type { AuthFormProps } from './types';
import TextField from '../../components/ui/TextField';
import AuthFormShell from './AuthFormShell';
import AuthLinkButton from './AuthLinkButton';

export default function ForgotPasswordForm({ onSwitch }: AuthFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // Solo UI por ahora: aquí iría el envío del enlace de recuperación.
  };

  return (
    <AuthFormShell
      eyebrow="Recuperación"
      title="Recuperar Contraseña"
      subtitle="Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."
      submitLabel="Enviar enlace"
      onSubmit={handleSubmit}
      footnote={
        <>
          ¿Recordaste tu contraseña?
          <AuthLinkButton onClick={() => onSwitch('login')}>
            Volver a iniciar sesión
          </AuthLinkButton>
        </>
      }
    >
      <TextField
        id="forgot-email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={setEmail}
        required
      />
    </AuthFormShell>
  );
}
