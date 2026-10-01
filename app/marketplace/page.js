'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, Store, RefreshCw, MapPin, Navigation, CheckCircle2, X, Plus, Minus, Heart, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import NotificationBell from '../../components/NotificationBell';

const FAST_FOOD_SLUGS = new Set([
  'mcdonalds-denlyn',
  'mcdonalds-silverwater-crossing',
  'mcdonalds-mamelodi-mall',
  'kfc-denlyn',
  'kfc-tshwane',
  'chicken-licken-denlyn',
  'chicken-licken-tshwane',
  'debonairs-tshwane',
  'debonairs-denlyn',
  'hungry-lion-tshwane',
  'nandos-denlyn',
  'romans-denlyn',
  'romans-tshwane',
  'steers-tshwane',
]);

const BRAND_DOMAINS = {
  'mcdonalds-denlyn': 'mcdonalds.co.za',
  'mcdonalds-silverwater-crossing': 'mcdonalds.co.za',
  'mcdonalds-mamelodi-mall': 'mcdonalds.co.za',
  'kfc-denlyn': 'kfc.co.za',
  'kfc-tshwane': 'kfc.co.za',
  'chicken-licken-denlyn': 'chickenlicken.co.za',
  'chicken-licken-tshwane': 'chickenlicken.co.za',
  'debonairs-tshwane': 'debonairspizza.co.za',
  'debonairs-denlyn': 'debonairspizza.co.za',
  'hungry-lion-tshwane': 'hungrylion.co.za',
  'nandos-denlyn': 'nandos.co.za',
  'romans-denlyn': 'romanspizza.co.za',
  'romans-tshwane': 'romanspizza.co.za',
  'steers-tshwane': 'steers.co.za',
};

const BRANCH_CLASSES = {};
function retailerClass(slug, category) {
  return BRANCH_CLASSES[slug] || (category === 'fast-food' ? 'retailer-fast-food' : 'retailer-generic');
}

function RetailerLogo({ slug, large = false, logoUrl = null, name = 'Restaurant', category = 'fast-food' }) {
  const src = logoUrl || (BRAND_DOMAINS[slug] ? 'https://www.google.com/s2/favicons?domain=' + BRAND_DOMAINS[slug] + '&sz=128' : null);
  return (
    <div className={'retailer-logo ' + retailerClass(slug, category) + (large ? ' large' : '')} aria-label={name + ' logo'}>
      {src ? <img src={src} alt="" loading="lazy" /> : <span>{name.slice(0, 2).toUpperCase()}</span>}
    </div>
  );
}

