import { Link } from 'react-router-dom';

// Stub temporal de FASE 0; cada pagina se implementa en su fase.
export default function Placeholder({ title, fase }: { title: string; fase: string }) {
  return (
    <main className="container section fade-in">
      <p className="caption">{fase}</p>
      <h1 className="display-lg" style={{ marginBlock: 'var(--stack-md)' }}>
        {title}
      </h1>
      <div className="divider" style={{ marginBottom: 'var(--stack-lg)' }} />
      <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>
        Página en construcción durante el hackathon.
      </p>
      <p style={{ marginTop: 'var(--stack-lg)' }}>
        <Link to="/" className="btn btn-outline">
          Volver al inicio
        </Link>
      </p>
    </main>
  );
}
