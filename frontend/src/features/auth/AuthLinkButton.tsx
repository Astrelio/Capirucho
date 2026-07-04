import type { ReactNode } from 'react';

interface AuthLinkButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export default function AuthLinkButton({ onClick, children }: AuthLinkButtonProps) {
  return (
    <button type="button" className="auth-link" onClick={onClick}>
      {children}
    </button>
  );
}
