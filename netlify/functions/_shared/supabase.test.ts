import { describe, it, expect, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({})),
}));

import { json } from './supabase';

describe('json helper', () => {
  it('returns the correct status code', () => {
    const res = json(200, { ok: true });
    expect(res.statusCode).toBe(200);
  });

  it('sets Content-Type header to application/json', () => {
    const res = json(201, {});
    expect(res.headers['Content-Type']).toBe('application/json');
  });

  it('serializes the body as JSON string', () => {
    const body = { message: 'created', id: 42 };
    const res = json(201, body);
    expect(res.body).toBe(JSON.stringify(body));
  });

  it('handles error status codes', () => {
    const res = json(404, { error: 'not found' });
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toEqual({ error: 'not found' });
  });

  it('handles null body', () => {
    const res = json(204, null);
    expect(res.body).toBe('null');
  });

  it('handles array body', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const res = json(200, items);
    expect(JSON.parse(res.body)).toEqual(items);
  });

  it('handles nested objects', () => {
    const nested = { data: { user: { name: 'Ana', reservations: [1, 2] } } };
    const res = json(200, nested);
    expect(JSON.parse(res.body)).toEqual(nested);
  });
});
