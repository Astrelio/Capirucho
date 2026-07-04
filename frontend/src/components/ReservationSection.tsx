import { useInView } from '../hooks/useInView';

export default function ReservationSection() {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className={`home-reservation reveal${inView ? ' is-visible' : ''}`}
      id="reservations"
    >
      <div className="home-reservation-inner">
        <div>
          <h2 className="home-h2" style={{ marginBottom: 'var(--stack-md)' }}>
            Asegura tu
            <br />
            Lugar
          </h2>
          <p
            className="body-lg"
            style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--stack-lg)' }}
          >
            Join us for an unforgettable dining experience. Reserve your table below to ensure a
            seamless evening.
          </p>
          <div className="divider" />
        </div>

        <div className="home-reservation-panel">
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack-md)' }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="home-reservation-grid">
              <div className="field">
                <label htmlFor="res-date">Date</label>
                <input id="res-date" type="date" />
              </div>
              <div className="field">
                <label htmlFor="res-time">Time</label>
                <input id="res-time" type="time" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="res-guests">Guests</label>
              <select id="res-guests" defaultValue="2">
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5">5+ People (Please contact us)</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="res-name">Name</label>
              <input id="res-name" type="text" placeholder="Tu Nombre" />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'var(--stack-md)' }}
            >
              Confirm Reservation
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
