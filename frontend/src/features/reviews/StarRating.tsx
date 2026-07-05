import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  label?: string;
}

export default function StarRating({ value, onChange, size = 20, label }: StarRatingProps) {
  const interactive = Boolean(onChange);

  return (
    <div
      className={`star-rating${interactive ? ' star-rating--interactive' : ''}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={label ?? `Calificación: ${value} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className={`star-rating-btn${filled ? ' filled' : ''}`}
              aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
              aria-pressed={value === star}
              onClick={() => onChange?.(star)}
            >
              <Star size={size} fill={filled ? 'currentColor' : 'none'} />
            </button>
          );
        }
        return (
          <span key={star} className={`star-rating-star${filled ? ' filled' : ''}`} aria-hidden="true">
            <Star size={size} fill={filled ? 'currentColor' : 'none'} />
          </span>
        );
      })}
    </div>
  );
}
