import { useInView } from '../hooks/useInView';

interface Dish {
  name: string;
  description: string;
  price: string;
  image: string;
  offset?: boolean;
}

const DISHES: Dish[] = [
  {
    name: 'Ceviche Tradicional',
    description:
      'Fresh catch of the day cured in citrus juices, spiced with aji pepper and sweet potato.',
    price: '$22',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZbThG4zDsMoaM_MMPbcodtvGtvgzTVFiuxmPmzMtDCifM2ZrZQviI2Rd-Dsf5TO0Q196wHDkQzPEFhpb1o7gAT_e9KhS4p7D-s49hnDUmn34ifVbCFObzOSfnbDJY4dJeiwRNdsAeVB1JjvKvZ62wsBZbpvsqD5lMJpWxlHyJMpEPvfKZux1At2QBvRe1NxjlK9oNvEtPEx9cgls15TOZroY9BqVH4enK9ImRBIhCjIwvUZgoUYyU8sn94RAilZleTL7SXjM_4rM',
  },
  {
    name: 'Volcán de Chocolate',
    description:
      'Warm, molten chocolate cake with a hint of local spice, paired with vanilla bean ice cream.',
    price: '$12',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQGTdDpN8s9h6bdK6N9snj8sLPGey-yBNom_qIzsaQGlTKn8IDFXJUZ-_1M_ZC3z8sM98a2EojxpkQS1RSFB7k4swkStF4hGhcnowFAFE92Gaz4Vve9dcyu6LXLKZxUI1XLkzPY47_b_DCfsg2UENPwer_J0CRWncvTED0eWS8HCbod8bhibxgvI2SqtWoE6ft5lFMkd2sMj6V_1i-H0WzZk5mVVZeRC87bMWFgEdyiPI3s02H6e6z4XMEHrfYOSzRW28DJNsjQwQ',
    offset: true,
  },
];

export default function MenuSection() {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className={`section container reveal${inView ? ' is-visible' : ''}`}
      id="menu"
    >
      <div className="home-menu-head">
        <h2 className="home-h2" style={{ maxWidth: '28rem' }}>
          Delicias del Mar y la Tierra
        </h2>
        <a href="#menu" className="home-menu-link">
          View Full Menu
        </a>
      </div>

      <div className="home-menu-grid">
        {DISHES.map((dish) => (
          <article
            key={dish.name}
            className={`home-dish${dish.offset ? ' home-dish--offset' : ''}`}
          >
            <div className="home-dish-frame">
              <img src={dish.image} alt={dish.name} />
            </div>
            <div className="home-dish-meta">
              <div>
                <h3 className="headline-md home-dish-title" style={{ marginBottom: 8 }}>
                  {dish.name}
                </h3>
                <p
                  className="body-md"
                  style={{ color: 'var(--on-surface-variant)', maxWidth: '24rem' }}
                >
                  {dish.description}
                </p>
              </div>
              <span className="headline-md" style={{ color: 'var(--outline)' }}>
                {dish.price}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
