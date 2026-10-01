'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../../lib/supabase';
import {ShoppingCart,Package,Heart,UserRound,Settings,CircleHelp,LogOut,House,Store,X,Search,Bell,MapPin,ChevronRight,Utensils,MoreHorizontal,Drumstick,BriefcaseMedical,Wine} from 'lucide-react';

function TukTuk({size=24}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 15h14l-1-6H8l-3 6Z"/><path d="M8 9V6h7l3 3"/><path d="M5 15v2h14v-2"/><path d="M8 17a2 2 0 1 0 4 0M16 17a2 2 0 1 0 4 0"/><path d="M19 9h1.5a1.5 1.5 0 0 1 0 3H19"/></svg>}
const menuItems=[[House,'Home','/home'],[Store,'Marketplace','/marketplace'],[ShoppingCart,'Cart','/cart'],[Package,'My Orders','/orders'],[TukTuk,'Track Delivery','/tracking'],[Heart,'Favourites','/favorites'],[UserRound,'My Account','/account'],[Settings,'Settings','/account'],[CircleHelp,'Help','/help']];
const categories=[[Utensils,'Food & Restaurants','/marketplace'],[Drumstick,'Butcheries','/marketplace'],[BriefcaseMedical,'Pharmacies','/marketplace'],[Wine,'Bottle Store','/marketplace'],[MoreHorizontal,'More','/marketplace']];

function StoreCard({store}){const [brand,location]=store.name.split(' — ');return <Link href={'/marketplace?retailer='+store.slug} className="home-store-card"><div className="home-store-image"><span>{store.logo_mark||brand.slice(0,1)}</span></div><div className="home-store-info"><strong>{brand}</strong><span>{location||store.shopping_location}</span></div><ChevronRight size={16}/></Link>}

export default function Home(){
  const[open,setOpen]=useState(false),[stores,setStores]=useState([]),[name,setName]=useState('Customer'),[unreadCount,setUnreadCount]=useState(0);

  useEffect(()=>{
    let mounted=true; let channel=null;
    (async()=>{
      if(!supabase)return;
      const[{data},auth]=await Promise.all([
        supabase.from('retailers').select('id,name,slug,marketplace_category,shopping_location,logo_mark,logo_url').eq('active',true).in('shopping_location',['Eersterust Plaza','Denlyn Shopping Centre','Tshwane Regional Mall','Silver Crossing']).order('name'),
        supabase.auth.getUser()
      ]);
      if(!mounted)return;
      setStores(data||[]);
      const u=auth?.data?.user;
      setName(u?.user_metadata?.name||u?.user_metadata?.full_name?.split(' ')[0]||u?.email?.split('@')[0]||'Customer');
      if(u){
        const refreshUnread=async()=>{const {count}=await supabase.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',u.id).is('read_at',null);if(mounted)setUnreadCount(count||0)};
        await refreshUnread();
        channel=supabase.channel('home-notifications').on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:'user_id=eq.'+u.id},refreshUnread).subscribe();
      }
    })();
    return()=>{mounted=false;if(channel)supabase.removeChannel(channel)};
  },[]);

  // Local delivery on Home is restaurant-only. Supermarkets/grocery retailers are excluded.
  const foodStores=stores.filter(s=>String(s.marketplace_category||'').toLowerCase()==='fast-food');
  const popular=foodStores.slice(0,4);

  return <main className="mobile-app-shell">
    <header className="mobile-home-header"><div><div className="home-brand-line"><span className="brand-mark">BG</span><strong>SMART SERVICES</strong></div><h1>Hi, {name}</h1><p>Welcome back!</p></div><div className="mobile-header-icons"><Link href="/account/notifications" className="round-icon" aria-label="Notifications"><Bell size={19}/>{unreadCount>0&&<i/>}</Link><Link href="/account" className="round-icon" aria-label="My account"><UserRound size={19}/></Link></div></header>
    <div className="home-location"><MapPin size={15}/><span>Home · Eersterust, Pretoria</span><ChevronRight size={15}/></div>
    <div className="mobile-home-search"><Search size={18}/><span>Search for shops, products...</span></div>
    <section className="home-promo"><div><span>Fast &amp; Reliable</span><strong>Local Delivery</strong><p>Eersterust Only<br/>R65 delivery · No service fee</p></div><div className="promo-art"><TukTuk size={78}/></div></section>
    <section className="home-categories">{categories.map(([Icon,label,href])=><Link href={href} key={label}><span><Icon size={21}/></span><small>{label}</small></Link>)}</section>
    <section className="home-nearby"><div className="mobile-section-title"><h2>Popular Stores</h2><Link href="/marketplace">View all</Link></div><div className="nearby-grid">{popular.length?popular.map(store=><StoreCard key={store.id} store={store} />):<div className="order-placeholder"><Store size={20}/><span>Popular stores will appear here.</span></div>}</div></section>
    <section className="home-order-again"><div className="mobile-section-title"><h2>Shop Local Restaurants</h2><Link href="/marketplace">Marketplace</Link></div><div className="order-again-row">{foodStores.slice(0,4).map(store=><StoreCard key={store.id} store={store}/>)}</div></section>
    <section className="home-delivery-strip"><div><TukTuk size={25}/></div><span><strong>Delivery across Eersterust</strong><small>R65 delivery · No service fee</small></span><b>Available</b></section>
    <nav className="mobile-bottom-nav"><Link href="/home" className="active"><House size={20}/><small>Home</small></Link><Link href="/marketplace"><Store size={20}/><small>Marketplace</small></Link><Link href="/cart"><ShoppingCart size={20}/><small>Cart</small></Link><Link href="/orders"><Package size={20}/><small>My Orders</small></Link><button onClick={()=>setOpen(true)}><MoreHorizontal size={20}/><small>More</small></button></nav>
    {open&&<div className="menu-overlay" onClick={()=>setOpen(false)}><aside className="app-menu" onClick={e=>e.stopPropagation()}><div className="menu-head"><div><span className="brand-mark">BG</span><strong>Smart Services</strong></div><button className="icon-button" aria-label="Close menu" onClick={()=>setOpen(false)}><X size={20}/></button></div><nav className="menu-list">{menuItems.map(([Icon,label,href])=><Link href={href} key={label} onClick={()=>setOpen(false)}><Icon size={19}/><span>{label}</span></Link>)}<button className="menu-signout" onClick={async()=>{await supabase.auth.signOut();window.location.href='/'}}><LogOut size={19}/><span>Sign Out</span></button></nav></aside></div>}
  </main>
}
