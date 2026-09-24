'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getOrderingStatus } from '../../lib/operating-hours';

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 7H6" />
    <circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h6l1-13M10 11v6M14 11v6" />
  </svg>
);

export default function Cart() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(() => getOrderingStatus());

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem('bg_cart') || '[]'));
    } catch {
      setItems([]);
    }

    const tick = () => setStatus(getOrderingStatus());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );
  const deliveryFee = items.length ? 65 : 0;
  const total = subtotal + deliveryFee;

  function save(next) {
    setItems(next);
    if (next.length) localStorage.setItem('bg_cart', JSON.stringify(next));
    else localStorage.removeItem('bg_cart');
  }

  function changeQuantity(id, delta) {
    save(items.map(item => {
      if (item.id !== id) return item;
      return { ...item, quantity: Math.max(1, Number(item.quantity || 1) + delta) };
    }));
  }

  function removeItem(id) {
    save(items.filter(item => item.id !== id));
  }

  function clearCart() {
    save([]);
  }

  const canCheckout = items.length > 0 && status.open;

  return (
    <main className="page narrow" style={{ paddingBottom: 70 }}>
      <div className="eyebrow">BG Smart Services</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Your cart</h1>
          <p style={{ margin: 0, color: '#667085' }}>
            {items.length ? `${items.length} ${items.length === 1 ? 'item' : 'items'} ready for checkout` : 'Nothing has been added yet'}
          </p>
        </div>
        <div className="brand-mark" aria-hidden="true"><CartIcon /></div>
      </div>

      {!items.length ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 28px' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: 20, background: '#f0f2f5', display: 'grid', placeItems: 'center' }}>
            <CartIcon />
          </div>
          <h2 style={{ marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ color: '#667085', lineHeight: 1.55, maxWidth: 430, margin: '0 auto 24px' }}>
            Browse the marketplace and add groceries, meals or products to your cart.
          </p>
          <Link className="btn btn-primary" href="/marketplace">Continue shopping</Link>
        </div>
      ) : (
        <>
          <section className="list" aria-label="Cart items">
            {items.map(item => {
              const quantity = Number(item.quantity || 1);
              const price = Number(item.price || 0);
              const storeName = item.storeName || item.store || item.merchantName || 'Marketplace';

              return (
                <article className="item" key={item.id} style={{ alignItems: 'center', gap: 16 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="eyebrow" style={{ marginBottom: 5 }}>{storeName}</div>
                    <b style={{ display: 'block', fontSize: 16 }}>{item.name}</b>
                    <p style={{ margin: '6px 0 14px', color: '#667085', fontSize: 13 }}>R{price.toFixed(2)} each</p>

                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #dfe3ea', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                      <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Decrease quantity of ${item.name}`} style={{ width: 38, height: 36, fontSize: 20 }}>−</button>
                      <span style={{ minWidth: 34, textAlign: 'center', fontWeight: 800 }}>{quantity}</span>
                      <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Increase quantity of ${item.name}`} style={{ width: 38, height: 36, fontSize: 20 }}>+</button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'grid', justifyItems: 'end', gap: 12 }}>
                    <b>R{(price * quantity).toFixed(2)}</b>
                    <button type="button" className="text-button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <TrashIcon /> Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 28px' }}>
            <Link className="text-link" href="/marketplace">Continue shopping</Link>
            <button type="button" className="text-button" onClick={clearCart}>Clear cart</button>
          </div>

          <section className="card summary" aria-label="Order summary">
            <div><span>Subtotal</span><b>R{subtotal.toFixed(2)}</b></div>
            <div><span>Delivery</span><b>R65.00</b></div>
            <hr />
            <div className="total"><span>Total</span><b>R{total.toFixed(2)}</b></div>

            <div style={{ marginTop: 20 }}>
              {!status.open ? (
                <div className="notice" style={{ marginBottom: 14 }}>
                  <strong>Ordering is closed</strong>
                  <div style={{ marginTop: 4 }}>{status.message}</div>
                </div>
              ) : status.warning ? (
                <div className="hours-warning" style={{ marginBottom: 14 }}>
                  <strong>Closing soon</strong>
                  <span>{status.message} Orders placed within the final hour are not accepted after closing.</span>
                </div>
              ) : (
                <div className="hours-status" style={{ marginBottom: 14 }}>
                  <strong>Open for orders</strong>
                  <span>Orders are currently being accepted.</span>
                </div>
              )}
            </div>

            {canCheckout ? (
              <Link className="btn btn-primary btn-large" href="/checkout" style={{ width: '100%' }}>
                Proceed to checkout
              </Link>
            ) : (
              <button className="btn btn-primary btn-large" type="button" disabled style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>
                Orders closed
              </button>
            )}
          </section>
        </>
      )}
    </main>
  );
}
