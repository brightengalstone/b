'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, PackageCheck, RefreshCw, Store, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const NEXT = { pending:['Confirm order','confirmed'], confirmed:['Start preparing','preparing'], preparing:['Mark ready for collection','ready'] };
const label = s => String(s||'').replaceAll('_',' ');

export default function MerchantPage(){
  const [user,setUser]=useState(null),[merchant,setMerchant]=useState(null),[retailer,setRetailer]=useState(null),[orders,setOrders]=useState([]),[items,setItems]=useState({}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[message,setMessage]=useState('');
  async function load(u=user){
    if(!supabase||!u?.id)return;
    const {data:m}=await supabase.from('merchants').select('id,business_name,retailer_id,approved').eq('owner_id',u.id).maybeSingle();
    setMerchant(m||null);
    if(!m?.approved||!m?.retailer_id){setRetailer(null);setOrders([]);setLoading(false);return;}
    const [{data:r},{data:o}]=await Promise.all([
      supabase.from('retailers').select('id,name,pickup_address,shopping_location').eq('id',m.retailer_id).maybeSingle(),
      supabase.from('orders').select('id,status,subtotal,delivery_fee,total,delivery_address,created_at,payment_method,retailer_id').eq('retailer_id',m.retailer_id).in('status',['pending','confirmed','preparing','ready','assigned','picked_up']).order('created_at',{ascending:false})
    ]);
    setRetailer(r||null);setOrders(o||[]);
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
  useEffect(()=>{if(!supabase||!user?.id)return;const ch=supabase.channel('merchant-orders-'+user.id).on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>load()).subscribe();return()=>supabase.removeChannel(ch)},[user?.id]);
  const active=useMemo(()=>orders.filter(o=>!['delivered','cancelled'].includes(o.status)),[orders]);
  if(loading)return <main className="merchant-page"><div className="merchant-shell merchant-center"><RefreshCw className="merchant-spin"/> Loading shop dashboard…</div></main>;
  if(!merchant?.approved||!retailer)return <main className="merchant-page"><div className="merchant-shell merchant-center"><Store size={32}/><h1>Shop dashboard not configured</h1><p>An approved merchant account must be linked to a BG retailer before orders can be managed.</p><Link href="/home" className="merchant-button secondary">Back to home</Link></div></main>;
  return <main className="merchant-page"><div className="merchant-shell">
    <header className="merchant-header"><div className="merchant-brand"><span className="brand-mark">BG</span><div><strong>BG Smart Services</strong><span>Shop Console</span></div></div><Link href="/home" className="merchant-back">Customer site</Link></header>
    <section className="merchant-hero"><div><span className="merchant-eyebrow">Shop operations</span><h1>{retailer.name}</h1><p>{retailer.pickup_address||retailer.shopping_location||'Manage incoming orders.'}</p></div><div className="merchant-stat"><strong>{active.length}</strong><span>Active orders</span></div></section>
    {message&&<div className="merchant-message"><CheckCircle2 size={17}/>{message}</div>}
    <section className="merchant-grid">{active.length===0?<div className="merchant-empty"><PackageCheck size={30}/><h2>No active orders</h2><p>New customer orders will appear here in real time.</p></div>:active.map(o=><article className="merchant-order" key={o.id}>
      <div className="merchant-order-head"><div><span className="merchant-eyebrow">Order #{o.id.slice(0,8).toUpperCase()}</span><h2>{label(o.status)}</h2></div><span className="merchant-status">{o.status}</span></div>
      <div className="merchant-order-meta"><span>{new Date(o.created_at).toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'})}</span><strong>R{Number(o.total||0).toFixed(2)}</strong></div>
      <div className="merchant-items">{(items[o.id]||[]).map(i=><div key={i.id}><span>{i.product?.name||'Product'}{i.product?.size?' · '+i.product.size:''}</span><strong>×{i.quantity}</strong></div>)}</div>
      <div className="merchant-address"><span>Deliver to</span><strong>{o.delivery_address}</strong></div>
      <div className="merchant-actions">{NEXT[o.status]&&<button onClick={()=>updateStatus(o.id,NEXT[o.status][1])} disabled={busy===o.id} className="merchant-button primary">{busy===o.id?'Saving…':NEXT[o.status][0]}</button>}{o.status==='pending'&&<button onClick={()=>updateStatus(o.id,'cancelled')} disabled={busy===o.id} className="merchant-button danger"><XCircle size={16}/> Reject</button>}{o.status==='ready'&&<div className="merchant-ready"><CheckCircle2 size={16}/> Ready — waiting for driver</div>}</div>
    </article>)}</section>
    <footer className="merchant-footer"><Clock3 size={15}/> Eersterust only · R65 delivery · No service fee · One shop per order</footer>
  </div></main>;
}
