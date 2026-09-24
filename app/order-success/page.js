'use client';

import {CheckCircle2,ArrowRight,ShoppingBag,MapPin,ReceiptText} from 'lucide-react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Suspense,useEffect,useState} from 'react';
import {supabase} from '../../lib/supabase';

function SuccessContent(){
  const params=useSearchParams();
  const id=params.get('id');
  const [order,setOrder]=useState(null);
  const [loading,setLoading]=useState(Boolean(id));
  useEffect(()=>{
    let active=true;
    async function load(){
      if(!id||!supabase){setLoading(false);return}
      const {data}=await supabase.from('orders').select('id,subtotal,delivery_fee,delivery_address').eq('id',id).single();
      if(active){setOrder(data||null);setLoading(false)}
    }
    load(); return()=>{active=false};
  },[id]);
  const subtotal=Number(order?.subtotal||0),delivery=Number(order?.delivery_fee??65),total=subtotal+delivery;
  return <main className="success-page"><div className="success-shell">
    <Link href="/home" className="success-brand"><span className="brand-mark">BG</span><span>BG Smart Services</span></Link>
    <section className="success-card">
      <div className="success-icon"><CheckCircle2 size={42} strokeWidth={1.8}/></div>
      <div className="eyebrow">Order confirmed</div>
      <h1>Thank you for trusting and using our services.</h1>
      <p className="success-lead">Your order has been placed successfully. You can follow its progress from the tracking page.</p>
      {loading?<div className="success-loading">Loading order details…</div>:order?<div className="success-details">
        <div className="success-order"><span>Order number</span><strong>{order.id}</strong></div>
        <div className="success-grid">
          <div><ReceiptText size={18}/><span><small>Subtotal</small><strong>R{subtotal.toFixed(2)}</strong></span></div>
          <div><ShoppingBag size={18}/><span><small>Delivery</small><strong>R{delivery.toFixed(2)}</strong></span></div>
          <div><MapPin size={18}/><span><small>Delivering to</small><strong>{order.delivery_address}</strong></span></div>
        </div>
        <div className="success-total"><span>Total</span><strong>R{total.toFixed(2)}</strong></div>
      </div>:<div className="notice">Your order was placed. Use Track Delivery to view its status.</div>}
      <div className="success-actions">
        <Link className="btn btn-primary btn-large" href={id?"/tracking?id="+encodeURIComponent(id):"/tracking"}>Track Delivery <ArrowRight size={17}/></Link>
        <Link className="btn btn-ghost btn-large" href="/marketplace">Continue Shopping</Link>
        <Link className="success-orders" href="/account">View My Orders</Link>
      </div>
    </section>
  </div></main>
}
export default function OrderSuccess(){return <Suspense fallback={<main className="success-page"><div className="success-loading">Loading…</div></main>}><SuccessContent/></Suspense>}
