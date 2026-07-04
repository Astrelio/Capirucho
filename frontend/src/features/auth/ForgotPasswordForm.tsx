import { useState } from 'react';
import { resetPassword } from '../../services/authService';
import type { AuthFormProps } from './types';
import TextField from '../../components/ui/TextField';
import AuthFormShell from './AuthFormShell';
import AuthLinkButton from './AuthLinkButton';

export default function ForgotPasswordForm({ onSwitch }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async () => {
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
    <AuthFormShell
      eyebrow="Recuperación"
      title="Recuperar Contraseña"
      subtitle="Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."
      submitLabel={loading ? 'Enviando…' : 'Enviar enlace'}
      onSubmit={handleSubmit}
      submitDisabled={loading}
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
