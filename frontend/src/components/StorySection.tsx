import { useInView } from '../hooks/useInView';

const STORY_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZKIW3t6QXmqVWyERjYpXnzyAFolO63Wn8eAkKjroT5MrG18KPWVQCz6T7p70Kr1XHAtmp-0fTr1OQ_ssIuiYHDw0kKpo-x0X6Ddf0cciLpQ5PacM2N-LRcEGIs6mwKwFy-gxy7v0dJRTLDNKhrPydNx7ev6KkY4hFBlLXCpUXDC5MuX7JXrZQuCaGOIP25LCI9NcndPVTvXK1J-es4bax16SwM5fIN_cimjyMP-9yNuXqOewucW1ohk3vXEAN9YH9dwukDoqll6o';

export default function StorySection() {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className={`section container reveal${inView ? ' is-visible' : ''}`}
      id="story"
    >
      <div className="home-split">
        <div className="home-story-img">
          <img className="rustic-border" src={STORY_IMG} alt="Nuestra cocina" />
        </div>

        <div className="home-story-panel">
          <h2 className="home-h2">
            Nuestra
            <br />
            Historia
          </h2>
          <div className="divider" />
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>
            At El Capirucho, every dish tells a story. Born from a deep love for our cultural
            heritage, our kitchen is a tribute to the rustic, hearth-cooked meals of our ancestors.
            We believe in the power of simple, fresh ingredients transformed by time-honored
            techniques.
          </p>
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>
            Our journey began with a single family recipe and a desire to share the authentic
            flavors of our home. Today, we blend that traditional soul with a modern aesthetic,
            creating a dining experience that is both comforting and sophisticated. Welcome to our
            table.
          </p>
        </div>
      </div>
    </section>
  );
}
