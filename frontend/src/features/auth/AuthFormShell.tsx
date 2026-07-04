import type { FormEvent, ReactNode } from 'react';

interface AuthFormShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: () => void | Promise<void>;
  children: ReactNode;
  footnote: ReactNode;
  submitDisabled?: boolean;
}

export default function AuthFormShell({
  eyebrow,
  title,
  subtitle,
  submitLabel,
  onSubmit,
  children,
  footnote,
  submitDisabled,
}: AuthFormShellProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="auth-view">
      <span className="auth-eyebrow">{eyebrow}</span>
      <h1 className="auth-title">{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {children}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitDisabled}
        >
          {submitLabel}
        </button>
      </form>

      <p className="auth-footnote">{footnote}</p>
    </div>
  );
}
