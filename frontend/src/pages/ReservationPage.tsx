import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { todayInputValue } from '../features/canvas/service';
import '../components/home.css';

export default function ReservationPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayInputValue());
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState('2');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // El flujo real de reserva es elegir mesa en el mapa; este formulario
  // precarga esos datos y lleva al usuario directo al mapa.
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ date, time, guests, name, email, phone, notes });
    navigate(`/reservar/mapa?${params.toString()}`);
  };

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
              Completa tus datos y elige tu mesa en el mapa interactivo.
            </p>
            <p style={{ marginTop: 'var(--stack-md)' }}>
              <Link to="/reservar/mapa" className="btn btn-outline">
                Ir directo al mapa
              </Link>
            </p>
          </div>

          <div className="res-panel res-float res-form">
            <form
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack-md)' }}
              onSubmit={onSubmit}
            >
              <div className="res-form-grid">
                <div className="field">
                  <label htmlFor="rp-date">Fecha</label>
                  <input
                    id="rp-date"
                    type="date"
                    value={date}
                    min={todayInputValue()}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="rp-time">Hora</label>
                  <input
                    id="rp-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="rp-guests">Personas</label>
                <select id="rp-guests" value={guests} onChange={(e) => setGuests(e.target.value)}>
                  <option value="1">1 persona</option>
                  <option value="2">2 personas</option>
                  <option value="3">3 personas</option>
                  <option value="4">4 personas</option>
                  <option value="5">5 personas</option>
                  <option value="6">6 personas</option>
                  <option value="8">8 personas</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="rp-name">Nombre</label>
                <input
                  id="rp-name"
                  type="text"
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="rp-email">Correo</label>
                <input
                  id="rp-email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="rp-phone">Teléfono</label>
                <input
                  id="rp-phone"
                  type="tel"
                  placeholder="+503 0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="rp-notes">Notas</label>
                <input
                  id="rp-notes"
                  type="text"
                  placeholder="Alergias, ocasión especial…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'var(--stack-md)' }}
              >
                Elegir Mesa en el Mapa
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
