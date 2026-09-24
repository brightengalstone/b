'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Package, Heart, UserRound, Settings, CircleHelp, LogOut, House, Store, X, Search, Bell, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';

function TukTuk({size=19,strokeWidth=1.9}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 15h14l-1-6H8l-3 6Z"/><path d="M8 9V6h7l3 3"/><path d="M5 15v2h14v-2"/><path d="M8 17a2 2 0 1 0 4 0M16 17a2 2 0 1 0 4 0"/><path d="M19 9h1.5a1.5 1.5 0 0 1 0 3H19"/></svg>}

const menuItems=[[House,'Home','/home'],[Store,'Marketplace','/marketplace'],[ShoppingCart,'Cart','/cart'],[Package,'My Orders','/orders'],[TukTuk,'Track Delivery','/tracking'],[Heart,'Favourites','/account'],[UserRound,'My Account','/account'],[Settings,'Settings','/account'],[CircleHelp,'Help','/account']];

function StoreCard({store}) {
  const [brand, location] = store.name.split(' — ');
  return <Link href={'/marketplace?retailer='+store.slug} className={'market-store-card '+(store.marketplace_category==='fast-food'?'fast-food-card':'food-retail-card')}>
    <div className="market-store-top">
      <div className="market-store-mark">{store.logo_url?<img src={store.logo_url} alt="" loading="lazy"/>:<span>{store.logo_mark||brand.slice(0,1)}</span>}</div>
      <div className="market-store-copy">
        <h3>{brand}</h3>
        <p>{location||store.shopping_location}</p>
      </div>
      <ArrowRight size={17}/>
    </div>
    <div className="market-store-bottom"><span><MapPin size={12}/>{store.shopping_location}</span><span>Shop</span></div>
  </Link>
}

export default function Home(){
  const [open,setOpen]=useState(false);
  const [stores,setStores]=useState([]);
  useEffect(()=>{let mounted=true;(async()=>{if(!supabase)return;const {data}=await supabase.from('retailers').select('id,name,slug,marketplace_category,shopping_location,logo_mark,logo_url').eq('active',true).in('shopping_location',['Eersterust Plaza','Denlyn Shopping Centre','Tshwane Regional Mall','Silver Crossing']).order('name');if(mounted)setStores(data||[])})();return()=>{mounted=false}},[]);
  const foodRetail=stores.filter(s=>s.marketplace_category==='food-retail');
  const fastFood=stores.filter(s=>s.marketplace_category==='fast-food');
  return <main className="app-shell">
    <header className="app-header">
      <Link href="/home" className="app-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link>
      <div className="app-header-actions">
        <button className="icon-button" aria-label="Notifications"><Bell size={19}/></button>
        <button className="menu-button" aria-label="Open menu" onClick={()=>setOpen(true)}><span/><span/><span/></button>
      </div>
    </header>
    {open&&<div className="menu-overlay" onClick={()=>setOpen(false)}>
      <aside className="app-menu" onClick={e=>e.stopPropagation()}>
        <div className="menu-head"><div><span className="brand-mark">BG</span><strong>Smart Services</strong></div><button className="icon-button" aria-label="Close menu" onClick={()=>setOpen(false)}><X size={20}/></button></div>
        <nav className="menu-list">{menuItems.map(([Icon,label,href])=><Link href={href} key={label} onClick={()=>setOpen(false)}><Icon size={19} strokeWidth={1.9}/><span>{label}</span></Link>)}<button className="menu-signout" onClick={async()=>{await supabase.auth.signOut();window.location.href='/'}}><LogOut size={19} strokeWidth={1.9}/><span>Sign Out</span></button></nav>
      </aside>
    </div>}
    <section className="home-content">
      <div className="home-intro"><div><div className="eyebrow">Eersterust delivery</div><h1>Good to see you.</h1><p>What would you like delivered today?</p></div><Link href="/cart" className="floating-cart" aria-label="Open cart"><ShoppingCart size={19}/></Link></div>
      <div className="home-search"><Search size={19}/><span>Search groceries, meals or fast food</span></div>

      <section className="marketplace-sections">
        <div className="section-head"><div><span className="eyebrow">Eersterust + Denlyn + Tshwane + Silver Crossing</span><h2>Food Retail</h2></div><Link href="/marketplace" className="section-link">View all</Link></div>
        <p className="section-subtitle">Groceries, fresh food, meat and everyday essentials.</p>
        <div className="market-store-scroller">{foodRetail.map(store=><StoreCard key={store.id} store={store}/>)}</div>
      </section>

      <section className="marketplace-sections">
        <div className="section-head"><div><span className="eyebrow">Quick meals</span><h2>Fast Food</h2></div><Link href="/marketplace" className="section-link">View all</Link></div>
        <p className="section-subtitle">Order from participating takeaway and fast-food stores.</p>
        <div className="market-store-scroller">{fastFood.map(store=><StoreCard key={store.id} store={store}/>)}</div>
      </section>

      <section className="delivery-banner"><div className="banner-icon"><TukTuk size={23} strokeWidth={1.8}/></div><div><strong>Delivery across Eersterust</strong><p>R65 delivery</p></div><span className="banner-status">Available</span></section>
    </section>
  </main>
}
