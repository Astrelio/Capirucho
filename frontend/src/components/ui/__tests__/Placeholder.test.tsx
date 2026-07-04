import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Placeholder from '../Placeholder';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Placeholder', () => {
  it('renders the title', () => {
    renderWithRouter(<Placeholder title="Editor de Layout" fase="FASE 2A" />);
    expect(screen.getByText('Editor de Layout')).toBeInTheDocument();
  });

  it('renders the fase caption', () => {
    renderWithRouter(<Placeholder title="Menú" fase="FASE 4 — CRUD + IA fal" />);
    expect(screen.getByText('FASE 4 — CRUD + IA fal')).toBeInTheDocument();
  });

  it('renders the construction message', () => {
    renderWithRouter(<Placeholder title="Dashboard" fase="FASE 5" />);
    expect(screen.getByText('Página en construcción durante el hackathon.')).toBeInTheDocument();
  });

  it('renders a link back to home', () => {
    renderWithRouter(<Placeholder title="Test" fase="FASE 0" />);
    const link = screen.getByRole('link', { name: /volver al inicio/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
