import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LandingPage from '../LandingPage';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('LandingPage', () => {
  it('renders the brand name', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText('El Capirucho')).toBeInTheDocument();
  });

  it('renders the hero heading', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/sabor que/i)).toBeInTheDocument();
    expect(screen.getByText('Tradición')).toBeInTheDocument();
  });

  it('renders the hero description', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/experience the warmth of family recipes/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByRole('link', { name: /menú/i })).toHaveAttribute('href', '/menu');
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login');
  });

  it('renders "Reservar Mesa" link in header', () => {
    renderWithRouter(<LandingPage />);
    const reserveLinks = screen.getAllByRole('link', { name: /reserva/i });
    expect(reserveLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders CTA button linking to /reservar', () => {
    renderWithRouter(<LandingPage />);
    const cta = screen.getByRole('link', { name: /reserva tu mesa/i });
    expect(cta).toHaveAttribute('href', '/reservar');
  });

  it('renders the footer', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/© 2026 El Capirucho/i)).toBeInTheDocument();
  });

  it('renders the footer tagline', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/traditional heritage, modern taste/i)).toBeInTheDocument();
  });
});
