const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAADo0thPmFSgo2cs-rbEedL_JSyQsz4bhcDURgMs6bJGFjRoLm6LWfF5wSI0aBet9DtfiWxMmj8JtSp-H5LCeyCDMGZe22VGf5XNdwgxBeYTVnu6G34ruVS4516it6yUcIy7SMTpnnp8mAxPXSgsv7-v4MaquOHnrj5y7-7GZK5r8cSujIKyzUjcIYjOBlycYpOb5sCR3_IPJ1dKAFkdqvG7AnUk4HBf1jfCQLJrOtGRvs4jpSAX7cwbq6plpoB7_rLi2s_xe_A8E';

export default function HeroSection() {
  return (
    <section className="home-hero" id="top">
      <div className="home-hero-copy">
        <h1 className="home-hero-title">
          Sabor que
          <br />
          <span>Tradición</span>
        </h1>
        <p
          className="body-lg"
          style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--stack-lg)' }}
        >
          Experience the warmth of family recipes passed down through generations, crafted with
          modern culinary precision in the heart of the city.
        </p>
        <a href="#reservations" className="btn btn-primary">
          Discover Our Heritage
        </a>
      </div>

      <div className="home-hero-media">
        <img className="rustic-border" src={HERO_IMG} alt="Plato principal El Capirucho" />
        <div className="home-quote-card">
          <p
            className="headline-md"
            style={{ fontStyle: 'italic', color: 'var(--on-surface)', marginBottom: 8 }}
          >
            "The essence of the hearth."
          </p>
          <span className="caption">Est. 2024</span>
        </div>
      </div>
    </section>
  );
}
