import Header from '../components/Header';
import Footer from '../components/Footer';
import DishCard from '../components/DishCard';
import { dishes } from '../data/dishes';
import '../components/home.css';

export default function MenuPage() {
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

          <div className="menu-page-grid" style={{ marginTop: 'var(--section-gap)' }}>
            {dishes.map((dish, i) => (
              <DishCard
                key={dish.name}
                dish={dish}
                showCategory
                className="stagger-item"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
