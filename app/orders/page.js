'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Clock3,MapPin,PackageCheck,RefreshCw,ShoppingBag} from 'lucide-react';
import {supabase} from '../../lib/supabase';

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
  const {data,error:queryError}=await supabase.from('orders').select('id,status,subtotal,delivery_fee,total,delivery_address,created_at,updated_at').eq('customer_id',user.id).order('created_at',{ascending:false}).limit(50);
  if(queryError){setError('We could not load your orders right now. Please try again.');setOrders([])}else setOrders(data||[]);
  setLoading(false);
 }

 useEffect(()=>{loadOrders()},[]);

 if(!signedIn)return <main className="orders-page"><div className="orders-shell"><Link href="/home" className="orders-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link><div className="orders-empty"><div className="orders-empty-icon"><ShoppingBag size={28}/></div><div className="eyebrow">My Orders</div><h1>Sign in to view your orders.</h1><p>Your completed and active orders will appear here once you sign in.</p><Link className="btn btn-primary" href="/signin">Sign in</Link></div></div></main>;

 return <main className="orders-page"><div className="orders-shell">
  <div className="orders-top"><Link href="/home" className="orders-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link><button className="icon-button" onClick={loadOrders} aria-label="Refresh orders"><RefreshCw size={18}/></button></div>
  <div className="orders-hero"><div><div className="eyebrow">Your activity</div><h1>My Orders</h1><p>Keep track of every BG Smart Services order in one place.</p></div><Link href="/marketplace" className="btn btn-primary">Shop now <ArrowRight size={17}/></Link></div>
  {loading?<div className="orders-list">{[1,2,3].map(i=><div className="order-skeleton" key={i}/>)}</div>:error?<div className="orders-message"><p>{error}</p><button className="btn btn-primary" onClick={loadOrders}>Try again</button></div>:orders.length===0?<div className="orders-empty"><div className="orders-empty-icon"><ShoppingBag size={28}/></div><div className="eyebrow">No orders yet</div><h2>Your first order starts here.</h2><p>Shop groceries, meals and approved alcohol sellers across Eersterust.</p><Link className="btn btn-primary" href="/marketplace">Start shopping <ArrowRight size={17}/></Link></div>:<div className="orders-list">{orders.map(order=><article className="order-card" key={order.id}><div className="order-card-top"><div><span className="order-status"><PackageCheck size={14}/>{statusLabel[order.status]||'Order placed'}</span><h2>Order #{order.id.slice(0,8).toUpperCase()}</h2><p><Clock3 size={14}/>{dateLabel(order.created_at)}</p></div><strong className="order-total">{money(order.total ?? Number(order.subtotal||0)+Number(order.delivery_fee||0))}</strong></div><div className="order-meta"><div><MapPin size={15}/><span>{order.delivery_address||'Eersterust delivery'}</span></div><div><span>Delivery</span><strong>{money(order.delivery_fee)}</strong></div></div><div className="order-card-actions"><Link href={`/tracking?id=${order.id}`} className="btn btn-primary">Track Delivery <ArrowRight size={16}/></Link><Link href={`/order-success?id=${order.id}`} className="btn btn-ghost">View Order</Link></div></article>)}</div>}
 </div></main>
}
