'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, ImagePlus, LogOut, Package, Pencil, Plus, RefreshCw, Store, Truck, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './restaurant.css';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
function money(value) { return 'R' + Number(value || 0).toFixed(2); }

const EMPTY_PRODUCT = { id: null, name: '', description: '', price: '', image_url: '', category_id: '', available: true };

export default function RestaurantDashboardPage() {
  const [user, setUser] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState({});
  const [payments, setPayments] = useState({});
  const [active, setActive] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [showProductForm, setShowProductForm] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  async function load(showSpinner = false) {
    if (!supabase) { setError('Supabase is not configured.'); setLoading(false); return; }
    if (showSpinner) setRefreshing(true);
    setError('');

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser) { window.location.href = '/restaurant/login'; return; }
    setUser(currentUser);

    const { data: merchantData, error: merchantError } = await supabase
      .from('merchants')
      .select('id, business_name, description, phone, address, approved, active, logo_url, cuisine')
      .eq('owner_id', currentUser.id)
      .maybeSingle();

    if (merchantError || !merchantData) {
      setError('This account is not connected to a restaurant partner record.');
      setLoading(false); setRefreshing(false); return;
    }
    if (!merchantData.approved || !merchantData.active) {
      setError('This restaurant partner account is not active.');
      setLoading(false); setRefreshing(false); return;
    }
    setMerchant(merchantData);

    const [locationsResult, ordersResult, productsResult, categoriesResult] = await Promise.all([
      supabase.from('merchant_locations').select('id, name, address, phone, active').eq('merchant_id', merchantData.id).order('display_order'),
      supabase.from('orders').select('id, status, subtotal, delivery_fee, service_fee, total, delivery_address, notes, created_at, updated_at, customer_id, driver_id, payment_method').eq('merchant_id', merchantData.id).order('created_at', { ascending: false }).limit(200),
      supabase.from('products').select('id, category_id, name, description, price, image_url, available, updated_at').eq('merchant_id', merchantData.id).order('name').limit(500),
      supabase.from('categories').select('id, name').eq('merchant_id', merchantData.id).order('name'),
    ]);

    const failures = [locationsResult, ordersResult, productsResult, categoriesResult].filter((result) => result.error);
    if (failures.length) setError(failures.map((result) => result.error.message).join(' · '));

    const nextOrders = ordersResult.data || [];
    setLocations(locationsResult.data || []);
    setOrders(nextOrders);
    setProducts(productsResult.data || []);
    setCategories(categoriesResult.data || []);

    const orderIds = nextOrders.map((order) => order.id);
    const customerIds = [...new Set(nextOrders.map((order) => order.customer_id).filter(Boolean))];

    const [itemsResult, customersResult, paymentsResult] = await Promise.all([
      orderIds.length ? supabase.from('order_items').select('id, order_id, product_id, quantity, unit_price').in('order_id', orderIds) : Promise.resolve({ data: [], error: null }),
      customerIds.length ? supabase.from('profiles').select('id, full_name, phone').in('id', customerIds) : Promise.resolve({ data: [], error: null }),
      orderIds.length ? supabase.from('payments').select('id, order_id, amount, status, provider, provider_reference').in('order_id', orderIds) : Promise.resolve({ data: [], error: null }),
    ]);

    setItems(itemsResult.data || []);
    setCustomers(Object.fromEntries((customersResult.data || []).map((customer) => [customer.id, customer])));
    setPayments(Object.fromEntries((paymentsResult.data || []).map((payment) => [payment.order_id, payment])));
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!merchant?.id || !supabase) return undefined;
    const channel = supabase.channel('restaurant-orders-' + merchant.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: 'merchant_id=eq.' + merchant.id }, () => load(false))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [merchant?.id]);

  async function updateOrder(orderId, status) {
    setUpdating(orderId); setError('');
    const { error: updateError } = await supabase.rpc('merchant_update_order_status', { p_order_id: orderId, p_status: status });
    if (updateError) setError(updateError.message);
    else {
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
      load(false);
    }
    setUpdating(null);
  }

  function openAddProduct() {
    setProductForm({ ...EMPTY_PRODUCT });
    setShowProductForm(true);
    setError('');
  }

  function openEditProduct(product) {
    setProductForm({
      id: product.id,
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      image_url: product.image_url || '',
      category_id: product.category_id || '',
      available: product.available !== false,
    });
    setShowProductForm(true);
    setError('');
  }

  async function saveProduct(event) {
    event.preventDefault();
    const name = productForm.name.trim();
    const price = Number(productForm.price);
    if (!name) { setError('Enter a product name.'); return; }
    if (!Number.isFinite(price) || price < 0) { setError('Enter a valid price.'); return; }

    setSavingProduct(true); setError('');
    const payload = {
      merchant_id: merchant.id,
      name,
      description: productForm.description.trim() || null,
      price,
      image_url: productForm.image_url.trim() || null,
      category_id: productForm.category_id || null,
      available: productForm.available,
      updated_at: new Date().toISOString(),
    };

    const result = productForm.id
      ? await supabase.from('products').update(payload).eq('id', productForm.id).eq('merchant_id', merchant.id).select('id, category_id, name, description, price, image_url, available, updated_at').single()
      : await supabase.from('products').insert(payload).select('id, category_id, name, description, price, image_url, available, updated_at').single();

    if (result.error) {
      setError(result.error.message);
    } else {
      setProducts((current) => productForm.id
        ? current.map((item) => item.id === productForm.id ? result.data : item).sort((a, b) => a.name.localeCompare(b.name))
        : [...current, result.data].sort((a, b) => a.name.localeCompare(b.name)));
      setShowProductForm(false);
      setProductForm(EMPTY_PRODUCT);

      if (!productForm.id && result.data?.available) {
        const { error: notifyError } = await supabase.functions.invoke('notify-new-product', {
          body: { product_id: result.data.id },
        });
        if (notifyError) setError('Product added successfully, but customer notifications could not be sent yet.');
      }
    }
    setSavingProduct(false);
  }

  async function toggleProduct(product) {
    const { error: updateError } = await supabase.from('products').update({ available: !product.available, updated_at: new Date().toISOString() }).eq('id', product.id).eq('merchant_id', merchant.id);
    if (updateError) setError(updateError.message);
    else setProducts((current) => current.map((item) => item.id === product.id ? { ...item, available: !product.available } : item));
  }

  async function removeProduct(product) {
    if (!window.confirm('Remove "' + product.name + '" from your customer menu?')) return;
    const { error: updateError } = await supabase.from('products').update({ available: false, updated_at: new Date().toISOString() }).eq('id', product.id).eq('merchant_id', merchant.id);
    if (updateError) setError(updateError.message);
    else setProducts((current) => current.map((item) => item.id === product.id ? { ...item, available: false } : item));
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/restaurant/login';
  }

  const activeOrders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status));
  const deliveredOrders = orders.filter((order) => order.status === 'delivered');
  const pendingCount = orders.filter((order) => ['pending', 'confirmed'].includes(order.status)).length;
  const sales = deliveredOrders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
  const categoryById = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category.name])), [categories]);
  const productById = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products]);
  const itemsByOrder = useMemo(() => {
    const map = {};
    items.forEach((item) => { if (!map[item.order_id]) map[item.order_id] = []; map[item.order_id].push(item); });
    return map;
  }, [items]);

  if (loading) return <main className="restaurant-shell restaurant-loading"><RefreshCw size={20} className="spin" /> Loading restaurant dashboard</main>;

  return (
    <main className="restaurant-shell">
      <header className="restaurant-header">
        <div className="restaurant-brand"><span>BG</span><div><strong>{merchant?.business_name || 'Restaurant'}</strong><small>RESTAURANT PORTAL</small></div></div>
        <div className="restaurant-header-actions">
          <button className="icon-button" onClick={() => load(true)} aria-label="Refresh"><RefreshCw size={17} className={refreshing ? 'spin' : ''} /></button>
          <Link href="/home" className="customer-link"><ArrowLeft size={16} /> Customer Experience</Link>
          <button className="icon-button" onClick={signOut} aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </header>

      {error && <div className="restaurant-alert"><XCircle size={17} />{error}</div>}

      <section className="restaurant-welcome">
        <div><p>PARTNER DASHBOARD</p><h1>{merchant?.business_name}</h1><span>Manage incoming BG orders, branches and your customer menu.</span></div>
        <div className="branch-pill"><Store size={15} /> {locations.length} branch{locations.length === 1 ? '' : 'es'}</div>
      </section>

      <div className="restaurant-stats">
        <Stat icon={Clock3} label="Needs attention" value={pendingCount} />
        <Stat icon={Package} label="Active orders" value={activeOrders.length} />
        <Stat icon={CheckCircle2} label="Delivered" value={deliveredOrders.length} />
        <Stat icon={Store} label="Delivered sales" value={money(sales)} />
      </div>

      <nav className="restaurant-tabs">
        <button className={active === 'orders' ? 'active' : ''} onClick={() => setActive('orders')}>Orders</button>
        <button className={active === 'products' ? 'active' : ''} onClick={() => setActive('products')}>Products</button>
        <button className={active === 'branches' ? 'active' : ''} onClick={() => setActive('branches')}>Branches</button>
      </nav>

      {active === 'orders' && (
        <section className="restaurant-panel">
          <div className="panel-head"><div><h2>Orders</h2><p>Only orders belonging to {merchant?.business_name} are shown here.</p></div></div>
          <div className="order-list">
            {orders.map((order) => {
              const customer = customers[order.customer_id];
              const payment = payments[order.id];
              const orderItems = itemsByOrder[order.id] || [];
              return (
                <article className="order-card" key={order.id}>
                  <div className="order-top"><div><strong>#{order.id.slice(0, 8).toUpperCase()}</strong><span>{formatDate(order.created_at)}</span></div><span className={'order-status ' + order.status}>{order.status.replace('_', ' ')}</span></div>
                  <div className="order-grid">
                    <div><h3>Customer</h3><p>{customer?.full_name || 'Customer'}{customer?.phone ? ' · ' + customer.phone : ''}</p><small>{order.delivery_address || 'Delivery address not provided'}</small></div>
                    <div><h3>Payment</h3><p>{payment?.status || 'No payment record'}{payment?.provider ? ' · ' + payment.provider : ''}</p><small>{order.payment_method || 'Online payment'}</small></div>
                    <div><h3>Total</h3><p>{money(order.total)}</p><small>Food {money(order.subtotal)} · Delivery {money(order.delivery_fee)}</small></div>
                  </div>
                  <div className="order-items">
                    {orderItems.map((item) => <div key={item.id}><span>{item.quantity} × {productById[item.product_id]?.name || 'Product'}</span><strong>{money(Number(item.unit_price) * Number(item.quantity))}</strong></div>)}
                  </div>
                  {order.notes && <div className="order-note">{order.notes}</div>}
                  <div className="order-actions">
                    {order.status === 'pending' && <button onClick={() => updateOrder(order.id, 'confirmed')} disabled={updating === order.id}>Accept order</button>}
                    {order.status === 'confirmed' && <button onClick={() => updateOrder(order.id, 'preparing')} disabled={updating === order.id}>Start preparing</button>}
                    {order.status === 'preparing' && <button onClick={() => updateOrder(order.id, 'ready')} disabled={updating === order.id}>Ready for collection</button>}
                    {['pending', 'confirmed', 'preparing'].includes(order.status) && <button className="danger-button" onClick={() => updateOrder(order.id, 'cancelled')} disabled={updating === order.id}>Cancel</button>}
                    {order.status === 'ready' && <span className="ready-note"><Truck size={15} /> Waiting for driver collection</span>}
                    {order.status === 'assigned' && <span className="ready-note"><Truck size={15} /> Driver assigned</span>}
                    {order.status === 'picked_up' && <span className="ready-note"><Truck size={15} /> Driver collected the order</span>}
                  </div>
                </article>
              );
            })}
            {!orders.length && <div className="empty">No BG orders have reached this restaurant yet.</div>}
          </div>
        </section>
      )}

      {active === 'products' && (
        <section className="restaurant-panel">
          <div className="panel-head">
            <div><h2>Products</h2><p>Add, edit, hide or remove items from your customer menu.</p></div>
            <button className="primary-button" onClick={openAddProduct}><Plus size={15} /> Add product</button>
          </div>
          <div className="product-list">
            {products.map((product) => (
              <article className={'product-row ' + (!product.available ? 'product-disabled' : '')} key={product.id}>
                <div className="product-thumb">{product.image_url ? <img src={product.image_url} alt="" /> : <ImagePlus size={17} />}</div>
                <div className="product-info">
                  <strong>{product.name}</strong>
                  <span>{categoryById[product.category_id] || 'Uncategorised'} · {money(product.price)}</span>
                  {product.description && <small>{product.description}</small>}
                </div>
                <span className={'product-state ' + (product.available ? 'on' : 'off')}>{product.available ? 'Live' : 'Hidden'}</span>
                <div className="product-actions">
                  <button className="edit-button" onClick={() => openEditProduct(product)}><Pencil size={14} /> Edit</button>
                  <button className="availability-button" onClick={() => toggleProduct(product)}>{product.available ? 'Hide' : 'Show'}</button>
                  <button className="remove-button" onClick={() => removeProduct(product)}>Remove</button>
                </div>
              </article>
            ))}
            {!products.length && <div className="empty">No products yet. Add your first menu item.</div>}
          </div>
        </section>
      )}

      {active === 'branches' && (
        <section className="restaurant-panel">
          <div className="panel-head"><div><h2>Branches</h2><p>Pickup locations connected to this restaurant.</p></div></div>
          <div className="branch-list">
            {locations.map((location) => <article className="branch-row" key={location.id}><div className="branch-icon"><Store size={17} /></div><div><strong>{location.name}</strong><span>{location.address || 'Address not set'}</span>{location.phone && <small>{location.phone}</small>}</div><span className={location.active ? 'status good' : 'status off'}>{location.active ? 'Active' : 'Inactive'}</span></article>)}
            {!locations.length && <div className="empty">No branches connected yet.</div>}
          </div>
        </section>
      )}

      {showProductForm && (
        <div className="product-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingProduct) setShowProductForm(false); }}>
          <form className="product-modal" onSubmit={saveProduct}>
            <div className="modal-head"><div><p>{productForm.id ? 'EDIT MENU ITEM' : 'NEW MENU ITEM'}</p><h2>{productForm.id ? 'Edit product' : 'Add product'}</h2></div><button type="button" className="modal-close" onClick={() => setShowProductForm(false)}>×</button></div>
            <label>Product name<input value={productForm.name} onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Chicken Burger" autoFocus /></label>
            <div className="form-two">
              <label>Price<input type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" /></label>
              <label>Category<select value={productForm.category_id} onChange={(e) => setProductForm((f) => ({ ...f, category_id: e.target.value }))}><option value="">No category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
            </div>
            <label>Description<textarea rows="3" value={productForm.description} onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description customers will see" /></label>
            <label>Product image URL<input value={productForm.image_url} onChange={(e) => setProductForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://..." /><small>Use a direct image link for the product photo.</small></label>
            <label className="switch-line"><input type="checkbox" checked={productForm.available} onChange={(e) => setProductForm((f) => ({ ...f, available: e.target.checked }))} /><span>Show this product to customers</span></label>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowProductForm(false)} disabled={savingProduct}>Cancel</button><button type="submit" className="primary-button" disabled={savingProduct}>{savingProduct ? 'Saving…' : productForm.id ? 'Save changes' : 'Add product'}</button></div>
          </form>
        </div>
      )}
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <div className="restaurant-stat"><Icon size={18} /><div><span>{label}</span><strong>{value}</strong></div></div>;
}
