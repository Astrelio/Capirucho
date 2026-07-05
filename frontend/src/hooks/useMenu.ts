import { useCallback, useEffect, useState } from 'react';
import { loadMenu, type MenuData } from '../services/menuService';

/**
 * Carga el menú público desde la BD. Si la consulta falla o no hay
 * platillos, los componentes usan su fallback estático (dishes.ts).
 */
export function useMenu(): { menu: MenuData | null; loading: boolean; reload: () => void } {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    loadMenu()
      .then(setMenu)
      .catch(() => setMenu(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  return { menu, loading, reload };
}
