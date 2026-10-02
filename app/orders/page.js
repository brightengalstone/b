'use client';
import NotificationBell from '../../components/NotificationBell';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Clock3,MapPin,PackageCheck,RefreshCw,ShoppingBag,Truck,CheckCircle2} from 'lucide-react';
import {supabase} from '../../lib/supabase';

const activeStatuses=new Set(['pending','confirmed','preparing','ready','assigned','picked_up']);

const statusLabel={pending:'Order placed',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready for collection',assigned:'Driver assigned',picked_up:'Out for delivery',delivered:'Delivered',cancelled:'Cancelled'};

function money(value){return `R${Number(value||0).toFixed(2)}`}
function dateLabel(value){return value?new Intl.DateTimeFormat('en-ZA',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—'}

export default function Orders(){
 const [orders,setOrders]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [signedIn,setSignedIn]=useState(true);
 async function loadOrders(){
  setLoading(true);setError('');
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){setSignedIn(false);setOrders([]);setLoading(false);return}
  setSignedIn(true);
  const {data,error:queryError}=await supabase.from('orders').select('id,status,subtotal,delivery_fee,total,delivery_address,created_at,updated_at,retailer_id,retailers(name,logo_url),order_items(quantity,unit_price,retailer_products(name,image_url,size))').eq('customer_id',user.id).order('created_at',{ascending:false}).limit(50);
  if(queryError){setError('We could not load your orders right now. Please try again.');setOrders([])}else {
   setOrders(data||[]);
  }
  setLoading(false);
 }

 useEffect(()=>{loadOrders()},[]);
 const stats=useMemo(()=>({total:orders.length,active:orders.filter(o=>activeStatuses.has(o.status)).length,delivered:orders.filter(o=>o.status==='delivered').length}),[orders]);
 const latestActive=useMemo(()=>orders.find(o=>activeStatuses.has(o.status)),[orders]);

 if(!signedIn)return <main className="orders-page"><div className="orders-shell"><Link href="/home" className="orders-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link><div className="orders-empty"><div className="orders-empty-icon"><ShoppingBag size={28}/></div><div className="eyebrow">My Orders</div><h1>Sign in to view your orders.</h1><p>Your completed and active orders will appear here once you sign in.</p><Link className="btn btn-primary" href="/signin">Sign in</Link></div></div></main>;

 return <main className="orders-page"><div className="orders-shell">
  <div className="orders-top"><Link href="/home" className="orders-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link><div className="orders-top-actions"><NotificationBell /><button className="icon-button" onClick={loadOrders} aria-label="Refresh orders"><RefreshCw size={18}/></button></div></div>
  <section className="orders-hero-premium"><div className="orders-hero-glow orders-hero-glow-one"></div><div className="orders-hero-glow orders-hero-glow-two"></div><div className="orders-hero-copy"><div className="orders-live-label"><span className="orders-live-dot"></span><span>Your order hub</span><i></i><small>LIVE</small></div><h1>My Orders<span>Everything you have ordered, in one clear view.</span></h1><p>See what is active, revisit past orders and jump straight into live delivery tracking.</p><div className="orders-hero-metrics"><div><span className="orders-metric-icon"><ShoppingBag size={16}/></span><span><small>Total orders</small><strong>{stats.total}</strong></span></div><div><span className="orders-metric-icon"><Truck size={16}/></span><span><small>In progress</small><strong>{stats.active}</strong></span></div><div><span className="orders-metric-icon"><CheckCircle2 size={16}/></span><span><small>Delivered</small><strong>{stats.delivered}</strong></span></div></div></div><div className="orders-hero-orbit" aria-hidden="true"><div className="orders-orbit-ring orders-orbit-ring-one"></div><div className="orders-orbit-ring orders-orbit-ring-two"></div><div className="orders-orbit-dot orders-orbit-dot-one"></div><div className="orders-orbit-dot orders-orbit-dot-two"></div><div className="orders-orbit-dot orders-orbit-dot-three"></div><div className="orders-orbit-center"><ShoppingBag size={34}/><span>ORDERS</span></div><div className="orders-orbit-label"><Truck size={13}/>{latestActive?'Live delivery available':'Ready when you are'}</div></div></section>
  {latestActive&&<section className="orders-active-banner"><div className="orders-active-icon"><Truck size={21}/></div><div><small>ACTIVE ORDER</small><strong>Order #{latestActive.id.slice(0,8).toUpperCase()}</strong><span>{statusLabel[latestActive.status]||'Order placed'}{latestActive.retailers?.name? ` · ${latestActive.retailers.name}`:''}</span></div><Link href={`/tracking?id=${latestActive.id}`} className="orders-active-link">Track now <ArrowRight size={16}/></Link></section>}
  {loading?<div className="orders-list">{[1,2,3].map(i=><div className="order-skeleton" key={i}/>)}</div>:error?<div className="orders-message"><p>{error}</p><button className="btn btn-primary" onClick={loadOrders}>Try again</button></div>:orders.length===0?<div className="orders-empty"><div className="orders-empty-icon"><ShoppingBag size={28}/></div><div className="eyebrow">No orders yet</div><h2>Your first order starts here.</h2><p>Shop groceries, meals and approved alcohol sellers across Eersterust.</p><Link className="btn btn-primary" href="/marketplace">Start shopping <ArrowRight size={17}/></Link></div>:<div className="orders-list">{orders.map((order,index)=><article className={`order-card ${index===0?"order-card-featured":""}`} key={order.id}><div className="order-card-top"><div><span className="order-status"><PackageCheck size={14}/>{statusLabel[order.status]||'Order placed'}</span><h2>Order #{order.id.slice(0,8).toUpperCase()}</h2>{order.retailers?.name&&<div className="order-store">{order.retailers.name}</div>}<p><Clock3 size={14}/>{dateLabel(order.created_at)}</p></div><strong className="order-total">{money(order.total ?? Number(order.subtotal||0)+Number(order.delivery_fee||0))}</strong></div>{order.order_items?.length>0&&<div className="order-items">{order.order_items.slice(0,4).map((item,index)=><div className="order-item" key={item.retailer_product_id||index}><span className="order-item-image">{item.retailer_products?.image_url?<img src={item.retailer_products.image_url} alt=""/>:<ShoppingBag size={16}/>}</span><span className="order-item-name">{item.retailer_products?.name||'Item'}{item.retailer_products?.size&&<small>{item.retailer_products.size}</small>}</span><strong>×{item.quantity}</strong><b>{money(Number(item.unit_price)*Number(item.quantity))}</b></div>)}</div>}<div className="order-meta"><div><MapPin size={15}/><span>{order.delivery_address||'Eersterust delivery'}</span></div><div><span>Delivery</span><strong>{money(order.delivery_fee)}</strong></div></div><div className="order-card-actions"><Link href={`/tracking?id=${order.id}`} className="btn btn-primary">Track Delivery <ArrowRight size={16}/></Link><Link href={`/order-success?id=${order.id}`} className="btn btn-ghost">View Order</Link></div></article>)}</div>}
 </div></main>
}
