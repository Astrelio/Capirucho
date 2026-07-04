import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../App';

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it('renders Home at /', () => {
    renderApp('/');
    expect(screen.getByRole('link', { name: 'El Capirucho' })).toBeInTheDocument();
  });

  it('renders ReservationPage at /reservar', () => {
    renderApp('/reservar');
    expect(screen.getByText('Reserva tu Mesa')).toBeInTheDocument();
  });

  it('renders MenuPage at /menu', () => {
    renderApp('/menu');
    expect(screen.getByText('Nuestro Menú')).toBeInTheDocument();
  });

  it('renders LoginPage at /login', () => {
    renderApp('/login');
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('renders RegisterPage at /register', () => {
    renderApp('/register');
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
  });

  it('renders DashboardPage at /dashboard', () => {
    renderApp('/dashboard');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
