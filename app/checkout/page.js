'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Search, ShieldCheck, Store, CreditCard, Banknote, Landmark, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import NotificationBell from '../../components/NotificationBell';
import { getOrderingStatus } from '../../lib/operating-hours';

const DeliveryMap = dynamic(() => import('../../components/DeliveryMap'), { ssr: false });


function money(value) {
  return 'R' + Number(value || 0).toFixed(2);
}

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(() => getOrderingStatus());
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([-25.7162, 28.3125]);
  const [deliveryPin, setDeliveryPin] = useState(null);
  const [verifiedAddress, setVerifiedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [rewardCredit, setRewardCredit] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bg_cart') || '[]');
      setItems(saved.map(item => ({
        ...item,
        image_url: item.image_url || item.image || ''
      })));
    } catch {
      setItems([]);
    }

    (async () => {
      // Hydrate legacy cart entries from the live catalogue so Review your order
      // always uses the same exact product image as the Marketplace.
      try {
        const saved = JSON.parse(localStorage.getItem('bg_cart') || '[]');
        const ids = saved.map(item => item.id).filter(id => id && !String(id).startsWith('demo-'));
        let productRows = [];
        if (supabase && ids.length) {
          const { data } = await supabase
            .from('retailer_products')
            .select('id,name,category,image_url')
            .in('id', ids);
          productRows = data || [];
        }
        const byId = Object.fromEntries(productRows.map(p => [p.id, p]));
        const hydrated = saved.map(item => {
          const product = byId[item.id];
          const fallback = !item.image_url && !item.image && /chicken licken/i.test(item.storeName || item.store || item.merchantName || '')
            ? '/api/chicken-licken-image?' + new URLSearchParams({ name: item.name || product?.name || '', category: item.category || product?.category || '' }).toString()
            : '';
          return {
            ...item,
            image_url: item.image_url || item.image || product?.image_url || fallback || '',
          };
        });
        setItems(hydrated);
        localStorage.setItem('bg_cart', JSON.stringify(hydrated));
      } catch {
        try { setItems(JSON.parse(localStorage.getItem('bg_cart') || '[]')); } catch { setItems([]); }
      }

      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: reward } = await supabase.from('reward_accounts').select('delivery_credit').eq('customer_id', user.id).maybeSingle();
      setRewardCredit(Number(reward?.delivery_credit || 0));

      const { data } = await supabase
        .from('customer_addresses')
        .select('id,label,address_line,suburb,instructions,is_default')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      setSavedAddresses(data || []);
      const d = (data || []).find(x => x.is_default);
      if (d) setAddress([d.address_line, d.suburb].filter(Boolean).join(', '));
    })();

    const tick = () => setStatus(getOrderingStatus());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );
  const baseDeliveryFee = items.length ? 65 : 0;
  const appliedRewardCredit = Math.min(baseDeliveryFee, Math.max(0, rewardCredit));
  const deliveryFee = baseDeliveryFee - appliedRewardCredit;
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const stores = useMemo(
    () => [...new Set(items.map(x => x.retailer_id || x.storeId || x.storeName || x.store || x.merchantName || 'Marketplace'))],
    [items]
  );

  function chooseSavedAddress(value) {
    const d = savedAddresses.find(x => x.id === value);
    setAddress(d ? [d.address_line, d.suburb].filter(Boolean).join(', ') : '');
    setVerifiedAddress(null);
    setDeliveryPin(null);
    setMsg('');
  }

  async function verifyAddress() {
    const query = address.trim();
    if (!query) {
      setMsg('Enter your street address first.');
      return;
    }

    setSearching(true);
    setMsg('');
    setVerifiedAddress(null);
    setDeliveryPin(null);

    try {
      const response = await fetch('/api/geocode?street=' + encodeURIComponent(query), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      const payload = response.ok ? await response.json() : { results: [] };
      const results = Array.isArray(payload.results) ? payload.results : [];

      if (results[0]?.lat && results[0]?.lon) {
        const center = [Number(results[0].lat), Number(results[0].lon)];
        setMapCenter(center);
        const result = results[0];
        const a = result.address || {};
        const label = result.display_name || [[a.house_number, a.road].filter(Boolean).join(' '), a.suburb || 'Eersterust', a.city || 'Pretoria', a.postcode].filter(Boolean).join(', ');
        const verified = { label, latitude: Number(result.lat), longitude: Number(result.lon) };
        setDeliveryPin({ latitude: verified.latitude, longitude: verified.longitude });
        setVerifiedAddress(verified);
        setAddress(label);
        setMsg('Address verified successfully.');
      } else {
        setMsg(payload.error || 'We could not find that address in Eersterust. Check the street name and house number, then try again.');
        setMapCenter([-25.7069, 28.3092]);
      }
    } catch {
      setMsg('The map search is unavailable right now. You can still choose your delivery point directly on the map.');
    } finally {
      setSearching(false);
    }
  }

  async function verifyPin(pin) {
    setSearching(true);
    setMsg('');

    try {
      const response = await fetch('/api/geocode?lat=' + encodeURIComponent(pin.latitude) + '&lon=' + encodeURIComponent(pin.longitude), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        setMsg('We could not verify this map point. Please try again.');
        setDeliveryPin(null);
        return;
      }

      const payload = await response.json();
      if (!payload.inEersterust || !payload.result) {
        setMsg('That delivery point is outside Eersterust. Move the pin to your address inside Eersterust.');
        setDeliveryPin(null);
        setVerifiedAddress(null);
        return;
      }

      const result = payload.result;
      const a = result.address || {};
      const label = [
        [a.house_number, a.road].filter(Boolean).join(' '),
        a.suburb || 'Eersterust',
        a.city || 'Pretoria',
        a.postcode
      ].filter(Boolean).join(', ') || result.display_name;

      setDeliveryPin(pin);
      setVerifiedAddress({
        label,
        latitude: pin.latitude,
        longitude: pin.longitude,
      });
      setAddress(label);
      setMapCenter([pin.latitude, pin.longitude]);
      setMsg('');
    } catch {
      setMsg('The map could not verify this point right now. Please try again.');
      setDeliveryPin(null);
      setVerifiedAddress(null);
    } finally {
      setSearching(false);
    }
  }

  async function place(e) {
    e.preventDefault();
    const current = getOrderingStatus();
    setStatus(current);

    if (!current.open) {
      setMsg(current.message);
      return;
    }

    if (!address.trim()) {
      setMsg('Please enter a delivery address before placing the order.');
      return;
    }

    setBusy(true);
    setMsg('');

    if (!supabase) {
      setMsg('Supabase is not configured.');
      setBusy(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMsg('Please sign in before checkout.');
      setBusy(false);
      return;
    }

    if (!items.length) {
      setMsg('Your cart is empty.');
      setBusy(false);
      return;
    }

    if (stores.length !== 1) {
      setMsg('You can only shop at one store at a time. Return to your cart and keep one store.');
      setBusy(false);
      return;
    }

    const first = items.find(x => !String(x.id).startsWith('demo-'));
    if (!first) {
      setMsg('The starter products are for preview only. Real Supabase products are required before checkout.');
      setBusy(false);
      return;
    }

    const retailerId = first.retailer_id || first.storeId || null;

    if (!retailerId) {
      setMsg('We could not identify the selected store. Return to your cart and select a store again.');
      setBusy(false);
      return;
    }

    const rpcItems = items.map(x => ({
      retailer_product_id: x.id,
      quantity: Number(x.quantity || 1)
    }));

    const { data: orderId, error: orderError } = await supabase.rpc('create_order_with_items', {
      p_retailer_id: retailerId,
      p_items: rpcItems,
      p_delivery_address: verifiedAddress?.label || address.trim(),
      p_delivery_latitude: verifiedAddress?.latitude ?? null,
      p_delivery_longitude: verifiedAddress?.longitude ?? null,
      p_delivery_address_verified: Boolean(verifiedAddress),
      p_notes: notes,
      p_payment_method: paymentMethod,
      p_reward_credit: appliedRewardCredit
    });

    if (orderError) {
      setMsg(orderError.message || 'We could not place the order. Please try again.');
      setBusy(false);
      return;
    }

    if (!orderId) {
      setMsg('The order was not created. Please try again.');
      setBusy(false);
      return;
    }

    localStorage.removeItem('bg_cart');
    window.location.href = '/order-success?id=' + encodeURIComponent(orderId);
  }

  return (
    <main className="checkout-page">
      <div className="checkout-shell">
        <header className="checkout-topbar">
          <Link href="/cart" className="checkout-brand">
            <span className="brand-mark">BG</span>
            <span>BG Smart Services</span>
          </Link>
          <div className="checkout-top-actions"><NotificationBell /><Link href="/cart" className="checkout-back"><ArrowLeft size={17} /> Back to cart</Link></div>
        </header>

        <div className="checkout-heading">
          <div>
            <div className="eyebrow">Secure checkout</div>
            <h1>Review your order</h1>
            <p>Check every item and verify your delivery point on the map before placing the order.</p>
          </div>
          <div className="checkout-zone"><MapPin size={17} /><span>Eersterust only</span></div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            <section className="checkout-card">
              <div className="checkout-section-head">
                <div><span className="eyebrow">01</span><h2>Your items</h2></div>
                <span className="checkout-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              </div>

              <div className="checkout-store">
                <Store size={18} />
                <div><span>Shopping from</span><strong>{items[0]?.storeName || items[0]?.store || items[0]?.merchantName || 'Selected store'}</strong></div>
              </div>

              <div className="checkout-items">
                {items.map(item => {
                  const quantity = Number(item.quantity || 1);
                  const price = Number(item.price || 0);
                  return (
                    <article className="checkout-item" key={item.id}>
                      <div className="checkout-item-image">
                        {item.image_url ? <img src={item.image_url} alt={item.name || 'Product'} loading="lazy" /> : <Store size={21} />}
                      </div>
                      <div className="checkout-item-info">
                        <strong>{item.name}</strong>
                        <span>{money(price)} each · Quantity {quantity}</span>
                      </div>
                      <strong className="checkout-item-total">{money(price * quantity)}</strong>
                    </article>
                  );
                })}
              </div>

              <Link href="/cart" className="checkout-edit"><ArrowLeft size={15} /> Edit cart</Link>
            </section>

            <section className="checkout-card">
              <div className="checkout-section-head">
                <div><span className="eyebrow">02</span><h2>Delivery address</h2></div>
                <span className="verified-pill"><ShieldCheck size={15} /> Map verified</span>
              </div>

              <div className="address-security">
                <ShieldCheck size={19} />
                <div><strong>Map location required</strong><p>Type your full street address and select Verify. If the address is found in Eersterust, it is automatically verified and the map is positioned at the address.</p></div>
              </div>

              {savedAddresses.length > 0 && (
                <label className="checkout-field">
                  <span>Saved addresses</span>
                  <select defaultValue="" onChange={e => chooseSavedAddress(e.target.value)}>
                    <option value="">Choose a saved address</option>
                    {savedAddresses.map(x => (
                      <option value={x.id} key={x.id}>{x.label} · {[x.address_line, x.suburb].filter(Boolean).join(', ')}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="checkout-field">
                <span>Delivery address</span>
                <div className="address-search-row">
                  <input
                    value={address}
                    onChange={e => { setAddress(e.target.value); setVerifiedAddress(null); setDeliveryPin(null); }}
                    required
                    placeholder="Example: 12 Example Street, Eersterust"
                    autoComplete="street-address"
                  />
                  <button type="button" className="btn address-verify-btn" onClick={verifyAddress} disabled={searching}>
                    <Search size={17} /> {searching ? 'Checking…' : 'Verify'}
                  </button>
                </div>
              </label>

              <div className="delivery-map-card">
                <DeliveryMap
                  center={mapCenter}
                  pin={deliveryPin}
                  onChange={verifyPin}
                />
              </div>

              {verifiedAddress && (
                <div className="verified-address">
                  <div className="verified-address-copy">
                    <CheckCircle2 size={19} />
                    <div>
                      <strong>Delivery point verified</strong>
                      <span>{verifiedAddress.label}</span>
                    </div>
                  </div>
                  <a href={'https://www.openstreetmap.org/?mlat=' + verifiedAddress.latitude + '&mlon=' + verifiedAddress.longitude + '#map=18/' + verifiedAddress.latitude + '/' + verifiedAddress.longitude} target="_blank" rel="noreferrer">Open map</a>
                </div>
              )}

            </section>

            <section className="checkout-card">
              <div className="checkout-section-head">
                <div><span className="eyebrow">03</span><h2>Payment method</h2></div>
                <span className="checkout-count">Choose how to pay</span>
              </div>
              <div className="payment-methods">
                <button type="button" className={paymentMethod === 'cash_on_delivery' ? 'payment-method active' : 'payment-method'} onClick={() => setPaymentMethod('cash_on_delivery')}>
                  <span className="payment-icon"><Banknote size={20} /></span><span><strong>Cash on Delivery</strong><small>Pay the driver when your order arrives.</small></span><span className="payment-radio">{paymentMethod === 'cash_on_delivery' && <Check size={14} />}</span>
                </button>
                <button type="button" className={paymentMethod === 'card' ? 'payment-method active' : 'payment-method'} onClick={() => setPaymentMethod('card')}>
                  <span className="payment-icon"><CreditCard size={20} /></span><span><strong>Card</strong><small>You'll continue to secure online card payment after placing the order.</small></span><span className="payment-radio">{paymentMethod === 'card' && <Check size={14} />}</span>
                </button>
                <button type="button" className={paymentMethod === 'eft' ? 'payment-method active' : 'payment-method'} onClick={() => setPaymentMethod('eft')}>
                  <span className="payment-icon"><Landmark size={20} /></span><span><strong>EFT</strong><small>Pay by electronic bank transfer. Payment remains pending until confirmed.</small></span><span className="payment-radio">{paymentMethod === 'eft' && <Check size={14} />}</span>
                </button>
              </div>
              {paymentMethod === 'card' && <div className="payment-note"><ShieldCheck size={17} /><span>Your card details will be handled by the payment provider, not stored by BG Smart Services.</span></div>}
              {paymentMethod === 'eft' && <div className="payment-note"><Landmark size={17} /><span>Your order will be marked payment pending until the EFT is confirmed.</span></div>}
            </section>

            <section className="checkout-card">
              <div className="checkout-section-head">
                <div><span className="eyebrow">04</span><h2>Delivery notes</h2></div>
              </div>
              <label className="checkout-field">
                <span>Optional instructions</span>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Gate, landmark or delivery instructions" />
              </label>
            </section>
          </div>

          <aside className="checkout-side">
            <section className="checkout-summary-card">
              <div className="checkout-summary-title"><span className="eyebrow">Order summary</span><h2>Final total</h2></div>
              <div className="checkout-summary-lines">
                <div><span>Items ({itemCount})</span><strong>{money(subtotal)}</strong></div>
                <div><span>Delivery</span><strong>{money(deliveryFee)}</strong></div>
                {appliedRewardCredit > 0 && <div><span>BG Rewards credit</span><strong>-{money(appliedRewardCredit)}</strong></div>}
              </div>
              {rewardCredit > 0 && <div className="notice" style={{marginTop:12}}>BG Rewards: {money(rewardCredit)} delivery credit available. {appliedRewardCredit > 0 ? 'Applied automatically.' : ''}</div>}
              <div className="checkout-total"><span>Total</span><strong>{money(total)}</strong></div>

              {!status.open ? (
                <div className="hours-warning checkout-hours"><Clock3 size={18} /><div><strong>Ordering is closed</strong><span>{status.message}</span></div></div>
              ) : status.warning ? (
                <div className="hours-warning checkout-hours"><Clock3 size={18} /><div><strong>Closing soon</strong><span>{status.message}</span></div></div>
              ) : (
                <div className="hours-status checkout-hours"><Clock3 size={18} /><div><strong>Orders open</strong><span>08:00–20:00</span></div></div>
              )}

              {stores.length !== 1 && <div className="notice">Only one store can be checked out at a time. Return to your cart to select one store.</div>}
              {msg && <div className="notice checkout-message">{msg}</div>}

              <button className="btn btn-primary btn-large checkout-place" disabled={busy} onClick={place}>
                {busy ? 'Placing order…' : 'Place order'}
              </button>

              <div className="checkout-protection"><ShieldCheck size={17} /><span>{appliedRewardCredit > 0 ? 'BG Rewards credit applied · ' : ''}R65 standard delivery · No service fee · Eersterust only</span></div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
