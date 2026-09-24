import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'BG Smart Services',
  description: 'Local shopping, delivered in Eersterust.',
};

export default function Layout({ children }) {
  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand"><span className="brand-mark">BG</span><span className="brand-name">Smart Services</span></Link>
        <nav className="main-nav">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/account">Account</Link>
          <Link href="/cart" className="cart-link">Cart</Link>
          <Link href="/signin" className="nav-signin">Sign in</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer"><div><strong>BG Smart Services</strong><span>Local shopping, delivered in Eersterust.</span></div><span>Delivery R60 • Service R45</span></footer>
    </>
  );
}
