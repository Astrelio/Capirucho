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
  it('renders LandingPage at /', () => {
    renderApp('/');
    expect(screen.getByText(/sabor que/i)).toBeInTheDocument();
  });

  it('renders ReservarPage at /reservar', () => {
    renderApp('/reservar');
    expect(screen.getByText('Reservar')).toBeInTheDocument();
  });

  it('renders MenuPage at /menu', () => {
    renderApp('/menu');
    expect(screen.getByText('Menú')).toBeInTheDocument();
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
