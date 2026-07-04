import Header from '../components/Header';
import Footer from '../components/Footer';
import '../components/home.css';

export default function ReservationPage() {
  return (
    <div className="fade-in">
      <Header />
      <main className="res-page">
        <div className="res-page-inner">
          <div className="res-intro">
            <p className="caption">Reservaciones</p>
            <h1 className="home-h2" style={{ marginBlock: 'var(--stack-sm)' }}>
              Reserva tu Mesa
            </h1>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>
              Asegura tu lugar y vive una experiencia inolvidable junto a nuestro hogar.
            </p>
          </div>

          <div className="res-panel res-float res-form">
            <form
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack-md)' }}
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="res-form-grid">
                <div className="field">
                  <label htmlFor="rp-date">Date</label>
                  <input id="rp-date" type="date" />
                </div>
                <div className="field">
                  <label htmlFor="rp-time">Time</label>
                  <input id="rp-time" type="time" />
                </div>
              </div>

              <div className="field">
                <label htmlFor="rp-guests">Guests</label>
                <select id="rp-guests" defaultValue="2">
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5+ People (Please contact us)</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="rp-name">Name</label>
                <input id="rp-name" type="text" placeholder="Tu Nombre" />
              </div>

              <div className="field">
                <label htmlFor="rp-phone">Phone</label>
                <input id="rp-phone" type="tel" placeholder="+503 0000-0000" />
              </div>

              <div className="field">
                <label htmlFor="rp-notes">Notas</label>
                <input id="rp-notes" type="text" placeholder="Alergias, ocasión especial…" />
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
      </main>
      <Footer />
    </div>
  );
}
