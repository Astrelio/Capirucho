import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<LoginForm onSwitch={vi.fn()} />);
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('renders the title and subtitle', () => {
    render(<LoginForm onSwitch={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByText(/accede para gestionar tus reservas/i)).toBeInTheDocument();
  });

  it('updates email field on user input', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitch={vi.fn()} />);
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('updates password field on user input', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitch={vi.fn()} />);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    await user.type(passwordInput, 'secret123');
    expect(passwordInput).toHaveValue('secret123');
  });

  it('calls onSwitch("forgot") when clicking forgot password', async () => {
    const onSwitch = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSwitch={onSwitch} />);
    await user.click(screen.getByRole('button', { name: /olvidaste tu contraseña/i }));
    expect(onSwitch).toHaveBeenCalledWith('forgot');
  });

  it('calls onSwitch("register") when clicking create account', async () => {
    const onSwitch = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSwitch={onSwitch} />);
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(onSwitch).toHaveBeenCalledWith('register');
  });

  it('has required attribute on email input', () => {
    render(<LoginForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeRequired();
  });

  it('has required attribute on password input', () => {
    render(<LoginForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/contraseña/i)).toBeRequired();
  });

  it('email input has type="email"', () => {
    render(<LoginForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('type', 'email');
  });

  it('password input has type="password"', () => {
    render(<LoginForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('type', 'password');
  });
});
