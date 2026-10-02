'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../../lib/supabase';
import {ShoppingCart,Package,Heart,UserRound,Settings,CircleHelp,LogOut,House,Store,X,Search,Bell,MapPin,ChevronRight,Utensils,MoreHorizontal,Drumstick,Clock3,Star,ShieldCheck,ArrowRight} from 'lucide-react';

function TukTuk({size=24}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 15h14l-1-6H8l-3 6Z"/><path d="M8 9V6h7l3 3"/><path d="M5 15v2h14v-2"/><path d="M8 17a2 2 0 1 0 4 0M16 17a2 2 0 1 0 4 0"/><path d="M19 9h1.5a1.5 1.5 0 0 1 0 3H19"/></svg>}
const menuItems=[[House,'Home','/home'],[Store,'Marketplace','/marketplace'],[ShoppingCart,'Cart','/cart'],[Package,'My Orders','/orders'],[TukTuk,'Track Delivery','/tracking'],[Heart,'Favourites','/favorites'],[UserRound,'My Account','/account'],[Settings,'Settings','/account'],[CircleHelp,'Help','/help']];
const categories=[['Burgers','https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=90'],['Chicken','https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=90'],['Pizza','https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=90'],['Meals & Combos','https://images.pexels.com/photos/27703379/pexels-photo-27703379.jpeg?auto=compress&cs=tinysrgb&w=900'],['Sides','https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=90'],['Drinks','https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=90']];

function TukTukMockup(){return <div className="eersterust-tuktuk-mockup" role="img" aria-label="BG Smart Services tuk tuk"><div className="tuk-roof">BG DELIVERY</div><div className="tuk-window"><i></i><i></i><i></i></div><div className="tuk-body"><strong>BG SMART</strong><b>SERVICES</b></div><div className="tuk-wheel tuk-wheel-left"></div><div className="tuk-wheel tuk-wheel-right"></div></div>}

const RESTAURANT_IMAGES={
  "mcdonald's":"https://tb-static.uber.com/prod/image-proc/processed_images/63da31f5a12efe093a58a2bfda353828/bc9c318a9c96996e2d990faf2b0c65f6.jpeg",
  "kfc":"https://tb-static.uber.com/prod/image-proc/processed_images/c9eed5cae53c68e35c237b07926786ac/3ac2b39ad528f8c8c5dc77c59abb683d.jpeg",
  "chicken licken":"https://tb-static.uber.com/prod/image-proc/processed_images/edb7ab8c53d9918215554ff2d613bc2e/58f691da9eaef86b0b51f9b2c483fe63.jpeg",
  "debonairs pizza":"https://media.cylex.net.za/companies/2369/2717/images/-341338167-Large-Chicken-Mushroom-pizza-from-Debonairs-Pizza-placed-on-top-of-a-black-plate-on-a-_755684_large.jpg",
  "nando's":"https://tb-static.uber.com/prod/image-proc/processed_images/20e813d036254cadbb3a8280a76b55d3/c9252e6c6cd289c588c3381bc77b1dfc.jpeg",
  "roman's pizza":"https://tb-static.uber.com/prod/image-proc/processed_images/514842a8cd43da79a6a07e730fdc456e/fb86662148be855d931b37d6c1e5fcbe.jpeg",
  "steers":"https://steers.co.za/images/menu/2023/july/single-page-product-images/burgers/king-steers-burgers/nextImageExportOptimizer/mighty-king-steer-burger-leftright-chips-opt-750.PNG",
  "hungry lion":"https://img.mrdfood.com/data/d20b9ea3-a721-4606-b68b-269b24cdd9d4.PNG",
  "uncle faouzi":"https://tb-static.uber.com/prod/image-proc/processed_images/539495ca17684e669c7d1239d1841cb1/c9252e6c6cd289c588c3381bc77b1dfc.jpeg"
};

const RESTAURANT_FALLBACKS={...RESTAURANT_IMAGES};

const SUPERMARKETS=[
{name:'Pick n Pay',image:'https://www.thefrontline.co.za/logos-branding/picknpay-logo-001/'},
{name:'Shoprite',image:'https://brandfetch.com/shoprite.co.za'},
{name:'Checkers',image:'https://brandfetch.com/checkers.co.za'},
{name:'SPAR',image:'https://www.spar.co.za/'},
{name:'Woolworths',image:'https://www.woolworthsholdings.co.za/woolworths/'}
];

function SupermarketComingSoon(){
const [slide,setSlide]=useState(0);
useEffect(()=>{const timer=setInterval(()=>setSlide(s=>(s+1)%SUPERMARKETS.length),4500);return()=>clearInterval(timer)},[]);
const shop=SUPERMARKETS[slide];
return <section className="supermarket-coming-soon" aria-label="Supermarkets coming soon">
<div className="supermarket-section-head"><div><span className="section-eyebrow">COMING SOON</span><h2>Supermarkets</h2><p>More everyday shopping is coming to BG Smart Services.</p></div><div className="supermarket-dots">{SUPERMARKETS.map((s,i)=><button key={s.name} className={i===slide?'is-active':''} onClick={()=>setSlide(i)} aria-label={`Show ${s.name}`}/>)}</div></div>
<div className="supermarket-carousel"><div className="supermarket-card"><div className="supermarket-card-art"><div className="supermarket-brand-visual"><div className="supermarket-brand-word">{shop.name}</div></div><span className="supermarket-badge">COMING SOON</span></div></div><div className="supermarket-card-copy"><span>SUPERMARKET {String(slide+1).padStart(2,'0')}</span><h3>{shop.name}</h3><p>{shop.accent} will be available here in a future BG Smart Services update.</p><div className="supermarket-progress"><i style={{width:`${((slide+1)/5)*100}%`}}></i></div></div></div><div className="supermarket-side-label"><span>EXPANDING BEYOND FAST FOOD</span><strong>More local shopping.<br/>One delivery platform.</strong></div></div>
</section>
}

function StoreCard({store,image}){
  const [brand,location]=store.name.split(' — ');
  const key=brand.toLowerCase().trim().replace(/[’‘]/g,"'");
  const restaurantImage=RESTAURANT_IMAGES[key]||image;
  return <Link href={'/marketplace?retailer='+store.slug} className="food-discovery-card">
    <div className="food-discovery-image">
      {restaurantImage?<img src={restaurantImage} alt={brand} loading="lazy" onError={e=>{if(e.currentTarget.dataset.fallbackApplied)return;e.currentTarget.dataset.fallbackApplied="1";const fallback=RESTAURANT_FALLBACKS[key];if(fallback&&e.currentTarget.src!==fallback)e.currentTarget.src=fallback;else e.currentTarget.style.display="none"}}/>:<div className="food-image-fallback"><Utensils size={30}/></div>}
      <span className="food-time"><Clock3 size={13}/> 30–45 min</span>
      <span className="food-rating"><Star size={12} fill="currentColor"/> 4.8</span>
    </div>
    <div className="food-discovery-info"><div><h3>{brand}</h3><p>{location||store.shopping_location}</p></div><ChevronRight size={18}/></div>
  </Link>
}

export default function Home(){
  const[open,setOpen]=useState(false),[stores,setStores]=useState([]),[foodImages,setFoodImages]=useState({}),[name,setName]=useState('Customer'),[unreadCount,setUnreadCount]=useState(0),[search,setSearch]=useState(''),[searchFocused,setSearchFocused]=useState(false); const searchMatches=search.trim()?stores.filter(s=>`${s.name} ${s.slug||''}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0,5):[];
  useEffect(()=>{let mounted=true;let channel=null;(async()=>{if(!supabase)return;const[{data},auth]=await Promise.all([supabase.from('retailers').select('id,name,slug,marketplace_category,shopping_location').eq('active',true).eq('marketplace_category','fast-food').order('name'),supabase.auth.getUser()]);if(!mounted)return;setStores(data||[]);const ids=(data||[]).map(x=>x.id);if(ids.length){const{data:products}=await supabase.from('retailer_products').select('retailer_id,image_url').in('retailer_id',ids).eq('available',true).not('image_url','is',null).limit(100);const images={};(products||[]).forEach(p=>{if(p.image_url&&!images[p.retailer_id])images[p.retailer_id]=p.image_url});setFoodImages(images)}const u=auth?.data?.user;setName(u?.user_metadata?.name||u?.user_metadata?.full_name?.split(' ')[0]||u?.email?.split('@')[0]||'Customer');if(u){const refreshUnread=async()=>{const{count}=await supabase.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',u.id).is('read_at',null);if(mounted)setUnreadCount(count||0)};await refreshUnread();channel=supabase.channel('home-notifications').on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:'user_id=eq.'+u.id},refreshUnread).subscribe()}})();return()=>{mounted=false;if(channel)supabase.removeChannel(channel)}},[]);
  return <main className="delivery-home">
    <header className="delivery-header"><div className="delivery-header-left"><Link href="/home" className="delivery-logo"><span>BG</span><strong>Smart Services</strong></Link><div className="delivery-address"><MapPin size={16}/><div><small>DELIVER TO</small><strong>Eersterust, Pretoria</strong></div><ChevronRight size={16}/></div></div><div className="delivery-header-actions"><Link href="/account/notifications" className="round-icon" aria-label="Notifications"><Bell size={19}/>{unreadCount>0&&<i/>}</Link><Link href="/account" className="round-icon" aria-label="My account"><UserRound size={19}/></Link><button className="round-icon desktop-more" onClick={()=>setOpen(true)} aria-label="More"><MoreHorizontal size={20}/></button></div></header>
    <section className="delivery-hero modern-food-hero"><div className="modern-hero-glow"></div><div className="delivery-hero-copy"><div className="modern-hero-top"><span className="hero-label">BG SMART SERVICES</span><span className="hero-delivery-badge"><MapPin size={13}/> Eersterust only</span></div><h1>Craving something <em>delicious?</em></h1><p>Local favourites. One simple order. Delivered straight to your door in Eersterust.</p><div className="modern-hero-actions"><Link href="/marketplace" className="hero-cta">Browse restaurants <ArrowRight size={17}/></Link><span className="hero-mini-note"><span>R65</span> delivery</span></div></div><div className="modern-hero-visual"><div className="modern-hero-image"></div><div className="modern-hero-image-shade"></div><div className="modern-food-float"><span className="modern-food-icon"><Utensils size={18}/></span><span><strong>Fast food favourites</strong><small>Ready to order</small></span></div><div className="modern-hero-status"><span className="status-dot"></span><span>Delivering in Eersterust</span></div></div></section>
    <div className="delivery-search-wrap"><form className="delivery-search" onSubmit={e=>{e.preventDefault();const match=searchMatches[0];if(match)window.location.href="/marketplace?retailer="+encodeURIComponent(match.slug);else if(search.trim())window.location.href="/marketplace?search="+encodeURIComponent(search.trim())}}><span className="delivery-search-icon"><Search size={19}/></span><div className="delivery-search-field"><small>FIND YOUR NEXT MEAL</small><input value={search} onFocus={()=>setSearchFocused(true)} onChange={e=>setSearch(e.target.value)} placeholder="Search restaurants or meals" aria-label="Search restaurants or meals"/></div><button type="submit" aria-label="Search"><ArrowRight size={18}/></button></form>{searchFocused&&search.trim()&&<div className="restaurant-search-suggestions">{searchMatches.length?searchMatches.map(store=>{const [brand,location]=store.name.split(' — ');return <Link key={store.id} href={"/marketplace?retailer="+encodeURIComponent(store.slug)} onClick={()=>setSearchFocused(false)} className="restaurant-search-suggestion"><span className="suggestion-thumb">{foodImages[store.id]?<img src={foodImages[store.id]} alt=""/>:<Utensils size={18}/>}</span><span className="suggestion-copy"><strong>{brand}</strong><small>{location||store.shopping_location||'Eersterust'}</small></span><ChevronRight size={17}/></Link>}):<div className="restaurant-search-empty">No restaurant found for “{search}”</div>}</div>}</div>
    <section className="food-categories"><div className="craving-header-new"><div className="craving-title-new"><span>CHOOSE YOUR CRAVING</span><h2>What are you in the mood for?</h2></div><Link href="/marketplace" className="craving-see-all-new">See all <ChevronRight size={15}/></Link></div><div className="category-scroller">{categories.map(([label,image])=><Link href={"/marketplace?craving="+encodeURIComponent(label.toLowerCase())} key={label} className="food-category"><img src={image} alt="" loading="lazy"/><span className="food-category-shade"></span><strong>{label}</strong><ChevronRight size={16}/></Link>)}</div></section>
    <section className="restaurant-discovery"><div className="restaurant-discovery-head"><div><span className="section-eyebrow">AVAILABLE FOR DELIVERY</span><h2>Your local food favourites</h2><p>Choose a restaurant and branch, then we’ll bring your order to Eersterust.</p></div><Link href="/marketplace" className="section-see-all"><span>Explore all</span><ChevronRight size={15}/></Link></div><div className="food-card-scroller">{stores.map(store=><StoreCard key={store.id} store={store} image={foodImages[store.id]}/>)}</div>{!stores.length&&<div className="empty-discovery">Restaurants will appear here when the catalogue is loaded.</div>}</section>



    <SupermarketComingSoon />\n\n    <nav className="delivery-bottom-nav"><Link href="/home" className="active"><House size={19}/><small>Home</small></Link><Link href="/marketplace"><Store size={19}/><small>Browse</small></Link><Link href="/cart"><ShoppingCart size={19}/><small>Cart</small></Link><Link href="/orders"><Package size={19}/><small>Orders</small></Link><button onClick={()=>setOpen(true)}><MoreHorizontal size={19}/><small>More</small></button></nav>
    {open&&<div className="menu-overlay" onClick={()=>setOpen(false)}><aside className="app-menu" onClick={e=>e.stopPropagation()}><div className="menu-head"><div><span className="brand-mark">BG</span><strong>Smart Services</strong></div><button className="icon-button" aria-label="Close menu" onClick={()=>setOpen(false)}><X size={20}/></button></div><nav className="menu-list">{menuItems.map(([Icon,label,href])=><Link href={href} key={label} onClick={()=>setOpen(false)}><Icon size={19}/><span>{label}</span></Link>)}<button className="menu-signout" onClick={async()=>{await supabase.auth.signOut();window.location.href='/'}}><LogOut size={19}/><span>Sign Out</span></button></nav></aside></div>}
    </main>
}