function brandName(name) {
  return (name || 'Restaurant').split(' — ')[0].trim();
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const requested = searchParams.get('retailer');
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityPrompt, setQuantityPrompt] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  async function load() {
    setLoading(true);
    setMsg('');
    if (!supabase) {
      setRetailers([]);
      setProducts([]);
      setLoading(false);
      return;
    }

    const [{ data: rs, error: re }, { data: ps, error: pe }] = await Promise.all([
      supabase.from('retailers')
        .select('id,name,slug,marketplace_category,shopping_location,pickup_address,directions_url,logo_mark,logo_url,active')
        .eq('active', true)
        .eq('marketplace_category', 'fast-food')
        .order('name'),
      supabase.from('retailer_products')
        .select('id,retailer_id,name,description,category,size,price,promo_price,image_url,last_verified_at,available')
        .eq('available', true)
        .order('name')
        .limit(1000),
    ]);

    if (re || pe) {
      setMsg('The restaurant catalogue is temporarily unavailable. Please refresh.');
      setRetailers([]);
      setProducts([]);
    } else {
      const allowedRetailers = (rs || []).filter(r => FAST_FOOD_SLUGS.has(r.slug));
      const allowedIds = new Set(allowedRetailers.map(r => r.id));
      setRetailers(allowedRetailers);
      setProducts((ps || []).filter(p => allowedIds.has(p.retailer_id)));

      if (requested) {
        const match = allowedRetailers.find(r => r.slug === requested);
        if (match) setSelectedId(match.id);
      }
    }
    setLoading(false);
  }

  function syncCart() {
    try {
      const cart = JSON.parse(localStorage.getItem('bg_cart') || '[]');
      setCartCount(cart.reduce((n, x) => n + Number(x.quantity || 0), 0));
    } catch {
      setCartCount(0);
    }
  }

  useEffect(() => {
    load();
    syncCart();

    (async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('customer_favorites').select('product_id').eq('customer_id', user.id);
        setFavoriteIds(new Set((data || []).map(x => x.product_id)));
      }
    })();

    const onCart = () => syncCart();
    window.addEventListener('bg_cart_updated', onCart);
    window.addEventListener('storage', onCart);
    return () => {
      window.removeEventListener('bg_cart_updated', onCart);
      window.removeEventListener('storage', onCart);
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    const term = query.trim().toLowerCase();
    for (const r of retailers) {
      const brand = brandName(r.name);
      const searchable = [brand, r.name, r.shopping_location, r.pickup_address].filter(Boolean).join(' ').toLowerCase();
      if (term && !searchable.includes(term)) continue;
      if (!map.has(brand)) map.set(brand, []);
      map.get(brand).push(r);
    }
    return [...map.entries()]
      .map(([brand, branches]) => ({ brand, branches }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [retailers, query]);

  const selected = retailers.find(r => r.id === selectedId) || null;

  const categories = useMemo(() => {
    if (!selected) return [];
    return [...new Set(products.filter(p => p.retailer_id === selected.id && p.category).map(p => p.category))].sort();
  }, [products, selected]);

  const visibleProducts = useMemo(() => {
    if (!selected) return [];
    const term = query.trim().toLowerCase();
    return products.filter(p => {
      const matchesBranch = p.retailer_id === selected.id;
      const matchesCategory = category === 'all' || p.category === category;
      const text = [p.name, p.description, p.category, p.size].filter(Boolean).join(' ').toLowerCase();
      return matchesBranch && matchesCategory && (!term || text.includes(term));
    });
  }, [products, selected, query, category]);

  function getCart() {
    try { return JSON.parse(localStorage.getItem('bg_cart') || '[]'); } catch { return []; }
  }

  function setCart(cart) {
    localStorage.setItem('bg_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('bg_cart_updated'));
    syncCart();
  }

  function chooseBranch(id) {
    const branch = retailers.find(r => r.id === id);
    setSelectedId(id);
    setCategory('all');
    setQuery('');
    setSelectedProduct(null);
    if (branch) window.history.replaceState(null, '', '/marketplace?retailer=' + encodeURIComponent(branch.slug));
  }

  function backToRestaurants() {
    setSelectedId(null);
    setCategory('all');
    setQuery('');
    setSelectedProduct(null);
    window.history.replaceState(null, '', '/marketplace');
  }

  function addToCart(p, qty = null) {
    const cart = getCart();
    const index = cart.findIndex(x => x.id === p.id);
    const price = Number(p.promo_price ?? p.price);
    const nextQty = qty == null ? (index >= 0 ? Number(cart[index].quantity || 0) + 1 : 1) : qty;

    if (index >= 0) cart[index].quantity = nextQty;
    else cart.push({
      id: p.id,
      name: p.name,
      price,
      quantity: nextQty,
      merchant: selected?.name || 'Restaurant',
      merchantName: selected?.name || 'Restaurant',
      storeName: selected?.name || 'Restaurant',
      retailer_id: p.retailer_id,
      shopping_location: selected?.shopping_location || '',
      pickup_address: selected?.pickup_address || '',
      directions_url: selected?.directions_url || '',
      description: p.description || '',
      size: p.size || '',
      image_url: p.image_url || '',
      last_verified_at: p.last_verified_at || null,
    });

    setCart(cart);
    setQuantityPrompt(null);
    setMsg(nextQty + ' × ' + p.name + ' added to cart.');
  }

  function changeQty(p, delta) {
    const cart = getCart();
    const index = cart.findIndex(x => x.id === p.id);
    if (index < 0) return;
    cart[index].quantity = Math.max(0, Number(cart[index].quantity || 0) + delta);
    if (cart[index].quantity === 0) cart.splice(index, 1);
    setCart(cart);
  }

  async function toggleFavorite(p) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/signin';
      return;
    }
    if (favoriteIds.has(p.id)) {
      const { error } = await supabase.from('customer_favorites').delete().eq('customer_id', user.id).eq('product_id', p.id);
      if (!error) setFavoriteIds(prev => {
        const next = new Set(prev); next.delete(p.id); return next;
      });
    } else {
      const { error } = await supabase.from('customer_favorites').insert({ customer_id: user.id, product_id: p.id });
      if (!error) setFavoriteIds(prev => new Set([...prev, p.id]));
    }
  }

  return (
    <main className={'retail-market ' + (selected?.slug || '') + ' fast-food'}>
      <div className="market-shell">
        <div className="market-top">
          <Link href="/home" className="market-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link>
          <div className="market-top-actions">
            <NotificationBell />
            <Link href="/cart" className="market-cart"><ShoppingCart size={19}/><span>Cart</span>{cartCount > 0 && <b className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</b>}</Link>
          </div>
        </div>

        {!selected ? (
          <>
            <section className="fastfood-hero">
              <div className="fastfood-hero-copy">
                <span className="fastfood-kicker">BG SMART SERVICES · EERSTERUST</span>
                <h1>What are you craving?</h1>
                <p>Choose a restaurant, select the exact branch, order your food, and our driver collects it for delivery to Eersterust.</p>
              </div>
              <div className="fastfood-hero-badge"><span>FAST</span><strong>FOOD</strong><small>Delivered to Eersterust</small></div>
            </section>

            <div className="restaurant-search">
              <Search size={19}/>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search restaurants or branches"/>
            </div>

            {msg && <div className="notice">{msg}</div>}

            <div className="restaurant-section-head">
              <div><span className="eyebrow">Restaurants</span><h2>Choose where to order</h2></div>
              <span>{groups.length} restaurants</span>
            </div>

            {loading ? <div className="market-empty"><RefreshCw size={28}/><h2>Loading restaurants…</h2></div> :
              groups.length === 0 ? <div className="market-empty"><Store size={30}/><h2>No restaurants found</h2><p>Try another search.</p></div> :
              <div className="restaurant-grid">
                {groups.map(group => {
                  const first = group.branches[0];
                  return (
                    <article className="restaurant-card" key={group.brand}>
                      <div className="restaurant-card-top">
                        <RetailerLogo slug={first.slug} large logoUrl={first.logo_url} name={group.brand}/>
                        <div><h3>{group.brand}</h3><p>{group.branches.length} {group.branches.length === 1 ? 'branch' : 'branches'}</p></div>
                      </div>
                      <div className="branch-list">
                        {group.branches.map(r => (
                          <button className="branch-choice" key={r.id} onClick={() => chooseBranch(r.id)}>
                            <span><strong>{r.shopping_location || 'Restaurant branch'}</strong><small>{r.pickup_address || 'Pickup location available'}</small></span>
                            <Navigation size={16}/>
                          </button>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            }
          </>
        ) : (
          <>
            <div className="retailer-hero retailer-fast-food">
              <div className="retailer-hero-brand">
                <button className="btn" type="button" onClick={backToRestaurants}><ArrowLeft size={17}/> Restaurants</button>
                <RetailerLogo slug={selected.slug} large logoUrl={selected.logo_url} name={brandName(selected.name)}/>
                <div><div className="eyebrow">BG Smart Services · Fast Food</div><h1>{brandName(selected.name)}</h1><p>{selected.shopping_location} · Selected pickup branch</p></div>
              </div>
              <div className="store-location-card">
                <div className="location-icon"><MapPin size={18}/></div>
                <div><strong>Driver pickup location</strong><span>{selected.pickup_address || selected.shopping_location || 'Branch location on file'}</span></div>
                {selected.directions_url && <a href={selected.directions_url} target="_blank" rel="noreferrer"><Navigation size={16}/> Directions</a>}
              </div>
            </div>

            <div className="market-search"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={'Search ' + brandName(selected.name) + ' menu'}/></div>
            <div className="category-chips"><button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>All</button>{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
            {msg && <div className="notice">{msg}</div>}
            <div className="market-heading"><div><span className="eyebrow">{brandName(selected.name)} menu</span><h2>{loading ? 'Loading menu…' : visibleProducts.length + ' products'}</h2></div><button className="refresh-button" onClick={load} aria-label="Refresh menu"><RefreshCw size={17}/></button></div>

            {!loading && visibleProducts.length === 0 ? <div className="market-empty"><Store size={30}/><h2>Menu coming online</h2><p>This branch has not finished syncing its full menu yet.</p></div> :
              <div className="product-grid">
                {visibleProducts.map(p => {
                  const price = Number(p.promo_price ?? p.price);
                  const hasPromo = p.promo_price != null && Number(p.promo_price) < Number(p.price);
                  const inCart = getCart().find(x => x.id === p.id);
                  return (
                    <article className="product-card" key={p.id} role="button" tabIndex={0} onClick={() => setSelectedProduct(p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedProduct(p); }}}>
                      <div className="product-image">
                        {p.image_url ? <img src={p.image_url} alt="" loading="lazy"/> : <RetailerLogo slug={selected.slug} logoUrl={selected.logo_url} name={brandName(selected.name)}/>}
                        <button type="button" className={'favorite-toggle ' + (favoriteIds.has(p.id) ? 'is-favorite' : '')} onClick={e => { e.stopPropagation(); toggleFavorite(p); }} aria-label="Favorite"><Heart size={18} fill={favoriteIds.has(p.id) ? 'currentColor' : 'none'}/></button>
                      </div>
                      <div className="product-store">{selected.shopping_location}</div>
                      <h3>{p.name}</h3>
                      {p.size && <p className="product-size">{p.size}</p>}
                      <div className="product-price-row">
                        <div><strong>R{price.toFixed(2)}</strong>{hasPromo && <del>R{Number(p.price).toFixed(2)}</del>}</div>
                        {inCart ? <div className="qty-control"><button type="button" onClick={e => { e.stopPropagation(); changeQty(p, -1); }}>−</button><span>{inCart.quantity}</span><button type="button" onClick={e => { e.stopPropagation(); addToCart(p); }}>+</button></div> :
                          <button className="btn small add-cart-btn" onClick={e => { e.stopPropagation(); setQuantityPrompt({ product: p, quantity: 1 }); }}>Add</button>}
                      </div>
                      {p.last_verified_at && <small className="verified-price">Price verified {new Date(p.last_verified_at).toLocaleDateString('en-ZA')}</small>}
                    </article>
                  );
                })}
              </div>
            }
          </>
        )}

        {selectedProduct && (
          <div className="product-modal-backdrop" role="presentation" onClick={() => setSelectedProduct(null)}>
            <section className="product-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
              <button className="product-modal-close" type="button" onClick={() => setSelectedProduct(null)} aria-label="Close"><X size={22}/></button>
              <div className="product-modal-image">{selectedProduct.image_url ? <img src={selectedProduct.image_url} alt={selectedProduct.name}/> : <RetailerLogo slug={selected?.slug} name={selected ? brandName(selected.name) : 'Restaurant'}/>}</div>
              <div className="product-modal-store">{selected?.name} · {selected?.shopping_location}</div>
              <h2>{selectedProduct.name}</h2>
              {selectedProduct.size && <p className="product-modal-size">{selectedProduct.size}</p>}
              <p className="product-modal-description">{selectedProduct.description || 'Product details from the selected restaurant catalogue.'}</p>
              <div className="product-modal-price"><strong>R{Number(selectedProduct.promo_price ?? selectedProduct.price).toFixed(2)}</strong></div>
              <div className="product-modal-actions">
                <button className="btn btn-primary btn-large" type="button" onClick={() => setQuantityPrompt({ product: selectedProduct, quantity: 1 })}>Add to Cart</button>
                <Link className="btn" href="/cart">View Cart</Link>
              </div>
            </section>
          </div>
        )}

        {quantityPrompt && (
          <div className="product-modal-backdrop" role="presentation" onClick={() => setQuantityPrompt(null)}>
            <section className="quantity-confirm-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
              <button className="product-modal-close" type="button" onClick={() => setQuantityPrompt(null)} aria-label="Close"><X size={22}/></button>
              <div className="product-modal-store">{selected?.name} · {selected?.shopping_location}</div>
              <h2>Confirm quantity</h2>
              <p>How many <strong>{quantityPrompt.product.name}</strong> do you want?</p>
              <div className="confirm-quantity-row"><button type="button" onClick={() => setQuantityPrompt(q => ({...q, quantity: Math.max(1, Number(q.quantity) - 1)}))}><Minus size={18}/></button><strong>{quantityPrompt.quantity}</strong><button type="button" onClick={() => setQuantityPrompt(q => ({...q, quantity: Number(q.quantity) + 1}))}><Plus size={18}/></button></div>
              <button className="btn btn-primary btn-large" type="button" onClick={() => addToCart(quantityPrompt.product, Number(quantityPrompt.quantity))}>Confirm {quantityPrompt.quantity} {quantityPrompt.quantity === 1 ? 'item' : 'items'}</button>
            </section>
          </div>
        )}

        <div className="delivery-note"><CheckCircle2 size={14}/> Exact branch pickup is sent with the order · Delivery across Eersterust · R65 delivery</div>
      </div>
    </main>
  );
}

function MarketplaceFallback() {
  return <main className="retail-market"><div className="market-shell"><div className="market-empty">Loading marketplace…</div></div></main>;
}

function Marketplace() {
  return <Suspense fallback={<MarketplaceFallback/>}><MarketplaceContent/></Suspense>;
}

export default Marketplace;
