import { useMenu } from '../hooks/useMenu';
import { menuItemToDish } from '../services/menuService';
import { dishes as fallbackDishes } from '../data/dishes';

export default function FeaturedDishSection() {
  const { menu } = useMenu();

  // El destacado es el primer plato fuerte del menú; si la BD está vacía,
  // usamos el platillo estrella estático.
  let featured = fallbackDishes[0];
  if (menu && menu.items.length > 0) {
    const fuertes = menu.categories.find((c) => /fuerte/i.test(c.name));
    const item = menu.items.find((i) => i.categoryId === fuertes?.id) ?? menu.items[0];
    featured = menuItemToDish(item, menu.categories);
  }

  return (
    <section className="home-featured">
      <div className="home-featured-bg" aria-hidden="true" />

      <div className="home-featured-inner">
        <div className="home-featured-copy">
          <span
            className="label-md"
            style={{ color: 'var(--secondary)', letterSpacing: '0.15em' }}
          >
            Especialidad de la Casa
          </span>
          <h2 className="home-h2">{featured.name}</h2>
          <p
            className="body-lg"
            style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--stack-md)' }}
          >
            {featured.description}
          </p>
          <div className="home-price-row">
            <span className="headline-md" style={{ color: 'var(--on-surface)' }}>
              {featured.price}
            </span>
            <div className="divider-line" />
          </div>
        </div>

        <div className="home-featured-media">
          <img className="rustic-border" src={featured.image} alt={featured.name} />
        </div>
      </div>
    </section>
  );
}
