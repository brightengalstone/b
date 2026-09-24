import Link from 'next/link';

const categories = [
  { icon: '🛒', name: 'Groceries', text: 'Everyday essentials' },
  { icon: '🍔', name: 'Meals', text: 'Local food & takeaways' },
  { icon: '🏪', name: 'Local shops', text: 'Approved businesses' },
  { icon: '✨', name: 'More', text: 'Discover local services' },
];

const highlights = [
  { icon: '📍', title: 'Eersterust delivery', text: 'Built around your local community.' },
  { icon: '🚚', title: 'Simple delivery', text: 'One clear R60 delivery fee.' },
  { icon: '🔒', title: 'Secure accounts', text: 'Sign in and manage your orders.' },
];

export default function Home() {
  return (
    <>
      <section className="hero hero-home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> Eersterust • Local delivery</div>
          <h1>Local shopping.<br /><span>Made simple.</span></h1>
          <p className="hero-lead">
            Shop groceries, meals and approved local businesses through one simple platform.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/marketplace">Start shopping <span>→</span></Link>
            <Link className="btn btn-ghost" href="/signin">Sign in</Link>
          </div>
          <div className="hero-note"><span>✓</span> Serving Eersterust</div>
        </div>

        <div className="hero-panel">
          <div className="panel-top">
            <div className="logo-mark">BG</div>
            <div>
              <strong>BG Smart</strong>
              <small>Local marketplace</small>
            </div>
            <span className="live-pill">LIVE</span>
          </div>
          <div className="panel-search"><span>⌕</span> What are you looking for?</div>
          <div className="mini-list">
            <div><span className="mini-icon">🛒</span><div><strong>Fresh groceries</strong><small>Essentials & more</small></div><b>›</b></div>
            <div><span className="mini-icon">🍔</span><div><strong>Hot meals</strong><small>Local favourites</small></div><b>›</b></div>
            <div><span className="mini-icon">🏪</span><div><strong>Local businesses</strong><small>Shop your community</small></div><b>›</b></div>
          </div>
          <div className="delivery-card"><span>🚚</span><div><strong>Delivery to Eersterust</strong><small>R60 delivery • R45 service fee</small></div></div>
        </div>
      </section>

      <section className="section category-section">
        <div className="section-head">
          <div><div className="eyebrow">Explore</div><h2>Shop your way</h2></div>
          <Link className="text-link" href="/marketplace">View marketplace <span>→</span></Link>
        </div>
        <div className="category-grid">
          {categories.map((item) => (
            <Link className="category-card" href="/marketplace" key={item.name}>
              <div className="category-icon">{item.icon}</div>
              <div><h3>{item.name}</h3><p>{item.text}</p></div>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section trust-section">
        <div className="trust-heading">
          <div className="eyebrow">Why BG Smart</div>
          <h2>One platform for<br />your local needs.</h2>
        </div>
        <div className="highlight-grid">
          {highlights.map((item) => (
            <div className="highlight-card" key={item.title}>
              <div className="highlight-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <div className="eyebrow">Ready when you are</div>
          <h2>Let&apos;s get your order moving.</h2>
          <p>Browse the marketplace and discover what&apos;s available in Eersterust.</p>
        </div>
        <Link className="btn btn-light" href="/marketplace">Start shopping <span>→</span></Link>
      </section>
    </>
  );
}
