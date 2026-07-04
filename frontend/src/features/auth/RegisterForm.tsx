import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, PUBLIC_MAP } from '../../services/authService';
import type { AuthFormProps } from './types';
import TextField from '../../components/ui/TextField';
import AuthFormShell from './AuthFormShell';
import AuthLinkButton from './AuthLinkButton';

export default function RegisterForm({ onSwitch }: AuthFormProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async () => {
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
    <AuthFormShell
      eyebrow="Únete a la mesa"
      title="Crear Cuenta"
      subtitle="Reserva más rápido y guarda tus lugares favoritos del restaurante."
      submitLabel={loading ? 'Creando…' : 'Crear Cuenta'}
      onSubmit={handleSubmit}
      submitDisabled={loading}
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
    </AuthFormShell>
  );
}
