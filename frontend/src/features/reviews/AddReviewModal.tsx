import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { createReview } from '../../services/reviewService';
import StarRating from './StarRating';

interface AddReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddReviewModal({ open, onClose, onSaved }: AddReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setRating(0);
      setComment('');
      setError('');
      setSaving(false);
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, saving]);

  if (!open) return null;

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Selecciona una calificación con estrellas.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createReview({ rating, comment });
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <div
        className="modal review-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <div className="modal-header">
          <h2 id="review-modal-title" className="headline-md">
            Agregar reseña
          </h2>
          <button type="button" className="review-modal-close" aria-label="Cerrar" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form className="review-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="review-form-field">
            <span className="label-md">Tu calificación</span>
            <StarRating value={rating} onChange={setRating} size={28} />
          </div>

          <label className="review-form-field">
            <span className="label-md">Comentario</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia en El Capirucho…"
              rows={4}
              maxLength={1000}
              disabled={saving}
            />
            <span className="review-char-count">{comment.trim().length}/10 mín.</span>
          </label>

          {error ? (
            <p className="review-form-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="review-form-actions">
            <button type="button" className="btn btn-outline" onClick={handleClose} disabled={saving}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || rating < 1 || comment.trim().length < 10}
            >
              {saving ? 'Publicando…' : 'Publicar reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
