import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { cancelReservation } from '../features/canvas/service';
import '../components/home.css';

type CancelState = 'idle' | 'loading' | 'done' | 'error';

export default function CancelReservationPage() {
  const [params] = useSearchParams();
  const reservationId = params.get('id') ?? '';
  const email = params.get('email') ?? '';

  const [state, setState] = useState<CancelState>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reservationId) {
      setState('error');
      setMessage('Enlace inválido: falta el identificador de la reserva.');
    }
  }, [reservationId]);

  const confirmCancel = async () => {
    if (!reservationId) return;
    setState('loading');
    const result = await cancelReservation(reservationId, email || undefined);
    if (result.ok) {
      setState('done');
      setMessage('Tu reservación fue cancelada correctamente.');
    } else {
      setState('error');
      setMessage(result.message);
    }
  };

  return (
    <div className="fade-in">
      <Header />
      <main className="res-page">
        <div className="res-page-inner" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="res-panel res-float" style={{ padding: 'var(--stack-lg)' }}>
            <p className="caption">Cancelar reservación</p>
            <h1 className="home-h2" style={{ marginBlock: 'var(--stack-sm)' }}>
              El Capirucho
            </h1>

            {state === 'done' ? (
              <>
                <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>{message}</p>
                <p style={{ marginTop: 'var(--stack-lg)' }}>
                  <Link to="/reservar" className="btn btn-primary">
                    Hacer otra reserva
                  </Link>
                </p>
              </>
            ) : state === 'error' ? (
              <>
                <p className="body-lg" style={{ color: '#b3261e' }}>{message}</p>
                <p style={{ marginTop: 'var(--stack-lg)' }}>
                  <Link to="/" className="btn btn-outline">Volver al inicio</Link>
                </p>
              </>
            ) : (
              <>
                <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>
                  ¿Seguro que deseas cancelar tu reservación? La mesa quedará disponible para otros
                  comensales.
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 'var(--stack-lg)', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={state === 'loading' || !reservationId}
                    onClick={() => void confirmCancel()}
                  >
                    {state === 'loading' ? 'Cancelando…' : 'Sí, cancelar reservación'}
                  </button>
                  <Link to="/reservar/mapa" className="btn btn-outline">
                    No, mantener reserva
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
