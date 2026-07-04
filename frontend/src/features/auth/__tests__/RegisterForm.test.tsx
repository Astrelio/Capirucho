import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RegisterForm from '../RegisterForm';

describe('RegisterForm', () => {
  it('renders all form fields', () => {
    render(<RegisterForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<RegisterForm onSwitch={vi.fn()} />);
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('renders the title and subtitle', () => {
    render(<RegisterForm onSwitch={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
    expect(screen.getByText(/reserva más rápido/i)).toBeInTheDocument();
  });

  it('updates name field on user input', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSwitch={vi.fn()} />);
    const nameInput = screen.getByLabelText(/nombre completo/i);
    await user.type(nameInput, 'Ana García');
    expect(nameInput).toHaveValue('Ana García');
  });

  it('updates email field on user input', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSwitch={vi.fn()} />);
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'ana@example.com');
    expect(emailInput).toHaveValue('ana@example.com');
  });

  it('updates password field on user input', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSwitch={vi.fn()} />);
    const passwordInput = screen.getByLabelText('Contraseña');
    await user.type(passwordInput, 'password123');
    expect(passwordInput).toHaveValue('password123');
  });

  it('updates confirm password field on user input', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSwitch={vi.fn()} />);
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
    await user.type(confirmInput, 'password123');
    expect(confirmInput).toHaveValue('password123');
  });

  it('calls onSwitch("login") when clicking login link', async () => {
    const onSwitch = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSwitch={onSwitch} />);
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(onSwitch).toHaveBeenCalledWith('login');
  });

  it('all fields are required', () => {
    render(<RegisterForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/nombre completo/i)).toBeRequired();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeRequired();
    expect(screen.getByLabelText('Contraseña')).toBeRequired();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeRequired();
  });

  it('email input has type="email"', () => {
    render(<RegisterForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('type', 'email');
  });

  it('password inputs have type="password"', () => {
    render(<RegisterForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/confirmar contraseña/i)).toHaveAttribute('type', 'password');
  });
});
