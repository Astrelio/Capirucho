import type { Handler } from '@netlify/functions';
import { supabaseAdmin, json } from './_shared/supabase';

// POST /api/layout  body: { restaurantId, zones: [...], tables: [...] }
// Reemplaza el layout completo del restaurante (upsert + delete de sobrantes).
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { restaurantId, zones, tables } = JSON.parse(event.body ?? '{}');
    if (!restaurantId) return json(400, { error: 'restaurantId requerido' });

    if (Array.isArray(zones)) {
      const { error: zErr } = await supabaseAdmin.from('zones').upsert(
        zones.map((z: Record<string, unknown>) => ({ ...z, restaurant_id: restaurantId }))
      );
      if (zErr) return json(500, { error: zErr.message });

      const keepZoneIds = zones.map((z: { id: string }) => z.id);
      if (keepZoneIds.length > 0) {
        await supabaseAdmin
          .from('zones')
          .delete()
          .eq('restaurant_id', restaurantId)
          .not('id', 'in', `(${keepZoneIds.join(',')})`);
      }
    }

    if (Array.isArray(tables)) {
      const { error: tErr } = await supabaseAdmin.from('tables').upsert(
        tables.map((t: Record<string, unknown>) => ({ ...t, restaurant_id: restaurantId }))
      );
      if (tErr) return json(500, { error: tErr.message });

      // Borra mesas eliminadas de las zonas presentes en el payload
      const zoneIds = [...new Set(tables.map((t: { zone_id: string }) => t.zone_id))];
      const keepTableIds = tables.map((t: { id: string }) => t.id);
      if (zoneIds.length > 0 && keepTableIds.length > 0) {
        await supabaseAdmin
          .from('tables')
          .delete()
          .in('zone_id', zoneIds)
          .not('id', 'in', `(${keepTableIds.join(',')})`);
      }
    }

    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
};
