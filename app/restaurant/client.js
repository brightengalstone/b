'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, LogOut, Package, RefreshCw, Store, Truck, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './restaurant.css';

const RESTAURANT_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'cancelled'];

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
function money(value) { return 'R' + Number(value || 0).toFixed(2); }

export default function RestaurantDashboardPage() {
  const [user, setUser] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState({});
  const [payments, setPayments] = useState({});
  const [active, setActive] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

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

    const [locationsResult, ordersResult, productsResult] = await Promise.all([
      supabase.from('merchant_locations').select('id, name, address, phone, active').eq('merchant_id', merchantData.id).order('display_order'),
      supabase.from('orders').select('id, status, subtotal, delivery_fee, service_fee, total, delivery_address, notes, created_at, updated_at, customer_id, driver_id, payment_method').eq('merchant_id', merchantData.id).order('created_at', { ascending: false }).limit(200),
      supabase.from('products').select('id, category_id, name, description, price, image_url, available, updated_at').eq('merchant_id', merchantData.id).order('name').limit(500),
    ]);

    const failures = [locationsResult, ordersResult, productsResult].filter((result) => result.error);
    if (failures.length) setError(failures.map((result) => result.error.message).join(' · '));

    const nextOrders = ordersResult.data || [];
    setLocations(locationsResult.data || []);
    setOrders(nextOrders);
    setProducts(productsResult.data || []);

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

  useEffect(() => {
    let mounted = true;
    load();
    return () => { mounted = false; };
  }, []);

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

  async function toggleProduct(product) {
    const { error: updateError } = await supabase.from('products').update({ available: !product.available, updated_at: new Date().toISOString() }).eq('id', product.id).eq('merchant_id', merchant.id);
    if (updateError) setError(updateError.message);
    else setProducts((current) => current.map((item) => item.id === product.id ? { ...item, available: !product.available } : item));
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/restaurant/login';
  }

  const activeOrders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status));
  const deliveredOrders = orders.filter((order) => order.status === 'delivered');
  const pendingCount = orders.filter((order) => ['pending', 'confirmed'].includes(order.status)).length;
  const sales = deliveredOrders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);

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
        <div><p>PARTNER DASHBOARD</p><h1>{merchant?.business_name}</h1><span>Manage incoming BG orders, your branches and product availability.</span></div>
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
          <div className="panel-head"><div><h2>Products</h2><p>Control whether a menu item is available to customers.</p></div></div>
          <div className="product-list">
            {products.map((product) => <article className="product-row" key={product.id}><div><strong>{product.name}</strong><span>{product.description || 'Menu item'} · {money(product.price)}</span></div><button className={product.available ? 'available' : 'unavailable'} onClick={() => toggleProduct(product)}>{product.available ? 'Available' : 'Unavailable'}</button></article>)}
            {!products.length && <div className="empty">No products are connected to this restaurant yet.</div>}
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
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <div className="restaurant-stat"><Icon size={18} /><div><span>{label}</span><strong>{value}</strong></div></div>;
}
