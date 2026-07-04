import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ForgotPasswordForm from '../ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  it('renders the email field', () => {
    render(<ForgotPasswordForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<ForgotPasswordForm onSwitch={vi.fn()} />);
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
  });

  it('renders the title and subtitle', () => {
    render(<ForgotPasswordForm onSwitch={vi.fn()} />);
    expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
    expect(screen.getByText(/ingresa tu correo/i)).toBeInTheDocument();
  });

  it('updates email field on user input', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm onSwitch={vi.fn()} />);
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'user@example.com');
    expect(emailInput).toHaveValue('user@example.com');
  });

  it('calls onSwitch("login") when clicking back to login', async () => {
    const onSwitch = vi.fn();
    const user = userEvent.setup();
    render(<ForgotPasswordForm onSwitch={onSwitch} />);
    await user.click(screen.getByRole('button', { name: /volver a iniciar sesión/i }));
    expect(onSwitch).toHaveBeenCalledWith('login');
  });

  it('email input is required', () => {
    render(<ForgotPasswordForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeRequired();
  });

  it('email input has type="email"', () => {
    render(<ForgotPasswordForm onSwitch={vi.fn()} />);
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('type', 'email');
  });

  it('renders the eyebrow text', () => {
    render(<ForgotPasswordForm onSwitch={vi.fn()} />);
    expect(screen.getByText('Recuperación')).toBeInTheDocument();
  });
});
