import { Link } from 'react-router-dom';

// Version FASE 0 basada en diseño v1 (contexto/diseño v1.html).
// FASE 3 agrega datos en vivo (disponibilidad, menu destacado, reseñas).
export default function LandingPage() {
  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'color-mix(in srgb, var(--background) 90%, transparent)',
          backdropFilter: 'blur(8px)',
          borderBottom: 'var(--border)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBlock: 'var(--stack-md)',
          }}
        >
          <span
            className="display-lg"
            style={{ fontSize: 'clamp(24px, 4vw, 32px)', textTransform: 'uppercase', letterSpacing: '-0.03em' }}
          >
            El Capirucho
          </span>
          <nav style={{ display: 'flex', gap: 'var(--gutter)', alignItems: 'center' }}>
            <Link to="/menu" className="label-md" style={{ color: 'var(--on-surface-variant)' }}>
              Menú
            </Link>
            <Link to="/login" className="label-md" style={{ color: 'var(--on-surface-variant)' }}>
              Entrar
            </Link>
            <Link to="/reservar" className="btn btn-outline btn-sm">
              Reservar Mesa
            </Link>
          </nav>
        </div>
      </header>

      <section
        className="section fade-in"
        style={{ background: 'var(--surface-container-low)', minHeight: '70vh', display: 'flex', alignItems: 'center' }}
      >
        <div className="container">
          <h1 className="display-lg" style={{ fontSize: 'clamp(48px, 8vw, 112px)', lineHeight: 1 }}>
            Sabor que
            <br />
            <span style={{ color: 'var(--outline)' }}>Tradición</span>
          </h1>
          <p
            className="body-lg"
            style={{ color: 'var(--on-surface-variant)', maxWidth: '32rem', marginBlock: 'var(--stack-lg)' }}
          >
            Experience the warmth of family recipes passed down through generations, crafted with
            modern culinary precision in the heart of the city.
          </p>
          <Link to="/reservar" className="btn btn-primary">
            Reserva tu mesa
          </Link>
        </div>
      </section>

      <footer className="section" style={{ background: 'var(--surface)', borderTop: 'var(--border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--stack-lg)' }}>
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '24rem' }}>
            Traditional Heritage, Modern Taste. Experience the warmth of our hearth.
          </p>
          <p className="caption">© 2026 El Capirucho. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
