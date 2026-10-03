'use client';
import NotificationBell from '../../components/NotificationBell';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Clock3,MapPin,RefreshCw,ShoppingBag,Truck} from 'lucide-react';
import {supabase} from '../../lib/supabase';

const activeStatuses=new Set(['pending','confirmed','preparing','ready','assigned','picked_up']);
const statusLabel={pending:'Order placed',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready for collection',assigned:'Driver assigned',picked_up:'Out for delivery',delivered:'Delivered',cancelled:'Cancelled'};
function money(value){return `R${Number(value||0).toFixed(2)}`}
function dateLabel(value){return value?new Intl.DateTimeFormat('en-ZA',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—'}

export default function Orders(){
 const [orders,setOrders]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[signedIn,setSignedIn]=useState(true),[filter,setFilter]=useState('all');
 async function loadOrders(){
  setLoading(true);setError('');
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){setSignedIn(false);setOrders([]);setLoading(false);return}
  setSignedIn(true);
  const {data,error:queryError}=await supabase.from('orders').select('id,status,subtotal,delivery_fee,total,delivery_address,created_at,updated_at,retailer_id,retailers(name,logo_url),order_items(quantity,unit_price,retailer_products(name,image_url,size))').eq('customer_id',user.id).order('created_at',{ascending:false}).limit(50);
  if(queryError){setError('We could not load your orders right now. Please try again.');setOrders([])}else setOrders(data||[]);
  setLoading(false);
 }
 useEffect(()=>{loadOrders()},[]);
 const stats=useMemo(()=>({total:orders.length,active:orders.filter(o=>activeStatuses.has(o.status)).length,delivered:orders.filter(o=>o.status==='delivered').length}),[orders]);
 const visibleOrders=useMemo(()=>orders.filter(o=>filter==='all'||(filter==='active'&&activeStatuses.has(o.status))||(filter==='delivered'&&o.status==='delivered')||(filter==='cancelled'&&o.status==='cancelled')),[orders,filter]);
 const latestActive=useMemo(()=>orders.find(o=>activeStatuses.has(o.status)),[orders]);

 if(!signedIn)return <main className="orders-page"><div className="orders-shell"><Link href="/home" className="orders-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link><div className="orders-empty"><div className="orders-empty-icon"><ShoppingBag size={28}/></div><div className="eyebrow">My Orders</div><h1>Sign in to view your orders.</h1><p>Your completed and active orders will appear here once you sign in.</p><Link className="btn btn-primary" href="/signin">Sign in</Link></div></div></main>;

 return <main className="orders-page"><div className="orders-shell">
  <div className="orders-top"><Link href="/home" className="orders-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link><div className="orders-top-actions"><NotificationBell/><button className="icon-button" onClick={loadOrders} aria-label="Refresh orders"><RefreshCw size={18}/></button></div></div>
  <section className="orders-real-header"><div><div className="eyebrow">Your purchases</div><h1>My Orders</h1><p>Keep track of your deliveries and see your previous orders.</p></div><div className="orders-header-count"><strong>{stats.total}</strong><span>orders</span></div></section>
  {latestActive&&<section className="orders-live-card"><div className="orders-live-main"><div className="orders-live-icon"><Truck size={19}/></div><div><small>ACTIVE ORDER</small><strong>Order #{latestActive.id.slice(0,8).toUpperCase()}</strong><span>{statusLabel[latestActive.status]||'Order placed'}{latestActive.retailers?.name? ` · ${latestActive.retailers.name}`:''}</span></div></div><Link href={`/tracking?id=${latestActive.id}`} className="orders-live-action">Track delivery <ArrowRight size={16}/></Link></section>}
  <div className="orders-toolbar"><div className="orders-filters">{[['all','All orders'],['active','Active'],['delivered','Delivered'],['cancelled','Cancelled']].map(([key,label])=><button key={key} className={filter===key?'is-selected':''} onClick={()=>setFilter(key)}>{label}{key==='active'&&stats.active>0?<span>{stats.active}</span>:null}</button>)}</div><div className="orders-summary">{stats.active} active · {stats.delivered} delivered</div></div>
  {loading?<div className="orders-list">{[1,2,3].map(i=><div className="order-skeleton" key={i}/>)}</div>:error?<div className="orders-message"><p>{error}</p><button className="btn btn-primary" onClick={loadOrders}>Try again</button></div>:orders.length===0?<div className="orders-empty"><div className="orders-empty-icon"><ShoppingBag size={28}/></div><div className="eyebrow">No orders yet</div><h2>Your first order starts here.</h2><p>Shop groceries, meals and local services across Eersterust.</p><Link className="btn btn-primary" href="/marketplace">Start shopping <ArrowRight size={17}/></Link></div>:visibleOrders.length===0?<div className="orders-filter-empty"><ShoppingBag size={22}/><strong>No {filter} orders</strong><span>Try another filter to see your order history.</span></div>:<div className="orders-list">{visibleOrders.map(order=><article className="order-card-real" key={order.id}>
   <div className="order-real-head"><div className="order-real-store">{order.retailers?.logo_url?<img src={order.retailers.logo_url} alt=""/>:<span><ShoppingBag size={17}/></span>}<div><strong>{order.retailers?.name||'BG Smart Services'}</strong><small>Order #{order.id.slice(0,8).toUpperCase()}</small></div></div><div className="order-real-date"><span className={`order-status-real status-${order.status}`}>{statusLabel[order.status]||'Order placed'}</span><small><Clock3 size={13}/>{dateLabel(order.created_at)}</small></div></div>
   {activeStatuses.has(order.status)&&<div className="order-progress-real"><div className="progress-track"><span className="progress-fill" style={{width:order.status==='pending'?'18%':order.status==='confirmed'?'34%':order.status==='preparing'?'52%':order.status==='ready'?'67%':order.status==='assigned'?'82%':'96%'}}></span></div><div className="progress-labels"><span>Placed</span><span>Preparing</span><span>On the way</span><span>Delivered</span></div></div>}
   {order.order_items?.length>0&&<div className="order-real-items">{order.order_items.slice(0,4).map((item,index)=><div className="order-real-item" key={index}><span className="order-real-image">{item.retailer_products?.image_url?<img src={item.retailer_products.image_url} alt=""/>:<ShoppingBag size={16}/>}</span><span><strong>{item.retailer_products?.name||'Item'}</strong>{item.retailer_products?.size&&<small>{item.retailer_products.size}</small>}</span><b>×{item.quantity}</b></div>)}{order.order_items.length>4&&<span className="order-more-items">+{order.order_items.length-4} more items</span>}</div>}
   <div className="order-real-bottom"><div className="order-real-address"><MapPin size={15}/><span>{order.delivery_address||'Eersterust delivery'}</span></div><div className="order-real-total"><small>Total</small><strong>{money(order.total ?? Number(order.subtotal||0)+Number(order.delivery_fee||0))}</strong></div></div>
   <div className="order-real-actions">{activeStatuses.has(order.status)&&<Link href={`/tracking?id=${order.id}`} className="btn btn-primary">Track Delivery <ArrowRight size={16}/></Link>}{order.status==='delivered'&&<Link href={`/feedback?id=${order.id}`} className="btn btn-primary">Rate Delivery</Link>}<Link href={`/order-success?id=${order.id}`} className="btn btn-ghost">{activeStatuses.has(order.status)?'View Order':'View details'}</Link></div>
  </article>)}</div>}
 </div></main>
}