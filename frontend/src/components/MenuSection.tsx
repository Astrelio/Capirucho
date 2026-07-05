import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { useMenu } from '../hooks/useMenu';
import { menuItemToDish } from '../services/menuService';
import { dishes as fallbackDishes } from '../data/dishes';
import DishCard from './DishCard';

export default function MenuSection() {
  const { ref, inView } = useInView<HTMLElement>();
  const { menu } = useMenu();

  const destacados =
    menu && menu.items.length >= 2
      ? menu.items.slice(0, 2).map((i) => menuItemToDish(i, menu.categories))
      : fallbackDishes.slice(1, 3);

  return (
    <section
      ref={ref}
      className={`section container reveal${inView ? ' is-visible' : ''}`}
      id="menu"
    >
      <div className="home-menu-head">
        <h2 className="home-h2" style={{ maxWidth: '28rem' }}>
          Platillos Destacados
        </h2>
        <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '24rem' }}>
          Una probada de nuestra mesa. Descubre algunos de los favoritos de la casa.
        </p>
      </div>

      <div className="home-menu-grid">
        {destacados.map((dish, i) => (
          <DishCard key={dish.name} dish={dish} offset={i === 1} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--section-gap)' }}>
        <Link to="/menu" className="cta-fill">
          Ver Menú Completo
          <span className="cta-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
