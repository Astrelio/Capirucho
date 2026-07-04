import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AuthView } from './types';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import './auth.css';

const MEDIA: Record<AuthView, { image: string; quote: string }> = {
  login: {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAADo0thPmFSgo2cs-rbEedL_JSyQsz4bhcDURgMs6bJGFjRoLm6LWfF5wSI0aBet9DtfiWxMmj8JtSp-H5LCeyCDMGZe22VGf5XNdwgxBeYTVnu6G34ruVS4516it6yUcIy7SMTpnnp8mAxPXSgsv7-v4MaquOHnrj5y7-7GZK5r8cSujIKyzUjcIYjOBlycYpOb5sCR3_IPJ1dKAFkdqvG7AnUk4HBf1jfCQLJrOtGRvs4jpSAX7cwbq6plpoB7_rLi2s_xe_A8E',
    quote: '"La esencia del hogar, en cada plato."',
  },
  register: {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAZKIW3t6QXmqVWyERjYpXnzyAFolO63Wn8eAkKjroT5MrG18KPWVQCz6T7p70Kr1XHAtmp-0fTr1OQ_ssIuiYHDw0kKpo-x0X6Ddf0cciLpQ5PacM2N-LRcEGIs6mwKwFy-gxy7v0dJRTLDNKhrPydNx7ev6KkY4hFBlLXCpUXDC5MuX7JXrZQuCaGOIP25LCI9NcndPVTvXK1J-es4bax16SwM5fIN_cimjyMP-9yNuXqOewucW1ohk3vXEAN9YH9dwukDoqll6o',
    quote: '"Recetas de familia, sabor de siempre."',
  },
  forgot: {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCyazzAfwBAjo0dJ4n0PYjjUD2FszQFsPvj-n9EqhGdOEaBYdShDIfbxA4IZ60WIH9qxkIC52r-02qt0r10GOCBIL6AjJLqMsRyZ1xdKGZb0XorxhtxotuEnwBiwBQ3cH_i5ikcp5u0kHDOqa_8w5rO4-wfvXq8H8HPBqNu5QV_7KSeEXjI0pjHrb1MV9Rk0OnRRGsZxE2etNqNijrhmojv9rAb2xP9QSXtbzjTUZSWvGm2E_63BvQ0ly83hDIgW8ZlI74b2S3orE',
    quote: '"Te ayudamos a volver a la mesa."',
  },
};

export default function AuthPage({ initialView = 'login' }: { initialView?: AuthView }) {
  const [view, setView] = useState<AuthView>(initialView);
  const media = MEDIA[view];

  return (
    <div className="auth-shell">
      <aside
        className="auth-media"
        style={{ backgroundImage: `url(${media.image})` }}
        aria-hidden="true"
      >
        <div className="auth-media-content">
          <div className="auth-brand">El Capirucho</div>
          <p className="auth-media-quote">{media.quote}</p>
          <span className="auth-media-tag">Traditional Heritage · Modern Taste</span>
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          {view === 'login' && <LoginForm onSwitch={setView} />}
          {view === 'register' && <RegisterForm onSwitch={setView} />}
          {view === 'forgot' && <ForgotPasswordForm onSwitch={setView} />}

          <p style={{ marginTop: 'var(--stack-lg)' }}>
            <Link to="/" className="auth-link">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
