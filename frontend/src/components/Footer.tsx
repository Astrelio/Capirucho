export default function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-footer-top">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack-sm)', maxWidth: '24rem' }}>
          <div
            className="home-logo"
            style={{ fontSize: '2rem', marginBottom: '1rem' }}
          >
            El Capirucho
          </div>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
            Traditional Heritage, Modern Taste. Experience the warmth of our hearth.
          </p>
        </div>

        <div className="home-footer-cols">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack-sm)' }}>
            <h4 className="label-md" style={{ color: 'var(--outline)', marginBottom: '1rem' }}>
              Visit
            </h4>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
              123 Culinary Ave,
              <br />
              Gourmet City, GC 90210
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack-sm)' }}>
            <h4 className="label-md" style={{ color: 'var(--outline)', marginBottom: '1rem' }}>
              Connect
            </h4>
            <a className="body-md" style={{ color: 'var(--on-surface-variant)' }} href="#top">
              Instagram
            </a>
            <a className="body-md" style={{ color: 'var(--on-surface-variant)' }} href="#top">
              Facebook
            </a>
            <a className="body-md" style={{ color: 'var(--on-surface-variant)' }} href="#top">
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <div className="home-footer-bottom">
        <p className="caption">© 2024 El Capirucho. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a className="caption" href="#top">
            Privacy
          </a>
          <a className="caption" href="#top">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
