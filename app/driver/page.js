'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Package, Phone, Power, RefreshCw, ShoppingBag, Store, Truck, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ACTIVE_STATUSES = ['assigned', 'preparing', 'picked_up'];

function money(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

function formatStatus(status) {
  return String(status || '').replace('_', ' ');
}

export default function DriverPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [retailer, setRetailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const isBusy = Boolean(order && ACTIVE_STATUSES.includes(order.status));

  async function loadOrder(driverId) {
    if (!supabase || !driverId) return;

    const { data: assignedOrder } = await supabase
      .from('orders')
      .select('id, status, subtotal, delivery_fee, total, delivery_address, notes, created_at, updated_at, retailer_id, customer_id, payment_method')
      .eq('driver_id', driverId)
      .in('status', ACTIVE_STATUSES)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    setOrder(assignedOrder || null);

    if (!assignedOrder) {
      setItems([]);
      setRetailer(null);
      return;
    }

    const [{ data: orderItems }, { data: shop }] = await Promise.all([
      supabase
        .from('order_items')
        .select('id, quantity, unit_price, retailer_product_id')
        .eq('order_id', assignedOrder.id)
        .order('id'),
      supabase
        .from('retailers')
        .select('id, name, shopping_location, pickup_address, directions_url')
        .eq('id', assignedOrder.retailer_id)
        .maybeSingle(),
    ]);

    let productRows = [];
    const productIds = (orderItems || []).map((item) => item.retailer_product_id).filter(Boolean);
    if (productIds.length) {
      const { data } = await supabase
        .from('retailer_products')
        .select('id, name, size, category, image_url')
        .in('id', productIds);
      productRows = data || [];
    }

    const productById = Object.fromEntries(productRows.map((product) => [product.id, product]));
    setItems((orderItems || []).map((item) => ({ ...item, product: productById[item.retailer_product_id] || null })));
    setRetailer(shop || null);
  }

  async function claimNext() {
    if (!supabase || !user?.id || !driverProfile?.approved || !driverProfile?.available || order) return;
    const { data: orderId, error } = await supabase.rpc('claim_next_delivery');
    if (error) {
      setMessage(error.message);
      return;
    }
    if (orderId) {
      await loadOrder(user.id);
      setMessage('A delivery has been assigned to you.');
    }
  }

  async function refresh() {
    if (!supabase || !user?.id) return;
    setBusy(true);
    setMessage('');
    await loadOrder(user.id);
    const { data } = await supabase
      .from('driver_profiles')
      .select('id, vehicle_type, vehicle_registration, approved, available')
      .eq('id', user.id)
      .maybeSingle();
    setDriverProfile(data || null);
    setLastRefresh(new Date());
    setBusy(false);
  }

  async function toggleAvailability() {
    if (!supabase || !driverProfile || isBusy) return;
    setBusy(true);
    setMessage('');
    const next = !driverProfile.available;
    const { error } = await supabase
      .from('driver_profiles')
      .update({ available: next })
      .eq('id', user.id);

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    setDriverProfile({ ...driverProfile, available: next });
    setBusy(false);

    if (next) {
      await claimNext();
    }
  }

  async function updateStatus(nextStatus) {
    if (!order || !supabase) return;
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('update_driver_delivery', {
      p_order_id: order.id,
      p_status: nextStatus,
    });

    if (error || !data) {
      setMessage(error?.message || 'The delivery status could not be updated.');
      setBusy(false);
      return;
    }

    await loadOrder(user.id);
    const { data: updatedDriver } = await supabase
      .from('driver_profiles')
      .select('id, vehicle_type, vehicle_registration, approved, available')
      .eq('id', user.id)
      .maybeSingle();
    setDriverProfile(updatedDriver || null);
    setBusy(false);

    if (nextStatus === 'delivered' || nextStatus === 'cancelled') {
      setMessage(nextStatus === 'delivered' ? 'Delivery completed. You are available for the next order.' : 'Delivery cancelled. You are available again.');
      if (updatedDriver?.available) await claimNext();
    }
  }

  useEffect(() => {
    let mounted = true;
    let channel = null;

    async function boot() {
      if (!supabase) {
        setMessage('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user || null;
      if (!mounted) return;

      if (!currentUser) {
        window.location.href = '/signin';
        return;
      }

      setUser(currentUser);

      const [{ data: currentProfile }, { data: currentDriver }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, phone, role').eq('id', currentUser.id).maybeSingle(),
        supabase.from('driver_profiles').select('id, vehicle_type, vehicle_registration, approved, available').eq('id', currentUser.id).maybeSingle(),
      ]);

      if (!mounted) return;
      setProfile(currentProfile || null);
      setDriverProfile(currentDriver || null);

      if (currentProfile?.role !== 'driver' || !currentDriver) {
        setLoading(false);
        return;
      }

      await loadOrder(currentUser.id);
      if (mounted) setLoading(false);

      channel = supabase
        .channel('driver-delivery-' + currentUser.id)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'driver_id=eq.' + currentUser.id,
        }, async () => {
          if (mounted) await loadOrder(currentUser.id);
        })
        .subscribe();

      const interval = setInterval(async () => {
        if (!mounted) return;
        const { data: latestDriver } = await supabase
          .from('driver_profiles')
          .select('id, vehicle_type, vehicle_registration, approved, available')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (!mounted) return;
        setDriverProfile(latestDriver || null);

        if (latestDriver?.approved && latestDriver?.available) {
          const { data: activeOrder } = await supabase
            .from('orders')
            .select('id')
            .eq('driver_id', currentUser.id)
            .in('status', ACTIVE_STATUSES)
            .limit(1)
            .maybeSingle();

          if (!activeOrder) await claimNext();
        }
      }, 5000);

      return () => clearInterval(interval);
    }

    boot();

    return () => {
      mounted = false;
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [items]);

  if (loading) {
    return <main className="driver-page"><div className="driver-shell driver-centered"><RefreshCw size={20} className="driver-spin" /> Loading driver console…</div></main>;
  }

  if (profile?.role !== 'driver' || !driverProfile) {
    return (
      <main className="driver-page">
        <div className="driver-shell driver-centered">
          <XCircle size={28} />
          <h1>Driver access required</h1>
          <p>This account does not have an approved driver profile.</p>
          <Link href="/home" className="driver-button secondary"><ArrowLeft size={17} /> Back to home</Link>
        </div>
      </main>
    );
  }

  if (!driverProfile.approved) {
    return (
      <main className="driver-page">
        <div className="driver-shell driver-centered">
          <Clock3 size={28} />
          <h1>Waiting for approval</h1>
          <p>Your driver profile has not been approved yet.</p>
          <Link href="/home" className="driver-button secondary"><ArrowLeft size={17} /> Back to home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="driver-page">
      <div className="driver-shell">
        <header className="driver-header">
          <div className="driver-brand"><span className="brand-mark">BG</span><div><strong>BG Smart Services</strong><span>Driver Console</span></div></div>
          <div className="driver-header-actions">
            <span className={driverProfile.available ? 'driver-online online' : 'driver-online'}><span className="driver-dot" /> {driverProfile.available ? 'Available' : 'Offline'}</span>
            <button className="driver-icon-button" onClick={refresh} disabled={busy} title="Refresh"><RefreshCw size={18} className={busy ? 'driver-spin' : ''} /></button>
          </div>
        </header>

        <section className="driver-welcome">
          <div><span className="driver-eyebrow">Driver</span><h1>Hi {profile.full_name || 'Driver'}.</h1><p>When you are available, BG Smart Services automatically gives you the next delivery.</p></div>
          <button className={driverProfile.available ? 'driver-button active' : 'driver-button'} onClick={toggleAvailability} disabled={busy || isBusy}><Power size={17} /> {driverProfile.available ? 'Go offline' : 'Go available'}</button>
        </section>

        {message && <div className="driver-message"><CheckCircle2 size={17} /><span>{message}</span></div>}

        {!order ? (
          <section className="driver-empty">
            <div className="driver-empty-icon"><Truck size={25} /></div>
            <h2>{driverProfile.available ? 'Waiting for your next delivery' : 'You are offline'}</h2>
            <p>{driverProfile.available ? 'Keep this screen open. A new eligible order will be assigned automatically when one is available.' : 'Go available when you are ready to receive deliveries.'}</p>
            {lastRefresh && <small>Last checked {lastRefresh.toLocaleTimeString('en-ZA')}</small>}
          </section>
        ) : (
          <div className="driver-grid">
            <section className="driver-card">
              <div className="driver-card-head">
                <div><span className="driver-eyebrow">Active delivery</span><h2>#{order.id.slice(0, 8).toUpperCase()}</h2></div>
                <span className="driver-status">{formatStatus(order.status)}</span>
              </div>

              <div className="driver-shop">
                <div className="driver-icon-box"><Store size={21} /></div>
                <div><span>Shop here</span><strong>{retailer?.name || 'Selected shop'}</strong><small>{retailer?.shopping_location || retailer?.pickup_address || 'Pickup address not set'}</small></div>
                {retailer?.directions_url && <a href={retailer.directions_url} target="_blank" rel="noreferrer" className="driver-map-link"><MapPin size={16} /> Directions</a>}
              </div>

              <div className="driver-section-title"><ShoppingBag size={18} /><h3>What to buy</h3><span>{itemCount} items</span></div>
              <div className="driver-items">
                {items.map((item) => (
                  <div className="driver-item" key={item.id}>
                    <div className="driver-item-copy"><strong>{item.product?.name || 'Product'}</strong><span>{item.product?.size || item.product?.category || 'Item'}</span></div>
                    <strong className="driver-quantity">× {item.quantity}</strong>
                  </div>
                ))}
              </div>

              <div className="driver-total"><span>Shopping total</span><strong>{money(order.subtotal)}</strong></div>

              <div className="driver-actions">
                {order.status === 'assigned' && <button className="driver-button primary" onClick={() => updateStatus('preparing')} disabled={busy}><ShoppingBag size={17} /> Start shopping</button>}
                {order.status === 'preparing' && <button className="driver-button primary" onClick={() => updateStatus('picked_up')} disabled={busy}><Package size={17} /> Items collected</button>}
                {order.status === 'picked_up' && <button className="driver-button primary" onClick={() => updateStatus('delivered')} disabled={busy}><CheckCircle2 size={17} /> Mark delivered</button>}
                <button className="driver-button danger" onClick={() => updateStatus('cancelled')} disabled={busy}><XCircle size={17} /> Cancel delivery</button>
              </div>
            </section>

            <aside className="driver-card driver-delivery-card">
              <span className="driver-eyebrow">Deliver to</span>
              <div className="driver-address"><MapPin size={21} /><strong>{order.delivery_address}</strong></div>
              {order.notes && <div className="driver-notes"><strong>Customer notes</strong><span>{order.notes}</span></div>}
              <div className="driver-payment"><span>Payment</span><strong>{order.payment_method === 'cash_on_delivery' ? 'Cash on delivery' : order.payment_method === 'card' ? 'Card paid online' : 'EFT'}</strong></div>
              <div className="driver-delivery-total"><span>Order total</span><strong>{money(order.total)}</strong></div>
              <div className="driver-protection"><Truck size={17} /><span>Deliver only to the verified order address in Eersterust.</span></div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
