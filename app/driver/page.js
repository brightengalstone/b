'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, LogOut, MapPin, Package, RefreshCw, Truck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const activeStatuses = ['assigned', 'picked_up'];

export default function DriverPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [driver, setDriver] = useState(null);
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState({});
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!supabase) return;
    setError('');
    const { data: auth } = await supabase.auth.getUser();
    const currentUser = auth?.user;
    if (!currentUser) { window.location.href = '/signin'; return; }

    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles').select('id, full_name, phone, role').eq('id', currentUser.id).maybeSingle();

    if (profileError) { setError(profileError.message); setLoading(false); return; }
    setUser(currentUser);
    setProfile(currentProfile);

    if (currentProfile?.role !== 'driver') { setLoading(false); return; }

    const { data: driverData, error: driverError } = await supabase
      .from('driver_profiles')
      .select('id, vehicle_type, vehicle_registration, approved, available')
      .eq('id', currentUser.id).maybeSingle();

    if (driverError) { setError(driverError.message); setLoading(false); return; }
    setDriver(driverData);

    if (!driverData?.approved) { setLoading(false); return; }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, status, subtotal, delivery_fee, total, delivery_address, notes, created_at, customer_id, retailer_id')
      .eq('driver_id', currentUser.id)
      .in('status', [...activeStatuses, 'delivered'])
      .order('created_at', { ascending: false });

    if (orderError) { setError(orderError.message); setLoading(false); return; }

    const customerIds = [...new Set((orderData || []).map(o => o.customer_id).filter(Boolean))];
    const retailerIds = [...new Set((orderData || []).map(o => o.retailer_id).filter(Boolean))];

    const [{ data: customerData }, { data: retailerData }] = await Promise.all([
      customerIds.length ? supabase.from('profiles').select('id, full_name, phone').in('id', customerIds) : Promise.resolve({ data: [] }),
      retailerIds.length ? supabase.from('retailers').select('id, name, pickup_address, shopping_location').in('id', retailerIds) : Promise.resolve({ data: [] }),
    ]);

    setOrders(orderData || []);
    setCustomers(Object.fromEntries((customerData || []).map(x => [x.id, x])));
    setShops(Object.fromEntries((retailerData || []).map(x => [x.id, x])));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function changeStatus(order, nextStatus) {
    if (!supabase || !user) return;
    setError('');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', order.id)
      .eq('driver_id', user.id);

    if (updateError) { setError(updateError.message); return; }
    setOrders(current => current.map(x => x.id === order.id ? { ...x, status: nextStatus } : x));
  }

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    window.location.href = '/signin';
  }

  if (loading) return <main className="driver-shell"><div className="driver-loading"><RefreshCw size={20} className="admin-spin" /> Loading driver dashboard</div></main>;

  if (!user || profile?.role !== 'driver') {
    return <main className="driver-shell"><div className="driver-gate"><Truck size={34}/><h1>Driver access only</h1><p>This area is for authenticated driver accounts.</p><Link href="/home" className="btn btn-primary">Return home</Link></div></main>;
  }

  if (!driver?.approved) {
    return <main className="driver-shell"><div className="driver-gate"><Clock3 size={34}/><h1>Driver approval pending</h1><p>Your driver account must be approved before deliveries can be assigned.</p><button className="btn btn-primary" onClick={refresh}>Check again</button></div></main>;
  }

  const active = orders.filter(o => activeStatuses.includes(o.status));
  const delivered = orders.filter(o => o.status === 'delivered');

  return <main className="driver-shell">
    <header className="driver-header">
      <div className="driver-brand"><div className="driver-mark">BG</div><div><strong>BG Smart Services</strong><span>Driver delivery</span></div></div>
      <div className="driver-actions"><button className="driver-icon" onClick={refresh} aria-label="Refresh"><RefreshCw size={18} className={refreshing ? 'admin-spin' : ''}/></button><button className="driver-icon" onClick={signOut} aria-label="Sign out"><LogOut size={18}/></button></div>
    </header>

    {error && <div className="driver-alert">{error}</div>}

    <section className="driver-welcome">
      <div><span className="driver-eyebrow">Driver dashboard</span><h1>Hello, {profile.full_name || 'Driver'}.</h1><p>Assigned deliveries for Eersterust.</p></div>
      <div className="driver-vehicle"><Truck size={18}/><span>{driver.vehicle_type || 'Delivery vehicle'} · {driver.vehicle_registration || 'Registration pending'}</span></div>
    </section>

    <section className="driver-stats">
      <div><Clock3 size={18}/><span>Active deliveries</span><strong>{active.length}</strong></div>
      <div><CheckCircle2 size={18}/><span>Delivered</span><strong>{delivered.length}</strong></div>
    </section>

    <section className="driver-list">
      <div className="driver-section-head"><div><span className="driver-eyebrow">Your route</span><h2>Assigned deliveries</h2></div><span className="driver-area">Eersterust only</span></div>
      {!orders.length && <div className="driver-empty"><Package size={30}/><strong>No assigned deliveries</strong><span>New orders assigned by admin will appear here.</span></div>}

      {orders.map(order => {
        const customer = customers[order.customer_id];
        const shop = shops[order.retailer_id];
        const next = order.status === 'assigned' ? 'picked_up' : order.status === 'picked_up' ? 'delivered' : null;
        return <article className="driver-order" key={order.id}>
          <div className="driver-order-top"><div><span className="driver-eyebrow">Order</span><h3>#{order.id.slice(0,8).toUpperCase()}</h3></div><span className={`driver-status ${order.status}`}>{order.status.replace('_',' ')}</span></div>
          <div className="driver-route">
            <div className="driver-route-point"><div className="driver-store-dot"><Package size={16}/></div><div><small>Collect from</small><strong>{shop?.name || 'Shop'}</strong><span>{shop?.pickup_address || shop?.shopping_location || 'Pickup address unavailable'}</span></div></div>
            <div className="driver-route-line"/>
            <div className="driver-route-point"><MapPin size={18}/><div><small>Deliver to</small><strong>{customer?.full_name || 'Customer'}</strong><span>{order.delivery_address || 'Eersterust'}</span>{customer?.phone && <span>{customer.phone}</span>}</div></div>
          </div>
          {order.notes && <div className="driver-notes">{order.notes}</div>}
          <div className="driver-order-bottom"><div><span>Order total</span><strong>R{Number(order.total || 0).toFixed(2)}</strong></div>{next ? <button className="btn btn-primary" onClick={() => changeStatus(order,next)}>{next === 'picked_up' ? 'Confirm pickup' : 'Mark delivered'}</button> : <span className="driver-complete"><CheckCircle2 size={17}/> Delivered</span>}</div>
        </article>;
      })}
    </section>
  </main>;
}
