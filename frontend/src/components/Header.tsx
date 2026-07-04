import { useEffect, useState } from 'react';

const NAV = [
  { label: 'Story', href: '#story' },
  { label: 'Menu', href: '#menu' },
  { label: 'Reserve', href: '#reservations' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`home-header${scrolled ? ' home-header--scrolled' : ''}`}>
      <div className="home-header-inner">
        <a href="#top" className="home-logo">
          El Capirucho
        </a>

        <nav className="home-nav">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="home-cta-desktop">
          <a href="#reservations" className="btn btn-outline btn-sm">
            Book a Table
          </a>
        </div>

        <button className="home-burger" type="button" aria-label="Abrir menú">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
