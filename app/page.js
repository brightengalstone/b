import Link from 'next/link';
import {ArrowRight, CheckCircle2, MapPin, ShoppingCart, Truck} from 'lucide-react';

export default function Welcome(){
  return (
    <main className="reference-welcome">
      <div className="reference-grid" aria-hidden="true"><span/><span/><span/><span/><span/><span/></div>
      <div className="reference-glow reference-glow-one" aria-hidden="true"/>
      <div className="reference-glow reference-glow-two" aria-hidden="true"/>
      <section className="reference-welcome-content">
        <div className="reference-logo"><span className="reference-logo-mark">BG</span><span className="reference-cart-mark"><ShoppingCart size={23}/></span><strong>SMART SERVICES</strong></div>
        <div className="reference-kicker">SHOP LOCAL <b>•</b> DELIVER LOCAL <b>•</b> EERSTERUST ONLY</div>
        <div className="reference-welcome-copy"><span className="reference-script">Your local shopping</span><h1>delivery partner.</h1><p>Shop from local stores and restaurants, then let BG Smart Services bring your order to your door in Eersterust.</p></div>
        <div className="reference-features">
          <div><MapPin size={18}/><span><strong>Eersterust only</strong><small>Local delivery zone</small></span></div>
          <div><Truck size={18}/><span><strong>R65 delivery</strong><small>No service fee</small></span></div>
          <div><CheckCircle2 size={18}/><span><strong>Simple & secure</strong><small>Track your order</small></span></div>
        </div>
        <Link className="reference-green-button" href="/signin">Get Started <ArrowRight size={18}/></Link>
        <p className="reference-existing">Already have an account? <Link href="/signin">Sign in</Link></p>
      </section>
      <section className="reference-visual" aria-label="BG Smart Services delivery">
        <div className="reference-visual-badge"><span className="live-dot"/> Available in Eersterust</div>
        <div className="reference-tuk-card"><div className="reference-tuk-roof">BG SMART SERVICES</div><div className="reference-tuk-body"><div className="reference-tuk-window"><span/><span/><span/></div><div className="reference-tuk-wheel left"/><div className="reference-tuk-wheel right"/><div className="reference-tuk-side">SHOP LOCAL<br/><b>DELIVER LOCAL</b></div></div></div>
        <div className="reference-route"><span/><i/><span/></div>
        <div className="reference-mini-card reference-mini-card-one"><ShoppingCart size={17}/><span>Groceries<small>Pick n Pay • Checkers</small></span></div>
        <div className="reference-mini-card reference-mini-card-two"><Truck size={17}/><span>Fast delivery<small>Across Eersterust</small></span></div>
      </section>
    </main>
  );
}