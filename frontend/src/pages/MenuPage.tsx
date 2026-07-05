import Header from '../components/Header';
import Footer from '../components/Footer';
import DishCard from '../components/DishCard';
import { dishes as fallbackDishes, type Dish } from '../data/dishes';
import { useMenu } from '../hooks/useMenu';
import { menuItemToDish } from '../services/menuService';
import '../components/home.css';

interface MenuGroup {
  category: string;
  dishes: Dish[];
}

export default function MenuPage() {
  const { menu, loading } = useMenu();

  let groups: MenuGroup[];
  if (menu && menu.items.length > 0) {
    const orderedCategories = [
      ...menu.categories,
      { id: null as string | null, name: 'Especiales', sortOrder: Number.MAX_SAFE_INTEGER },
    ];
    groups = orderedCategories
      .map((cat) => ({
        category: cat.name,
        dishes: menu.items
          .filter((i) => i.categoryId === cat.id)
          .map((i) => menuItemToDish(i, menu.categories)),
      }))
      .filter((g) => g.dishes.length > 0);
  } else {
    // Fallback estático si la BD aún no tiene menú
    const categories = [...new Set(fallbackDishes.map((d) => d.category))];
    groups = categories.map((category) => ({
      category,
      dishes: fallbackDishes.filter((d) => d.category === category),
    }));
  }

  return (
    <div className="fade-in">
      <Header />
      <main>
        <section className="section container">
          <p className="caption">La Carta</p>
          <h1 className="home-h2" style={{ marginBlock: 'var(--stack-md)' }}>
            Nuestro Menú
          </h1>
          <div className="divider" style={{ marginBottom: 'var(--stack-lg)' }} />
          <p
            className="body-lg"
            style={{ color: 'var(--on-surface-variant)', maxWidth: '40rem' }}
          >
            Cada platillo es un homenaje a la tradición, preparado con ingredientes frescos y
            técnicas cocinadas a fuego lento. Descubre nuestra selección completa.
          </p>

          {loading ? (
            <p className="body-lg" style={{ marginTop: 'var(--section-gap)', color: 'var(--on-surface-variant)' }}>
              Cargando menú…
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.category} style={{ marginTop: 'var(--section-gap)' }}>
                <h2
                  className="headline-md"
                  style={{ color: 'var(--secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  {group.category}
                </h2>
                <div className="menu-page-grid" style={{ marginTop: 'var(--stack-lg)' }}>
                  {group.dishes.map((dish, i) => (
                    <DishCard
                      key={dish.name}
                      dish={dish}
                      className="stagger-item"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
