'use client';

import {Suspense,useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {supabase} from '../../lib/supabase';
import Link from 'next/link';
import {CheckCircle2,Clock3,PackageCheck,ChefHat,Truck,MapPin,ArrowLeft,Phone,Navigation,Radio,ShieldCheck,ChevronRight} from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';

const steps=[
  ['Order placed',CheckCircle2,'Your order has been received.'],
  ['Confirmed',PackageCheck,'The order is being confirmed.'],
  ['Preparing',ChefHat,'The merchant is preparing your order.'],
  ['Driver assigned',Truck,'A driver will collect your order.'],
  ['Out for delivery',Navigation,'Your order is on its way to Eersterust.'],
  ['Delivered',CheckCircle2,'Your order has been delivered.']
];

function TrackingContent(){
  const params=useSearchParams();
  const requestedId=params.get('id');
  const [id,setId]=useState(requestedId||'');
  const [order,setOrder]=useState(null);
  const [loading,setLoading]=useState(true);
  const [pulse,setPulse]=useState(0);

  useEffect(()=>{const timer=setInterval(()=>setPulse(v=>v+1),5000);return()=>clearInterval(timer)},[]);

  useEffect(()=>{
    let active=true;
    async function load(){
      if(!supabase){setLoading(false);return}
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){if(active){setLoading(false);window.location.href='/signin'}return}
      let data=null;
      if(requestedId){
        const q=await supabase.from('orders').select('id,subtotal,delivery_fee,delivery_address,status').eq('id',requestedId).eq('customer_id',user.id).single();
        data=q.data;
      }else{
        const q=await supabase.from('orders').select('id,subtotal,delivery_fee,delivery_address,status').eq('customer_id',user.id).in('status',['pending','confirmed','preparing','ready','assigned','picked_up']).order('created_at',{ascending:false}).limit(1).maybeSingle();
        data=q.data;
      }
      if(active){setOrder(data||null);setId(data?.id||requestedId||'');setLoading(false)}
    }
    load();
    let channel;
    supabase?.auth.getUser().then(({data})=>{
      if(!active||!data?.user)return;
      channel=supabase.channel('customer-order-tracking-live')
        .on('postgres_changes',{event:'UPDATE',schema:'public',table:'orders'},payload=>{
          if(!active||payload?.new?.customer_id!==data.user.id)return;
          if(requestedId&&payload?.new?.id!==requestedId)return;
          setOrder(current=>({...current||{},...payload.new}));
          setId(payload?.new?.id||requestedId||'');
        }).subscribe();
    });
    return()=>{active=false;if(channel&&supabase)supabase.removeChannel(channel)};
  },[requestedId]);

  const status=String(order?.status||'pending').toLowerCase();
  const current=status==='pending'?0:status.includes('confirm')?1:status.includes('prepar')?2:status.includes('assign')||status==='ready'?3:status.includes('picked')?4:status.includes('deliver')?5:0;
  const progress=Math.round((current/(steps.length-1))*100);
  const isLive=current>=3&&current<5;
  const isDelivered=current===5;
  const eta=current>=4?'Arriving soon':current===3?'Driver collecting':'Waiting for merchant';
  const lastUpdated=useMemo(()=>isLive?'Live now':'Status updates automatically',[isLive,pulse]);

  return <main className="tracking-page">
    <div className="tracking-shell">
      <header className="tracking-nav">
        <Link href="/home" className="tracking-home-btn"><ArrowLeft size={17}/><span>Back to Home</span></Link>
        <div className="tracking-nav-title">
          <span className="tracking-brand-mark">BG</span>
          <div><strong>Track Delivery</strong><small>Live order tracking</small></div>
        </div>
        <div className="tracking-nav-actions">
          <Link href="/orders" className="tracking-orders-btn">My Orders<ChevronRight size={15}/></Link>
          <NotificationBell/>
        </div>
      </header>
      <section className="tracking-hero"><div><div className="eyebrow">Live delivery tracking</div><h1>{isDelivered?'Your order has arrived.':'Your order is on the move.'}</h1><p>{isDelivered?'Thank you for using BG Smart Services.':'Follow every step from the moment your order is confirmed until it reaches your door.'}</p></div><div className={"tracking-status "+(isLive?'is-live':'')}><span className="live-dot"></span><span>{loading?'Loading status':steps[current][0]}</span></div></section>
      {loading?<div className="card tracking-loading"><div className="tracking-loader"></div><strong>Loading your live delivery…</strong><span>Connecting to your order.</span></div>:
      <div className="tracking-grid">
        <section className="tracking-main">
          <div className="card tracking-map-card">
            <div className="tracking-map-head"><div><span className="eyebrow">Delivery route</span><h2>{isLive?'Driver is on the way':isDelivered?'Delivered to you':eta}</h2></div><div className="tracking-live-badge"><Radio size={14}/>{lastUpdated}</div></div>
            <div className="live-map">
              <div className="map-grid-lines"></div><div className="map-road road-a"></div><div className="map-road road-b"></div><div className="map-road road-c"></div><div className="map-route"></div>
              <div className="map-location restaurant-location"><div className="map-marker store-marker"><PackageCheck size={17}/></div><span>Collection</span></div>
              <div className={"map-driver "+(isLive?'moving':'')}><div className="driver-pulse"></div><div className="driver-marker"><Truck size={18}/></div></div>
              <div className="map-location home-location"><div className="map-marker home-marker"><MapPin size={17}/></div><span>Eersterust</span></div>
              <div className="map-label"><Navigation size={13}/> Eersterust delivery zone</div>
            </div>
            <div className="tracking-map-footer">
              <div><Clock3 size={17}/><span><small>Estimated arrival</small><strong>{eta}</strong></span></div>
              <div><ShieldCheck size={17}/><span><small>Delivery fee</small><strong>R{Number(order?.delivery_fee??65).toFixed(2)}</strong></span></div>
              {isLive&&<button className="tracking-call" type="button"><Phone size={16}/> Contact driver</button>}
            </div>
          </div>
          <div className="card tracking-card">
            <div className="tracking-order-head"><div><span className="eyebrow">Order number</span><h2>{id||'No order selected'}</h2></div><span className="tracking-pill">R65 delivery</span></div>
            <div className="tracking-progress"><div className="tracking-progress-fill" style={{width:progress+'%'}}></div></div>
            <div className="tracking-timeline">{steps.map(([label,Icon,desc],i)=><div className={"tracking-step "+(i<=current?'is-active ':'')+(i===current?'is-current':'')} key={label}><div className="step-line"></div><div className="step-icon"><Icon size={18}/></div><div className="step-copy"><strong>{label}</strong><span>{desc}</span>{i===current&&<small>Current status</small>}</div></div>)}</div>
          </div>
        </section>
        <aside className="tracking-side">
          <div className="card tracking-driver-card">
            <div className="tracking-side-heading"><span className="eyebrow">Your driver</span><span className={isLive?'driver-online':''}><span className="live-dot"></span>{isLive?'Online':'Standby'}</span></div>
            <div className="driver-profile"><div className="driver-avatar">BG</div><div><strong>Your BG Driver</strong><span>BG Smart Services</span></div><ChevronRight size={18}/></div>
            <div className="driver-actions"><button type="button"><Phone size={16}/> Contact</button><button type="button"><Navigation size={16}/> Track</button></div>
          </div>
          <div className="card tracking-summary">
            <span className="eyebrow">Delivery details</span><div className="tracking-address"><MapPin size={18}/><span>{order?.delivery_address||'Eersterust'}</span></div>
            {order&&<><div className="summary-row"><span>Subtotal</span><strong>R{Number(order.subtotal||0).toFixed(2)}</strong></div><div className="summary-row"><span>Delivery</span><strong>R{Number(order.delivery_fee??65).toFixed(2)}</strong></div><div className="summary-row summary-total"><span>Total</span><strong>R{(Number(order.subtotal||0)+Number(order.delivery_fee??65)).toFixed(2)}</strong></div></>}
            <Link className="btn btn-primary" href="/orders">View My Orders</Link>
          </div>
        </aside>
      </div>}
    </div>
  </main>
}

export default function Tracking(){
  return <Suspense fallback={<main className="tracking-page"><div className="tracking-shell"><div className="card tracking-loading"><div className="tracking-loader"></div><strong>Loading tracking…</strong></div></div></main>}><TrackingContent/></Suspense>
}
