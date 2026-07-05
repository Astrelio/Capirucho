import { Trash2 } from 'lucide-react';
import type { Review } from '../../services/reviewService';
import StarRating from './StarRating';

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  emptyMessage?: string;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ReviewList({
  reviews,
  loading = false,
  emptyMessage = 'Aún no hay reseñas. Sé el primero en compartir tu experiencia.',
  showDelete = false,
  onDelete,
  deletingId = null,
}: ReviewListProps) {
  if (loading) {
    return <p className="review-list-empty">Cargando reseñas…</p>;
  }

  if (reviews.length === 0) {
    return <p className="review-list-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <li key={review.id} className="review-card">
          <div className="review-card-header">
            <div>
              <p className="review-card-name">{review.guestName}</p>
              <p className="review-card-date">{formatDate(review.createdAt)}</p>
            </div>
            <div className="review-card-actions">
              <StarRating value={review.rating} size={16} />
              {showDelete && onDelete ? (
                <button
                  type="button"
                  className="review-delete-btn"
                  aria-label={`Eliminar reseña de ${review.guestName}`}
                  title="Eliminar reseña"
                  disabled={deletingId === review.id}
                  onClick={() => {
                    if (window.confirm(`¿Eliminar la reseña de ${review.guestName}?`)) {
                      onDelete(review.id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              ) : null}
            </div>
          </div>
          <p className="review-card-comment">{review.comment}</p>
        </li>
      ))}
    </ul>
  );
}
