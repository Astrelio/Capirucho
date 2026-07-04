import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AuthPage from '../AuthPage';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AuthPage', () => {
  it('defaults to the login view', () => {
    renderWithRouter(<AuthPage />);
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('respects initialView="register"', () => {
    renderWithRouter(<AuthPage initialView="register" />);
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
  });

  it('respects initialView="forgot"', () => {
    renderWithRouter(<AuthPage initialView="forgot" />);
    expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
  });

  it('switches from login to register', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AuthPage />);
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
  });

  it('switches from login to forgot password', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AuthPage />);
    await user.click(screen.getByRole('button', { name: /olvidaste tu contraseña/i }));
    expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
  });

  it('switches from register to login', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AuthPage initialView="register" />);
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('switches from forgot to login', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AuthPage initialView="forgot" />);
    await user.click(screen.getByRole('button', { name: /volver a iniciar sesión/i }));
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('displays the correct media quote for login view', () => {
    renderWithRouter(<AuthPage />);
    expect(screen.getByText('"La esencia del hogar, en cada plato."')).toBeInTheDocument();
  });

  it('displays the correct media quote for register view', () => {
    renderWithRouter(<AuthPage initialView="register" />);
    expect(screen.getByText('"Recetas de familia, sabor de siempre."')).toBeInTheDocument();
  });

  it('displays the correct media quote for forgot view', () => {
    renderWithRouter(<AuthPage initialView="forgot" />);
    expect(screen.getByText('"Te ayudamos a volver a la mesa."')).toBeInTheDocument();
  });

  it('renders "Volver al inicio" link pointing to /', () => {
    renderWithRouter(<AuthPage />);
    const link = screen.getByRole('link', { name: /volver al inicio/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders the brand name', () => {
    renderWithRouter(<AuthPage />);
    expect(screen.getByText('El Capirucho')).toBeInTheDocument();
  });
});
