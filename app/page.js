import Link from 'next/link';

export default function Welcome() {
  return (
    <main className="welcome-screen">
      <div className="welcome-visual" aria-hidden="true">
        <div className="visual-orb orb-one" />
        <div className="visual-orb orb-two" />
        <div className="delivery-scene">
          <div className="scene-card"><span className="scene-line" /><span className="scene-line short" /><span className="scene-dot" /></div>
          <div className="scene-route"><span /><span /><span /></div>
        </div>
      </div>
      <section className="welcome-content">
        <div className="welcome-brand"><span className="brand-mark">BG</span><span>Smart Services</span></div>
        <div className="welcome-kicker">Eersterust delivery platform</div>
        <h1>Everything you need,<br /><span>delivered simply.</span></h1>
        <p>Shop groceries, meals and food, and approved alcohol sellers through one modern local platform.</p>
        <div className="welcome-actions">
          <Link className="btn btn-primary btn-large" href="/signin">Get Started <span>→</span></Link>
          <Link className="btn btn-ghost btn-large" href="/signin">Sign In</Link>
        </div>
        <div className="welcome-trust"><span className="trust-mark">✓</span><span>Serving Eersterust</span><span className="trust-divider" /><span>Delivery R60</span><span className="trust-divider" /><span>Service R45</span></div>
      </section>
    </main>
  );
}
