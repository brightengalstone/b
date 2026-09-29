'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  Box,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LogOut,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  Store,
  Users,
  XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const NAV = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'shops', label: 'Shops', icon: Store },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'payments', label: 'Payments', icon: CircleDollarSign },
];

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled'];

function money(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    orders: [],
    shops: [],
    products: [],
    customers: [],
    payments: [],
  });

  useEffect(() => {
    let mounted = true;

    async function boot() {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user || null;

      if (!mounted) return;
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(currentProfile);

      if (currentProfile?.role !== 'admin') {
        setLoading(false);
        return;
      }

      await loadDashboard(false);
      if (mounted) setLoading(false);
    }

    boot();
    return () => { mounted = false; };
  }, []);

  async function loadDashboard(showSpinner = true) {
    if (!supabase) return;
    if (showSpinner) setRefreshing(true);
    setError('');

    const [orders, shops, products, customers, payments] = await Promise.all([
      supabase
        .from('orders')
        .select('id, status, subtotal, delivery_fee, service_fee, total, delivery_address, created_at, updated_at, retailer_id, customer_id, driver_id, payment_method')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('retailers')
        .select('id, name, active, marketplace_category, shopping_location, pickup_address')
        .order('name'),
      supabase
        .from('retailer_products')
        .select('id, retailer_id, name, category, price, promo_price, available, updated_at')
        .order('updated_at', { ascending: false })
        .limit(100),
      supabase
        .from('profiles')
        .select('id, full_name, phone, role, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('payments')
        .select('id, order_id, amount, status, provider, provider_reference, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    const failures = [orders, shops, products, customers, payments].filter((item) => item.error);
    if (failures.length) {
      setError(failures.map((item) => item.error.message).join(' | '));
    }

    setData({
      orders: orders.data || [],
      shops: shops.data || [],
      products: products.data || [],
      customers: customers.data || [],
      payments: payments.data || [],
    });

    if (showSpinner) setRefreshing(false);
  }

  async function updateOrder(orderId, patch) {
    if (!supabase) return;
    setError('');
    const { error: updateError } = await supabase
      .from('orders')
      .update(patch)
      .eq('id', orderId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setData((currentData) => ({
      ...currentData,
      orders: currentData.orders.map((order) =>
        order.id === orderId ? { ...order, ...patch } : order
      ),
    }));
  }

  async function updatePayment(paymentId, patch) {
    if (!supabase) return;
    setError('');
    const { error: updateError } = await supabase
      .from('payments')
      .update(patch)
      .eq('id', paymentId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setData((currentData) => ({
      ...currentData,
      payments: currentData.payments.map((payment) =>
        payment.id === paymentId ? { ...payment, ...patch } : payment
      ),
    }));
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    window.location.href = '/signin';
  }

  const stats = useMemo(() => {
    const delivered = data.orders.filter((order) => order.status === 'delivered');
    const pending = data.orders.filter((order) => ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up'].includes(order.status));
    const revenue = delivered.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
    return {
      orders: data.orders.length,
      pending: pending.length,
      revenue,
      customers: data.customers.filter((item) => item.role === 'customer').length,
      shops: data.shops.filter((shop) => shop.active).length,
      products: data.products.filter((product) => product.available).length,
    };
  }, [data]);

  if (loading) {
    return (
      <main className="admin-shell admin-loading">
        <div className="admin-loader"><RefreshCw size={20} className="admin-spin" /> Loading admin dashboard</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="admin-shell admin-gate">
        <div className="admin-gate-card">
          <div className="admin-brand-mark">BG</div>
          <p className="admin-kicker">BG Smart Services</p>
          <h1>Admin sign in required</h1>
          <p>Sign in with an administrator account to access this dashboard.</p>
          <Link className="admin-primary" href="/signin">Go to sign in</Link>
        </div>
      </main>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <main className="admin-shell admin-gate">
        <div className="admin-gate-card">
          <div className="admin-brand-mark">BG</div>
          <p className="admin-kicker">Restricted area</p>
          <h1>Administrator access only</h1>
          <p>This account does not have the administrator role.</p>
          <Link className="admin-secondary" href="/home">Return to home</Link>
        </div>
      </main>
    );
  }

  const recentOrders = data.orders.slice(0, 8);
  const customers = data.customers.filter((item) => item.role === 'customer');
  const shopById = Object.fromEntries(data.shops.map((shop) => [shop.id, shop]));
  const customerById = Object.fromEntries(data.customers.map((customer) => [customer.id, customer]));

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-brand-mark">BG</div>
          <div><strong>BG Smart</strong><span>Admin Console</span></div>
        </div>

        <nav className="admin-nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} className={active === id ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => setActive(id)}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <Link className="admin-nav-item" href="/home"><ArrowLeft size={18} /><span>Customer site</span></Link>
          <button className="admin-nav-item" onClick={() => setActive('settings')}><Settings size={18} /><span>Settings</span></button>
          <button className="admin-nav-item danger" onClick={signOut}><LogOut size={18} /><span>Sign out</span></button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Management</p>
            <h1>{NAV.find((item) => item.id === active)?.label || 'Settings'}</h1>
          </div>
          <div className="admin-header-actions">
            <span className="admin-user">{profile.full_name || user.email}</span>
            <button className="admin-icon-button" onClick={() => loadDashboard(true)} title="Refresh dashboard" aria-label="Refresh dashboard">
              <RefreshCw size={18} className={refreshing ? 'admin-spin' : ''} />
            </button>
          </div>
        </header>

        {error && <div className="admin-alert"><XCircle size={18} /><span>{error}</span></div>}

        {active === 'overview' && (
          <>
            <div className="admin-stat-grid">
              <Stat icon={Package} label="Total orders" value={stats.orders} />
              <Stat icon={Clock3} label="Orders in progress" value={stats.pending} />
              <Stat icon={CircleDollarSign} label="Delivered sales" value={money(stats.revenue)} />
              <Stat icon={Users} label="Customers" value={stats.customers} />
            </div>

            <div className="admin-grid-two">
              <Panel title="Recent orders" action={() => setActive('orders')}>
                <OrderTable orders={recentOrders} shopById={shopById} customerById={customerById} updateOrder={updateOrder} />
              </Panel>

              <Panel title="Operations">
                <div className="admin-operation-list">
                  <Operation icon={Store} label="Active shops" value={stats.shops} />
                  <Operation icon={ShoppingBag} label="Available products" value={stats.products} />
                  <Operation icon={CircleDollarSign} label="Paid transactions" value={data.payments.filter((p) => p.status === 'paid').length} />
                </div>
              </Panel>
            </div>
          </>
        )}

        {active === 'orders' && (
          <Panel title="All orders" subtitle="Monitor and manage every BG Smart Services order.">
            <OrderTable orders={data.orders} shopById={shopById} customerById={customerById} updateOrder={updateOrder} detailed />
          </Panel>
        )}

        {active === 'payments' && (
          <Panel title="Payment Management" subtitle="Review payment records and update payment status for customer orders.">
            <div className="admin-payment-summary">
              <div className="admin-payment-card"><span>Paid</span><strong>{data.payments.filter((payment) => payment.status === 'paid').length}</strong></div>
              <div className="admin-payment-card"><span>Pending</span><strong>{data.payments.filter((payment) => payment.status === 'pending').length}</strong></div>
              <div className="admin-payment-card"><span>Failed</span><strong>{data.payments.filter((payment) => payment.status === 'failed').length}</strong></div>
              <div className="admin-payment-card"><span>Refunded</span><strong>{data.payments.filter((payment) => payment.status === 'refunded').length}</strong></div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Method</th><th>Provider</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>
                <tbody>
                  {data.payments.map((payment) => {
                    const order = data.orders.find((item) => item.id === payment.order_id);
                    const customer = order ? customerById[order.customer_id] : null;
                    return (
                      <tr key={payment.id}>
                        <td><strong>#{payment.order_id.slice(0, 8).toUpperCase()}</strong>{payment.provider_reference && <small className="admin-order-address">{payment.provider_reference}</small>}</td>
                        <td>{customer?.full_name || 'Customer'}</td>
                        <td>{order?.payment_method?.replace('_', ' ') || '—'}</td>
                        <td>{payment.provider || '—'}</td>
                        <td>{money(payment.amount)}</td>
                        <td>
                          <select className="admin-select" value={payment.status} onChange={(event) => updatePayment(payment.id, { status: event.target.value })} aria-label={`Update payment status for order ${payment.order_id.slice(0, 8)}`}>
                            {['pending', 'paid', 'failed', 'refunded'].map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </td>
                        <td>{formatDate(payment.created_at)}</td>
                      </tr>
                    );
                  })}
                  {!data.payments.length && <EmptyRow label="No payment records yet." colSpan={7} />}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {active === 'shops' && (
          <Panel title="Retailers" subtitle="Your connected marketplace shops and their current availability.">
            <div className="admin-card-grid">
              {data.shops.map((shop) => (
                <div className="admin-mini-card" key={shop.id}>
                  <div className="admin-row">
                    <div className="admin-square"><Store size={19} /></div>
                    <div><strong>{shop.name}</strong><span>{shop.marketplace_category || 'Marketplace'}</span></div>
                  </div>
                  <div className={shop.active ? 'admin-status success' : 'admin-status muted'}>{shop.active ? 'Active' : 'Inactive'}</div>
                  <small>{shop.shopping_location || shop.pickup_address || 'Pickup location not set'}</small>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {active === 'products' && (
          <Panel title="Products" subtitle="Monitor product availability and pricing across retailers.">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Shop</th><th>Category</th><th>Price</th><th>Status</th></tr></thead>
                <tbody>
                  {data.products.map((product) => (
                    <tr key={product.id}>
                      <td><strong>{product.name}</strong></td>
                      <td>{shopById[product.retailer_id]?.name || '—'}</td>
                      <td>{product.category || '—'}</td>
                      <td>{money(product.promo_price ?? product.price)}</td>
                      <td><span className={product.available ? 'admin-status success' : 'admin-status muted'}>{product.available ? 'Available' : 'Unavailable'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {active === 'customers' && (
          <Panel title="Customers" subtitle="Registered customer accounts.">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Phone</th><th>Joined</th><th>Role</th></tr></thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td><strong>{customer.full_name || 'Unnamed customer'}</strong></td>
                      <td>{customer.phone || '—'}</td>
                      <td>{formatDate(customer.created_at)}</td>
                      <td><span className="admin-status success">Customer</span></td>
                    </tr>
                  ))}
                  {!customers.length && <EmptyRow label="No customer accounts yet." />}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {active === 'settings' && (
          <Panel title="Admin settings" subtitle="Operational settings for BG Smart Services.">
            <div className="admin-settings">
              <div><strong>Delivery area</strong><span>Eersterust only</span></div>
              <div><strong>Delivery fee</strong><span>R65.00</span></div>
              <div><strong>Service fee</strong><span>Removed</span></div>
              <div><strong>Cart rule</strong><span>One shop per order</span></div>
              <div><strong>Closing-time rule</strong><span>Orders stop 1 hour before a shop closes</span></div>
            </div>
          </Panel>
        )}
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <div className="admin-stat"><div className="admin-stat-icon"><Icon size={19} /></div><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        {action && <button className="admin-link-button" onClick={action}>View all <ChevronRight size={16} /></button>}
      </div>
      {children}
    </section>
  );
}

function Operation({ icon: Icon, label, value }) {
  return <div className="admin-operation"><Icon size={18} /><span>{label}</span><strong>{value}</strong></div>;
}

function OrderTable({ orders, shopById, customerById, updateOrder, detailed = false }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Shop</th>
            <th>Status</th>
            <th>Total</th>
            {detailed && <th>Created</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            return (
              <tr key={order.id}>
                <td>
                  <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
                  {detailed && <small className="admin-order-address">{order.delivery_address || 'No delivery address'}</small>}
                </td>
                <td>{customerById[order.customer_id]?.full_name || 'Customer'}</td>
                <td>{shopById[order.retailer_id]?.name || 'Shop'}</td>
                <td>
                  {detailed ? (
                    <select
                      className="admin-select"
                      value={order.status}
                      onChange={(event) => updateOrder(order.id, { status: event.target.value })}
                      aria-label={`Update status for order ${order.id.slice(0, 8)}`}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`admin-status ${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  )}
                </td>
                <td>{money(order.total)}</td>
                {detailed && <td>{formatDate(order.created_at)}</td>}
              </tr>
            );
          })}
          {!orders.length && <EmptyRow label="No orders yet." colSpan={detailed ? 6 : 5} />}
        </tbody>
      </table>
    </div>
  );
}

function EmptyRow({ label, colSpan = 4 }) {
  return <tr><td colSpan={colSpan}><div className="admin-empty">{label}</div></td></tr>;
}
