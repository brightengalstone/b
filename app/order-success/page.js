'use client';

import { CheckCircle2, ArrowRight, ShoppingBag, MapPin, ReceiptText, Clock3, Truck, Home, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './success.module.css';

function SuccessContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id || !supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (active) { setLoading(false); setOrder(null); } return; }

      const { data } = await supabase
        .from('orders')
        .select('id,subtotal,delivery_fee,service_fee,total,delivery_address,delivery_address_verified')
        .eq('id', id)
        .eq('customer_id', user.id)
        .single();

      if (active) { setOrder(data || null); setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [id]);

  const subtotal = Number(order?.subtotal || 0);
  const delivery = Number(order?.delivery_fee ?? 65);
  const service = Number(order?.service_fee || 0);
  const total = Number(order?.total ?? subtotal + delivery + service);

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link href="/home" className={styles.brand}>
            <span className={styles.brandMark}>BG</span>
            <span>BG Smart Services</span>
          </Link>
          <div className={styles.secure}><CheckCircle2 size={15}/> Order confirmed</div>
        </header>

        <section className={styles.hero}>
          <div className={styles.successOrb}>
            <div className={styles.ring}></div>
            <CheckCircle2 size={54} strokeWidth={1.8}/>
          </div>
          <div className={styles.eyebrow}>ORDER RECEIVED</div>
          <h1>We’ve got your order.</h1>
          <p>Your order has been received and is being prepared. We’ll keep you updated as it moves from the shop to your door.</p>

          {loading ? <div className={styles.loading}>Loading your order details…</div> : order ? (
            <div className={styles.orderPanel}>
              <div className={styles.orderHeader}>
                <div>
                  <span>ORDER NUMBER</span>
                  <strong>#{String(order.id).slice(0, 8).toUpperCase()}</strong>
                </div>
                <div className={styles.statusPill}><span/> Received</div>
              </div>

              <div className={styles.timeline}>
                <div className={styles.stepActive}><span><CheckCircle2 size={17}/></span><div><strong>Order received</strong><small>We’ve received your order</small></div></div>
                <div className={styles.line}/>
                <div><span><Clock3 size={17}/></span><div><strong>Being prepared</strong><small>The shop will prepare your items</small></div></div>
                <div className={styles.line}/>
                <div><span><Truck size={17}/></span><div><strong>On the way</strong><small>Your BG driver will collect and deliver</small></div></div>
                <div className={styles.line}/>
                <div><span><Home size={17}/></span><div><strong>Delivered</strong><small>Arriving at your door</small></div></div>
              </div>

              <div className={styles.summary}>
                <div className={styles.summaryTitle}><ReceiptText size={18}/> Order summary</div>
                <div className={styles.summaryRow}><span>Items subtotal</span><strong>R{subtotal.toFixed(2)}</strong></div>
                <div className={styles.summaryRow}><span>Delivery</span><strong>R{delivery.toFixed(2)}</strong></div>
                {service > 0 && <div className={styles.summaryRow}><span>Service</span><strong>R{service.toFixed(2)}</strong></div>}
                <div className={styles.total}><span>Total paid</span><strong>R{total.toFixed(2)}</strong></div>
              </div>

              <div className={styles.destination}>
                <span className={styles.destinationIcon}><MapPin size={18}/></span>
                <div><small>DELIVERING TO</small><strong>{order.delivery_address || 'Your saved delivery address'}</strong></div>
                {order.delivery_address_verified && <PackageCheck size={18} className={styles.verified}/>}
              </div>
            </div>
          ) : (
            <div className={styles.notice}><CheckCircle2 size={18}/> Your order was placed successfully. Open tracking to follow its progress.</div>
          )}

          <div className={styles.actions}>
            <Link className={styles.primary} href={id ? "/tracking?id=" + encodeURIComponent(id) : "/tracking"}>Track my delivery <ArrowRight size={18}/></Link>
            <Link className={styles.secondary} href="/orders"><ShoppingBag size={17}/> View my orders</Link>
          </div>
          <Link href="/marketplace" className={styles.continue}>Continue shopping</Link>
        </section>
      </div>
    </main>
  );
}

export default function OrderSuccess() {
  return <Suspense fallback={<main className={styles.page}><div className={styles.loading}>Loading…</div></main>}><SuccessContent/></Suspense>;
}
