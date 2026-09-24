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
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h6l1-13M10 11v6M14 11v6" />
  </svg>
);

const StoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10v9h16v-9M3 10l2-6h14l2 6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
  </svg>
);

function ProductThumb({ item }) {
  if (item.image) return <img className="cart-product-image" src={item.image} alt="" />;
  return <div className="cart-product-placeholder" aria-hidden="true"><CartIcon /></div>;
}

export default function Cart() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(() => getOrderingStatus());
  const [storeNotice, setStoreNotice] = useState('');

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('bg_cart') || '[]')); }
    catch { setItems([]); }
    const tick = () => setStatus(getOrderingStatus());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0), [items]);
  const deliveryFee = items.length ? 65 : 0;
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const stores = useMemo(() => {
    const grouped = new Map();
    items.forEach(item => {
      const storeName = item.storeName || item.store || item.merchantName || 'Marketplace';
      if (!grouped.has(storeName)) grouped.set(storeName, []);
      grouped.get(storeName).push(item);
    });
    return Array.from(grouped.entries());
  }, [items]);

  function save(next) {
    setItems(next);
    if (next.length) localStorage.setItem('bg_cart', JSON.stringify(next));
    else localStorage.removeItem('bg_cart');
  }

  function changeQuantity(id, delta) {
    save(items.map(item => item.id !== id ? item : { ...item, quantity: Math.max(1, Number(item.quantity || 1) + delta) }));
  }

  function removeItem(id) { save(items.filter(item => item.id !== id)); }
  function clearCart() { save([]); }

  function continueWithStore(storeName) {
    const keep = items.filter(item => (item.storeName || item.store || item.merchantName || 'Marketplace') === storeName);
    save(keep);
    setStoreNotice('Your cart is now limited to ' + storeName + '.');
  }

  const canCheckout = items.length > 0 && stores.length === 1 && status.open;

  return (
    <main className="cart-page">
      <div className="cart-shell">
        <div className="cart-topbar">
          <Link className="cart-brand" href="/marketplace" aria-label="Back to marketplace">
            <span className="brand-mark"><CartIcon /></span><span>BG Smart Services</span>
          </Link>
          <Link className="cart-back" href="/marketplace">Continue shopping</Link>
        </div>

        <header className="cart-hero">
          <div>
            <div className="eyebrow">Shopping cart</div>
            <h1>Your cart</h1>
            <p>{items.length ? itemCount + ' ' + (itemCount === 1 ? 'item' : 'items') + ' from ' + stores.length + ' ' + (stores.length === 1 ? 'store' : 'stores') : 'Review your items before checkout.'}</p>
          {storeNotice && <div className="notice cart-store-notice">{storeNotice}</div>}
          </div>
          <div className="cart-hero-icon"><CartIcon /></div>
        </header>

        {!items.length ? (
          <section className="cart-empty">
            <div className="cart-empty-icon"><CartIcon /></div>
            <h2>Your cart is empty</h2>
            <p>Browse groceries, meals and products from approved local businesses and add what you need.</p>
            <Link className="btn btn-primary btn-large" href="/marketplace">Start shopping</Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-column" aria-label="Cart items">
              {stores.map(([storeName, storeItems]) => (
                <section className="cart-store-card" key={storeName}>
                  {stores.length > 1 && <div className="cart-store-switch"><span>Only one store can be checked out at a time.</span><button type="button" className="text-button" onClick={() => continueWithStore(storeName)}>Keep this store</button></div>}
                  <div className="cart-store-header">
                    <div className="cart-store-icon"><StoreIcon /></div>
                    <div>
                      <span className="cart-store-label">Store</span>
                      <h2>{storeName}</h2>
                    </div>
                    <span className="cart-store-count">{storeItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} items</span>
                  </div>

                  <div className="cart-product-list">
                    {storeItems.map(item => {
                      const quantity = Number(item.quantity || 1);
                      const price = Number(item.price || 0);
                      return (
                        <article className="cart-product-row" key={item.id}>
                          <div className="cart-product-visual"><ProductThumb item={item} /></div>
                          <div className="cart-product-details">
                            <div className="cart-product-copy">
                              <h3>{item.name}</h3><p>R{price.toFixed(2)} each</p>
                            </div>
                            <div className="cart-product-controls">
                              <div className="cart-quantity" aria-label={'Quantity for ' + item.name}>
                                <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={'Decrease quantity of ' + item.name}>−</button>
                                <span>{quantity}</span>
                                <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={'Increase quantity of ' + item.name}>+</button>
                              </div>
                              <button type="button" className="cart-remove" onClick={() => removeItem(item.id)} aria-label={'Remove ' + item.name}>
                                <TrashIcon /><span>Remove</span>
                              </button>
                            </div>
                          </div>
                          <strong className="cart-line-total">R{(price * quantity).toFixed(2)}</strong>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}

              <div className="cart-actions">
                <Link className="text-link" href="/marketplace">Add more items</Link>
                <button type="button" className="text-button" onClick={clearCart}>Clear cart</button>
              </div>
            </section>

            <aside className="cart-summary-card" aria-label="Order summary">
              <div className="cart-summary-heading">
                <div><span className="eyebrow">Order summary</span><h2>Checkout total</h2></div>
                <span className="cart-summary-count">{itemCount}</span>
              </div>
              <div className="cart-summary-lines">
                <div><span>Items</span><strong>R{subtotal.toFixed(2)}</strong></div>
                <div><span>Delivery</span><strong>R65.00</strong></div>
              </div>
              <div className="cart-summary-total"><span>Total</span><strong>R{total.toFixed(2)}</strong></div>

              {stores.length > 1 && <div className="hours-warning cart-hours"><strong>Multiple stores selected</strong><span>BG Smart Services checkout supports one store per order. Choose “Keep this store” above to continue with that store.</span></div>}

              <div className="cart-delivery-note">
                <span className="cart-note-icon"><StoreIcon /></span>
                <div><strong>Delivery to Eersterust</strong><p>Flat delivery fee of R65.00</p></div>
              </div>

              {!status.open ? (
                <div className="hours-warning cart-hours"><strong>Ordering is closed</strong><span>{status.message}</span></div>
              ) : status.warning ? (
                <div className="hours-warning cart-hours"><strong>Closing soon</strong><span>{status.message}</span></div>
              ) : (
                <div className="hours-status cart-hours"><strong>Open for orders</strong><span>Orders are currently being accepted.</span></div>
              )}

              {canCheckout ? (
                <Link className="btn btn-primary btn-large cart-checkout" href="/checkout">Proceed to checkout</Link>
              ) : (
                <button className="btn btn-primary btn-large cart-checkout" type="button" disabled>Orders closed</button>
              )}
              <p className="cart-secure-note">Your order details will be confirmed at checkout.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
