'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, Bell, CheckCircle2, Clock3, PackageCheck, RefreshCw, Store, XCircle, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const NEXT = { pending:['Confirm order','confirmed'], confirmed:['Start preparing','preparing'], preparing:['Mark ready for collection','ready'] };
const label = s => String(s||'').replaceAll('_',' ');
const money = n => 'R' + Number(n||0).toFixed(2);

export default function MerchantPage(){
  const [user,setUser]=useState(null),[merchant,setMerchant]=useState(null),[retailer,setRetailer]=useState(null),[orders,setOrders]=useState([]),[items,setItems]=useState({}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[message,setMessage]=useState(''),[lastUpdate,setLastUpdate]=useState(new Date()),[tick,setTick]=useState(Date.now());
  async function load(u=user){
    if(!supabase||!u?.id)return;
    const {data:m}=await supabase.from('merchants').select('id,business_name,retailer_id,approved').eq('owner_id',u.id).maybeSingle();
    setMerchant(m||null);
    if(!m?.approved||!m?.retailer_id){setRetailer(null);setOrders([]);setLoading(false);return;}
    const [{data:r},{data:o}]=await Promise.all([
      supabase.from('retailers').select('id,name,pickup_address,shopping_location').eq('id',m.retailer_id).maybeSingle(),
      supabase.from('orders').select('id,status,subtotal,delivery_fee,total,delivery_address,created_at,payment_method,retailer_id').eq('retailer_id',m.retailer_id).in('status',['pending','confirmed','preparing','ready','assigned','picked_up']).order('created_at',{ascending:false})
    ]);
    setRetailer(r||null);setOrders(o||[]);setLastUpdate(new Date());
    const ids=(o||[]).map(x=>x.id);
    if(!ids.length){setItems({});setLoading(false);return;}
    const {data:oi}=await supabase.from('order_items').select('id,order_id,quantity,retailer_product_id').in('order_id',ids);
    const pids=(oi||[]).map(x=>x.retailer_product_id).filter(Boolean);
    const {data:ps}=pids.length?await supabase.from('retailer_products').select('id,name,size').in('id',pids):{data:[]};
    const by=Object.fromEntries((ps||[]).map(x=>[x.id,x])),g={};
    (oi||[]).forEach(x=>(g[x.order_id]||=[]).push({...x,product:by[x.retailer_product_id]}));setItems(g);setLoading(false);
  }
  async function updateStatus(id,status){
    setBusy(id);setMessage('');
    const {error}=await supabase.rpc('merchant_update_order_status',{p_order_id:id,p_status:status});
    if(error)setMessage(error.message);else{setMessage(status==='ready'?'Order ready. BG will assign an available driver automatically.':'Order updated.');await load();}
    setBusy('');
  }
  useEffect(()=>{(async()=>{if(!supabase){setMessage('Supabase is not configured.');setLoading(false);return;}const {data}=await supabase.auth.getUser();if(!data?.user){location.href='/signin';return;}setUser(data.user);await load(data.user);})();},[]);
  useEffect(()=>{if(!supabase||!user?.id)return;const ch=supabase.channel('merchant-orders-'+user.id).on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>load()).subscribe();const timer=setInterval(()=>load(),15000);return()=>{supabase.removeChannel(ch);clearInterval(timer)}},[user?.id]);
useEffect(()=>{const t=setInterval(()=>setTick(Date.now()),1000);return()=>clearInterval(t)},[]);
  const active=useMemo(()=>orders.filter(o=>!['delivered','cancelled'].includes(o.status)),[orders]);
const counts=useMemo(()=>({pending:active.filter(o=>o.status==='pending').length,preparing:active.filter(o=>['confirmed','preparing'].includes(o.status)).length,ready:active.filter(o=>['ready','assigned','picked_up'].includes(o.status)).length}),[active]);
  if(loading)return <main className="merchant-page"><div className="merchant-shell merchant-center"><RefreshCw className="merchant-spin"/> Loading shop dashboard…</div></main>;
  if(!merchant?.approved||!retailer)return <main className="merchant-page"><div className="merchant-shell merchant-center"><Store size={32}/><h1>Shop dashboard not configured</h1><p>An approved merchant account must be linked to a BG retailer before orders can be managed.</p><Link href="/home" className="merchant-button secondary">Back to home</Link></div></main>;
  return <main className="merchant-page"><div className="merchant-shell">
    <header className="merchant-header"><div className="merchant-brand"><span className="brand-mark">BG</span><div><strong>BG Smart Services</strong><span>Live Shop Console</span></div></div><div className="merchant-live"><span className="live-dot"/> LIVE <span className="live-time">Updated {lastUpdate.toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span></div><Link href="/home" className="merchant-back">Customer site</Link></header>
    <section className="merchant-hero"><div><span className="merchant-eyebrow"><Zap size={12}/> Shop operations</span><h1>{retailer.name}</h1><p>{retailer.pickup_address||retailer.shopping_location||'Manage incoming customer orders in real time.'}</p><div className="merchant-open"><span className="live-dot"/> Accepting orders <span>•</span> Eersterust delivery</div></div><div className="merchant-stat"><strong>{active.length}</strong><span>Orders needing attention</span><small><Activity size={13}/> Live updates enabled</small></div></section>
    <section className="merchant-kpis"><div className="merchant-kpi"><span>New</span><strong>{counts.pending}</strong><small>Awaiting confirmation</small></div><div className="merchant-kpi"><span>Preparing</span><strong>{counts.preparing}</strong><small>Being prepared now</small></div><div className="merchant-kpi"><span>Ready</span><strong>{counts.ready}</strong><small>Driver collection stage</small></div><div className="merchant-kpi merchant-kpi-live"><span><Bell size={14}/> Dispatch</span><strong>ON</strong><small>Available driver matching</small></div></section>
    {message&&<div className="merchant-message"><CheckCircle2 size={17}/>{message}</div>}
    <div className="merchant-section-head"><div><span className="merchant-eyebrow">Live order queue</span><h2>Orders happening now</h2></div><button className="merchant-refresh" onClick={()=>load()}><RefreshCw size={15}/> Refresh</button></div>
    <section className="merchant-grid">{active.length===0?<div className="merchant-empty"><div className="merchant-empty-icon"><PackageCheck size={30}/></div><h2>Ready for the next order</h2><p>Keep this screen open. New customer orders will appear here automatically.</p><span><Activity size={14}/> Listening for live orders</span></div>:active.map(o=><article className={'merchant-order merchant-order-'+o.status} key={o.id}>
      <div className="merchant-order-head"><div><span className="merchant-eyebrow">Order #{o.id.slice(0,8).toUpperCase()}</span><h2>{label(o.status)}</h2></div><span className="merchant-status"><i/> {o.status}</span></div>
      <div className="merchant-order-meta"><span><Clock3 size={14}/> {new Date(o.created_at).toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'})} · {Math.max(0,Math.floor((tick-new Date(o.created_at).getTime())/60000))} min ago</span><strong>{money(o.total)}</strong></div>
      <div className="merchant-items">{(items[o.id]||[]).map(i=><div key={i.id}><span>{i.product?.name||'Product'}{i.product?.size?' · '+i.product.size:''}</span><strong>×{i.quantity}</strong></div>)}</div>
      <div className="merchant-address"><span>Deliver to</span><strong>{o.delivery_address}</strong></div><div className="merchant-payment"><span>Payment</span><strong>{label(o.payment_method||'pending')}</strong></div>
      <div className="merchant-actions">{NEXT[o.status]&&<button onClick={()=>updateStatus(o.id,NEXT[o.status][1])} disabled={busy===o.id} className="merchant-button primary">{busy===o.id?'Saving…':NEXT[o.status][0]}</button>}{o.status==='pending'&&<button onClick={()=>updateStatus(o.id,'cancelled')} disabled={busy===o.id} className="merchant-button danger"><XCircle size={16}/> Reject</button>}{o.status==='ready'&&<div className="merchant-ready"><CheckCircle2 size={16}/> Ready — waiting for driver</div>}{['assigned','picked_up'].includes(o.status)&&<div className="merchant-ready"><Zap size={16}/> Driver is on the move</div>}</div>
    </article>)}</section>
    <footer className="merchant-footer"><Clock3 size={15}/> Eersterust only · R65 delivery · No service fee · One shop per order</footer>
  </div></main>;;
}
