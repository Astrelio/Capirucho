import type { CSSProperties } from 'react';
import type { Dish } from '../data/dishes';

interface DishCardProps {
  dish: Dish;
  offset?: boolean;
  className?: string;
  style?: CSSProperties;
  showCategory?: boolean;
}

export default function DishCard({
  dish,
  offset = false,
  className = '',
  style,
  showCategory = false,
}: DishCardProps) {
  return (
    <article
      className={`home-dish${offset ? ' home-dish--offset' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      <div className="home-dish-frame">
        <img src={dish.image} alt={dish.name} />
      </div>
      <div className="home-dish-meta">
        <div>
          {showCategory && (
            <span
              className="label-md"
              style={{ color: 'var(--secondary)', letterSpacing: '0.15em', fontSize: 12 }}
            >
              {dish.category}
            </span>
          )}
          <h3 className="headline-md home-dish-title" style={{ marginTop: 6, marginBottom: 8 }}>
            {dish.name}
          </h3>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '24rem' }}>
            {dish.description}
          </p>
        </div>
        <span className="headline-md" style={{ color: 'var(--outline)', flexShrink: 0 }}>
          {dish.price}
        </span>
      </div>
    </article>
  );
}
