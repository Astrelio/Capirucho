import { supabase } from '../config/supabase';
import { getRestaurantId } from './menuService';

export interface Review {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string | null;
}

type ReviewRow = {
  id: string;
  guest_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string | null;
};

function friendlyDbError(message: string): string {
  const codeMatch = message.match(/^[A-Z_]+:\s*(.+)$/);
  if (codeMatch) return codeMatch[1];

  if (/AUTH_REQUIRED|JWT/i.test(message)) {
    return 'Debes iniciar sesión para publicar una reseña.';
  }
  if (/row-level security/i.test(message)) {
    return 'No se pudo guardar la reseña. Ejecuta supabase/005_reviews_write.sql en Supabase.';
  }
  if (/DUPLICATE|idx_reviews_one_per_user|duplicate key|unique constraint/i.test(message)) {
    return 'Ya publicaste una reseña. Solo se permite una por persona.';
  }
  if (/FORBIDDEN/i.test(message)) {
    return 'No tienes permisos para realizar esta acción.';
  }
  return message;
}

function mapRow(row: ReviewRow): Review {
  return {
    id: row.id,
    guestName: row.guest_name?.trim() || 'Cliente',
    rating: row.rating,
    comment: row.comment?.trim() ?? '',
    createdAt: row.created_at,
    userId: row.user_id,
  };
}

export async function loadReviews(): Promise<Review[]> {
  const restaurantId = await getRestaurantId();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, guest_name, rating, comment, created_at, user_id')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ReviewRow[]).map(mapRow);
}

export async function createReview(input: {
  rating: number;
  comment: string;
}): Promise<void> {
  const rating = Math.round(input.rating);
  const comment = input.comment.trim();
  if (rating < 1 || rating > 5) {
    throw new Error('Selecciona una calificación entre 1 y 5 estrellas.');
  }
  if (comment.length < 10) {
    throw new Error('El comentario debe tener al menos 10 caracteres.');
  }

  const restaurantId = await getRestaurantId();
  const { error } = await supabase.rpc('submit_review', {
    p_restaurant_id: restaurantId,
    p_rating: rating,
    p_comment: comment,
  });

  if (error) {
    if (/Could not find the function|42883/i.test(error.message)) {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('Debes iniciar sesión para publicar una reseña.');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', authData.user.id)
        .maybeSingle<{ full_name: string | null; email: string | null }>();

      const guestName =
        profile?.full_name?.trim() ||
        profile?.email?.trim() ||
        (authData.user.user_metadata?.full_name as string | undefined)?.trim() ||
        authData.user.email ||
        'Cliente';

      const { error: insertError } = await supabase.from('reviews').insert({
        restaurant_id: restaurantId,
        user_id: authData.user.id,
        guest_name: guestName,
        rating,
        comment,
      });
      if (insertError) throw new Error(friendlyDbError(insertError.message));
      return;
    }
    throw new Error(friendlyDbError(error.message));
  }
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.rpc('delete_review', { p_review_id: id });
  if (error) {
    if (/Could not find the function|42883/i.test(error.message)) {
      const { error: deleteError } = await supabase.from('reviews').delete().eq('id', id);
      if (deleteError) throw new Error(friendlyDbError(deleteError.message));
      return;
    }
    throw new Error(friendlyDbError(error.message));
  }
}
