const FEATURED_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDCyazzAfwBAjo0dJ4n0PYjjUD2FszQFsPvj-n9EqhGdOEaBYdShDIfbxA4IZ60WIH9qxkIC52r-02qt0r10GOCBIL6AjJLqMsRyZ1xdKGZb0XorxhtxotuEnwBiwBQ3cH_i5ikcp5u0kHDOqa_8w5rO4-wfvXq8H8HPBqNu5QV_7KSeEXjI0pjHrb1MV9Rk0OnRRGsZxE2etNqNijrhmojv9rAb2xP9QSXtbzjTUZSWvGm2E_63BvQ0ly83hDIgW8ZlI74b2S3orE';

export default function FeaturedDishSection() {
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
          <h2 className="home-h2">Costilla Estofada</h2>
          <p
            className="body-lg"
            style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--stack-md)' }}
          >
            Slow-braised beef ribs with rustic herbs, served over creamy maize purée. A masterclass
            in slow cooking, highlighting the rich, deep flavors of tradition.
          </p>
          <div className="home-price-row">
            <span className="headline-md" style={{ color: 'var(--on-surface)' }}>
              $28
            </span>
            <div className="divider-line" />
          </div>
        </div>

        <div className="home-featured-media">
          <img className="rustic-border" src={FEATURED_IMG} alt="Costilla Estofada" />
        </div>
      </div>
    </section>
  );
}
