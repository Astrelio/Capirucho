import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  createCategory,
  deleteCategory,
  deleteMenuItem,
  loadMenu,
  saveMenuItem,
  setMenuItemAvailable,
  type MenuData,
  type MenuItem,
} from '../../services/menuService';
import './admin.css';

interface ItemForm {
  id?: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  available: boolean;
}

const EMPTY_FORM: ItemForm = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  imageUrl: '',
  available: true,
};

export default function MenuManager() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState<ItemForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const reload = useCallback(() => {
    loadMenu({ includeUnavailable: true })
      .then((m) => {
        setMenu(m);
        setError('');
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(reload, [reload]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const run = async (action: () => Promise<void>, successMsg: string) => {
    try {
      await action();
      setNotice(successMsg);
      reload();
    } catch (e) {
      setNotice(`Error: ${(e as Error).message}`);
    }
  };

  const startEdit = (item: MenuItem) => {
    setForm({
      id: item.id,
      name: item.name,
      description: item.description,
      price: String(item.price),
      categoryId: item.categoryId ?? '',
      imageUrl: item.imageUrl ?? '',
      available: item.available,
    });
  };

  const submitItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const price = Number(form.price);
    if (!form.name.trim()) {
      setNotice('Error: el nombre es obligatorio');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setNotice('Error: el precio debe ser un número mayor que 0');
      return;
    }

    setSaving(true);
    try {
      await saveMenuItem({
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        categoryId: form.categoryId || null,
        imageUrl: form.imageUrl.trim() || null,
        available: form.available,
      });
      setForm(null);
      setNotice(form.id ? 'Platillo actualizado' : 'Platillo creado');
      reload();
    } catch (err) {
      setNotice(`Error: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const submitCategory = async (e: FormEvent) => {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    await run(() => createCategory(name), 'Categoría creada');
    setNewCategory('');
  };

  if (error) return <div className="admin-notice error">Error: {error}</div>;
  if (!menu) return <div className="admin-empty">Cargando menú…</div>;

  const categoryName = (id: string | null) =>
    menu.categories.find((c) => c.id === id)?.name ?? 'Sin categoría';

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header">
        <p className="caption">Administración</p>
        <h1>Gestión de Menú</h1>
      </div>

      {notice ? (
        <div className={`admin-notice${notice.startsWith('Error') ? ' error' : ''}`} role="status">
          {notice}
        </div>
      ) : null}

      <div className="admin-card">
        <h2>Categorías</h2>
        <div className="admin-chiprow">
          {menu.categories.length === 0 ? (
            <span className="admin-chip">Sin categorías todavía</span>
          ) : (
            menu.categories.map((cat) => (
              <span key={cat.id} className="admin-chip">
                {cat.name}
                <button
                  type="button"
                  aria-label={`Eliminar categoría ${cat.name}`}
                  title="Eliminar categoría (los platillos quedan sin categoría)"
                  onClick={() =>
                    void run(() => deleteCategory(cat.id), 'Categoría eliminada')
                  }
                >
                  <X size={14} />
                </button>
              </span>
            ))
          )}
        </div>
        <form className="admin-inline" onSubmit={(e) => void submitCategory(e)}>
          <label>
            Nueva categoría
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Ej. Bebidas"
            />
          </label>
          <button type="submit" className="admin-btn primary" disabled={!newCategory.trim()}>
            <Plus size={15} />
            Agregar
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h2>{form ? (form.id ? 'Editar platillo' : 'Nuevo platillo') : 'Platillos'}</h2>

        {form ? (
          <form className="admin-form" onSubmit={(e) => void submitItem(e)}>
            <label>
              Nombre
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del platillo"
              />
            </label>
            <label>
              Precio ($)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
              />
            </label>
            <label>
              Categoría
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Sin categoría</option>
                {menu.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="full-row">
              Descripción
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción del platillo"
              />
            </label>
            <label className="full-row">
              URL de imagen (opcional)
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
              />
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              Disponible en el menú público
            </label>
            <div className="admin-actions full-row">
              <button type="submit" className="admin-btn primary" disabled={saving}>
                {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear platillo'}
              </button>
              <button type="button" className="admin-btn" onClick={() => setForm(null)}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="admin-actions" style={{ marginBottom: 16 }}>
              <button type="button" className="admin-btn primary" onClick={() => setForm(EMPTY_FORM)}>
                <Plus size={15} />
                Nuevo platillo
              </button>
            </div>

            {menu.items.length === 0 ? (
              <div className="admin-empty">
                No hay platillos. Crea el primero o corre el seed de
                {' '}
                <code>003_roles_permissions.sql</code> en Supabase.
              </div>
            ) : (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Platillo</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Disponible</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.items.map((item) => (
                      <tr key={item.id} className={item.available ? '' : 'unavailable'}>
                        <td>
                          {item.imageUrl ? (
                            <img className="admin-thumb" src={item.imageUrl} alt={item.name} />
                          ) : null}
                        </td>
                        <td>
                          <strong>{item.name}</strong>
                          <br />
                          <span style={{ color: 'var(--on-surface-variant)' }}>
                            {item.description.length > 70
                              ? `${item.description.slice(0, 70)}…`
                              : item.description}
                          </span>
                        </td>
                        <td>{categoryName(item.categoryId)}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={item.available}
                            aria-label={`Disponibilidad de ${item.name}`}
                            onChange={(e) =>
                              void run(
                                () => setMenuItemAvailable(item.id, e.target.checked),
                                e.target.checked ? 'Platillo visible' : 'Platillo oculto',
                              )
                            }
                          />
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button type="button" className="admin-btn" onClick={() => startEdit(item)}>
                              <Pencil size={14} />
                              Editar
                            </button>
                            <button
                              type="button"
                              className="admin-btn danger"
                              onClick={() =>
                                void run(() => deleteMenuItem(item.id), 'Platillo eliminado')
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
