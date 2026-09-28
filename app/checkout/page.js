'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Minus, Plus, Search, ShieldCheck, Store, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getOrderingStatus } from '../../lib/operating-hours';

const MAP_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

function money(value) {
  return 'R' + Number(value || 0).toFixed(2);
}

function isEersterust(result) {
  const a = result?.address || {};
  const text = String(result?.display_name || '').toLowerCase();
  return (
    String(a.suburb || '').toLowerCase() === 'eersterust' ||
    text.includes('eersterust')
  );
}

function isPreciseAddress(result) {
  const a = result?.address || {};
  return Boolean(a.house_number) || ['house', 'building'].includes(String(result?.type || '').toLowerCase());
}

function mapEmbedUrl(lat, lon) {
  const la = Number(lat);
  const lo = Number(lon);
  const d = 0.0028;
  const bbox = [lo - d, la - d, lo + d, la + d].join('%2C');
  return 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&layer=mapnik&marker=' + encodeURIComponent(la) + '%2C' + encodeURIComponent(lo);
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
  const [addressResults, setAddressResults] = useState([]);
  const [verifiedAddress, setVerifiedAddress] = useState(null);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem('bg_cart') || '[]'));
    } catch {
      setItems([]);
    }

    (async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
  const deliveryFee = items.length ? 65 : 0;
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
    setAddressResults([]);
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
    setAddressResults([]);
    setVerifiedAddress(null);

    try {
      // Use Nominatim's structured address search as well as free-form search.
      // Structured search is more reliable when the customer enters a
      // house number + street name, and the Eersterust viewbox keeps results
      // focused on the actual delivery zone.
      const encoded = encodeURIComponent(query);
      const viewbox = '28.285,-25.735,28.345,-25.680';
      const urls = [
        MAP_SEARCH_URL +
          '?format=jsonv2&addressdetails=1&limit=10&countrycodes=za&layer=address&viewbox=' +
          viewbox + '&q=' + encoded + ', Eersterust, Pretoria, South Africa',
        MAP_SEARCH_URL +
          '?format=jsonv2&addressdetails=1&limit=10&countrycodes=za&layer=address&viewbox=' +
          viewbox + '&q=' + encoded + ', Pretoria, South Africa'
      ];

      let matches = [];

      for (const url of urls) {
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) continue;

        const results = await response.json();
        matches = [...matches, ...results.filter(isEersterust)];

        if (matches.some(isPreciseAddress)) break;
      }

      const unique = Array.from(
        new Map(matches.map(result => [String(result.place_id), result])).values()
      );

      const precise = unique.filter(isPreciseAddress);
      const resultsToShow = precise.length ? precise : unique;

      setAddressResults(resultsToShow.slice(0, 8));

      if (!resultsToShow.length) {
        setMsg('We could not find that address inside Eersterust. Check the street name and house number and try again.');
      } else if (!precise.length) {
        setMsg('The map found the Eersterust street, but not the exact house number. Choose a result only if it is your exact address.');
      }
    } catch {
      setMsg('The map could not verify the address right now. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  function selectAddress(result) {
    if (!isPreciseAddress(result)) {
      setMsg('Please choose the exact house or building address shown by the map, not a street-only result.');
      return;
    }

    const a = result.address || {};
    const formatted = [
      [a.house_number, a.road].filter(Boolean).join(' '),
      a.suburb || 'Eersterust',
      a.city || 'Pretoria',
      a.postcode
    ].filter(Boolean).join(', ');

    setAddress(formatted || result.display_name);
    setVerifiedAddress({
      label: formatted || result.display_name,
      latitude: Number(result.lat),
      longitude: Number(result.lon),
      displayName: result.display_name
    });
    setAddressResults([]);
    setMsg('');
  }

  async function place(e) {
    e.preventDefault();
    const current = getOrderingStatus();
    setStatus(current);

    if (!current.open) {
      setMsg(current.message);
      return;
    }

    if (!verifiedAddress) {
      setMsg('Please verify your exact delivery address on the map before placing the order.');
      return;
    }

    if (!isEersterust({ display_name: verifiedAddress.label })) {
      setMsg('Delivery is available in Eersterust only.');
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
      p_delivery_address: verifiedAddress.label,
      p_delivery_latitude: verifiedAddress.latitude,
      p_delivery_longitude: verifiedAddress.longitude,
      p_delivery_address_verified: true,
      p_notes: notes
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
          <Link href="/cart" className="checkout-back"><ArrowLeft size={17} /> Back to cart</Link>
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
                        {item.image ? <img src={item.image} alt="" /> : <Store size={21} />}
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
                <div><strong>Exact address required</strong><p>We only accept a map-verified house or building address inside Eersterust.</p></div>
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
                <span>Street address and house number</span>
                <div className="address-search-row">
                  <input
                    value={address}
                    onChange={e => { setAddress(e.target.value); setVerifiedAddress(null); setAddressResults([]); }}
                    required
                    placeholder="Example: 12 Example Street"
                    autoComplete="street-address"
                  />
                  <button type="button" className="btn address-verify-btn" onClick={verifyAddress} disabled={searching}>
                    <Search size={17} /> {searching ? 'Checking…' : 'Verify'}
                  </button>
                </div>
              </label>

              {addressResults.length > 0 && (
                <div className="address-results">
                  <div className="address-results-title">Choose the exact map result</div>
                  {addressResults.map((result, index) => (
                    <button type="button" className="address-result" key={result.place_id || index} onClick={() => selectAddress(result)}>
                      <MapPin size={18} />
                      <span><strong>{result.address?.house_number ? [result.address.house_number, result.address.road].filter(Boolean).join(' ') : result.display_name}</strong><small>{result.display_name}</small></span>
                    </button>
                  ))}
                </div>
              )}

              {verifiedAddress && (
                <div className="verified-address">
                  <div className="verified-address-copy"><CheckCircle2 size={19} /><div><strong>Address verified</strong><span>{verifiedAddress.label}</span></div></div>
                  <a href={'https://www.openstreetmap.org/?mlat=' + verifiedAddress.latitude + '&mlon=' + verifiedAddress.longitude + '#map=18/' + verifiedAddress.latitude + '/' + verifiedAddress.longitude} target="_blank" rel="noreferrer">Open map</a>
                  <iframe title="Verified delivery location" src={mapEmbedUrl(verifiedAddress.latitude, verifiedAddress.longitude)} loading="lazy" />
                </div>
              )}
            </section>

            <section className="checkout-card">
              <div className="checkout-section-head">
                <div><span className="eyebrow">03</span><h2>Delivery notes</h2></div>
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
                <div><span>Delivery</span><strong>R65.00</strong></div>
              </div>
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

              <button className="btn btn-primary btn-large checkout-place" disabled={busy || !status.open || stores.length !== 1 || !verifiedAddress} onClick={place}>
                {busy ? 'Placing order…' : 'Place order'}
              </button>

              <div className="checkout-protection"><ShieldCheck size={17} /><span>R65 delivery · No service fee · Eersterust only</span></div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
