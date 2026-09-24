'use client';

import {Suspense,useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {supabase} from '../../lib/supabase';
import Link from 'next/link';
import {CheckCircle2,Clock3,PackageCheck,ChefHat,Truck,MapPin,ArrowLeft} from 'lucide-react';

const steps=[
  ['Order placed',CheckCircle2,'Your order has been received.'],
  ['Confirmed',PackageCheck,'The order is being confirmed.'],
  ['Preparing',ChefHat,'The merchant is preparing your order.'],
  ['Driver assigned',Truck,'A driver will collect your order.'],
  ['Out for delivery',MapPin,'Your order is on its way to Eersterust.'],
  ['Delivered',CheckCircle2,'Your order has been delivered.']
];

function TrackingContent(){
  const params=useSearchParams();
  const requestedId=params.get('id');
  const [id,setId]=useState(requestedId||'');
  const [order,setOrder]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let active=true;
    async function load(){
      if(!supabase){setLoading(false);return}
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){if(active){setLoading(false);window.location.href='/signin'}return}
      let data=null;
      if(requestedId){const q=await supabase.from('orders').select('id,subtotal,delivery_fee,delivery_address,status').eq('id',requestedId).single();data=q.data}
      else{const q=await supabase.from('orders').select('id,subtotal,delivery_fee,delivery_address,status').eq('customer_id',user.id).in('status',['pending','confirmed','preparing','ready','assigned','picked_up']).order('created_at',{ascending:false}).limit(1).maybeSingle();data=q.data}
      if(active){setOrder(data||null);setId(data?.id||requestedId||'');setLoading(false)}
    }
    load();
    return()=>{active=false};
  },[id]);

  const status=String(order?.status||'pending').toLowerCase();
  const current=status==='pending'?0:status.includes('confirm')?1:status.includes('prepar')?2:status.includes('assign')?3:status.includes('picked')?4:status.includes('deliver')?5:0;

  return <main className="tracking-page">
    <div className="tracking-shell">
      <div className="tracking-top"><Link href="/home" className="back-link"><ArrowLeft size={17}/> Back to Home</Link><span className="eyebrow">BG Smart Services</span></div>
      <section className="tracking-hero"><div><div className="eyebrow">Delivery tracking</div><h1>Follow your order.</h1><p>See the current order stage from confirmation through delivery.</p></div><div className="tracking-status"><Clock3 size={18}/><span>{loading?'Loading status':steps[current][0]}</span></div></section>
      {loading?<div className="card">Loading order details…</div>:<div className="tracking-grid">
        <section className="card tracking-card"><div className="tracking-order-head"><div><span className="eyebrow">Order number</span><h2>{id||'No order selected'}</h2></div><span className="tracking-pill">R65 delivery</span></div>
          <div className="tracking-timeline">{steps.map(([label,Icon,desc],i)=><div className={"tracking-step "+(i<=current?'is-active ':'')+(i===current?'is-current':'')} key={label}><div className="step-line"></div><div className="step-icon"><Icon size={18}/></div><div className="step-copy"><strong>{label}</strong><span>{desc}</span></div></div>)}</div>
        </section>
        <aside className="card tracking-summary"><span className="eyebrow">Delivery details</span><div className="tracking-address"><MapPin size={18}/><span>{order?.delivery_address||'Eersterust'}</span></div>{order&&<><div className="summary-row"><span>Subtotal</span><strong>R{Number(order.subtotal||0).toFixed(2)}</strong></div><div className="summary-row"><span>Delivery</span><strong>R{Number(order.delivery_fee??65).toFixed(2)}</strong></div><div className="summary-row summary-total"><span>Total</span><strong>R{(Number(order.subtotal||0)+Number(order.delivery_fee??65)).toFixed(2)}</strong></div></>}<Link className="btn btn-primary" href="/marketplace">Continue Shopping</Link></aside>
      </div>}
    </div>
  </main>
}

export default function Tracking(){
  return <Suspense fallback={<main className="tracking-page"><div className="tracking-shell"><div className="card">Loading tracking…</div></div></main>}>
    <TrackingContent />
  </Suspense>
}
