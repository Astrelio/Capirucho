import { useState } from 'react';
import type { AuthFormProps } from './types';
import TextField from '../../components/ui/TextField';
import AuthFormShell from './AuthFormShell';
import AuthLinkButton from './AuthLinkButton';

export default function RegisterForm({ onSwitch }: AuthFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = () => {
    // Solo UI por ahora: aquí iría el registro.
  };

  return (
    <AuthFormShell
      eyebrow="Únete a la mesa"
      title="Crear Cuenta"
      subtitle="Reserva más rápido y guarda tus lugares favoritos del restaurante."
      submitLabel="Crear Cuenta"
      onSubmit={handleSubmit}
      footnote={
        <>
          ¿Ya tienes cuenta?
          <AuthLinkButton onClick={() => onSwitch('login')}>Iniciar sesión</AuthLinkButton>
        </>
      }
    >
      <TextField
        id="register-name"
        label="Nombre completo"
        autoComplete="name"
        placeholder="Tu nombre"
        value={fullName}
        onChange={setFullName}
        required
      />

      <TextField
        id="register-email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={setEmail}
        required
      />

      <TextField
        id="register-password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChange={setPassword}
        required
      />

      <TextField
        id="register-confirm"
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Repite tu contraseña"
        value={confirm}
        onChange={setConfirm}
        required
      />
    </AuthFormShell>
  );
}
