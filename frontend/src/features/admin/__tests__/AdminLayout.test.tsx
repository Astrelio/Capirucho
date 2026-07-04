import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AdminLayout from '../AdminLayout';

function renderWithRouter(ui: React.ReactElement, { route = '/admin' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

describe('AdminLayout', () => {
  it('renders the brand heading', () => {
    renderWithRouter(<AdminLayout />);
    expect(screen.getByText('El Capirucho')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderWithRouter(<AdminLayout />);
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByText('Menú')).toBeInTheDocument();
    expect(screen.getByText('Reservaciones')).toBeInTheDocument();
    expect(screen.getByText('Reseñas')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('links point to the correct paths', () => {
    renderWithRouter(<AdminLayout />);
    expect(screen.getByText('Layout').closest('a')).toHaveAttribute('href', '/admin/layout');
    expect(screen.getByText('Menú').closest('a')).toHaveAttribute('href', '/admin/menu');
    expect(screen.getByText('Reservaciones').closest('a')).toHaveAttribute('href', '/admin/reservations');
    expect(screen.getByText('Reseñas').closest('a')).toHaveAttribute('href', '/admin/reviews');
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('renders exactly 5 nav links', () => {
    renderWithRouter(<AdminLayout />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
  });
});
