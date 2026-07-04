import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';

export default function ReservationSection() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`home-reservation reveal${inView ? ' is-visible' : ''}`}
      id="reservations"
    >
      <div className="home-cta-band">
        <span className="label-md" style={{ color: 'var(--secondary)', letterSpacing: '0.15em' }}>
          Reservaciones
        </span>
        <h2 className="home-h2">Asegura tu Lugar</h2>
        <p
          className="body-lg"
          style={{ color: 'var(--on-surface-variant)', maxWidth: '40rem', marginInline: 'auto' }}
        >
          Join us for an unforgettable dining experience. Reserva tu mesa y vive la calidez de
          nuestro hogar.
        </p>
        <Link to="/reservar" className="cta-fill cta-fill--solid">
          Reserva tu Mesa
          <span className="cta-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
