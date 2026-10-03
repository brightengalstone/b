import Link from 'next/link';
import { ArrowLeft, ClipboardList, Store } from 'lucide-react';

export default function RestaurantDashboardPage() {
  return (
    <main style={{minHeight:'100svh',background:'#f8faf8',color:'#101713',fontFamily:'Inter,ui-sans-serif,system-ui,-apple-system,sans-serif'}}>
      <div style={{width:'min(1100px,100%)',margin:'auto',padding:'28px 22px'}}>
        <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #e1e9e3',paddingBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:11}}>
            <span style={{fontSize:31,fontWeight:950,letterSpacing:'-3px',color:'#18c968'}}>BG</span>
            <div><strong style={{display:'block'}}>BG Smart Services</strong><span style={{fontSize:9,color:'#78847d',letterSpacing:'1.4px',fontWeight:800}}>RESTAURANT PORTAL</span></div>
          </div>
          <Link href="/home" style={{display:'inline-flex',alignItems:'center',gap:7,textDecoration:'none',color:'#26332b',fontSize:11,fontWeight:850}}><ArrowLeft size={16}/> Customer Experience</Link>
        </header>
        <section style={{padding:'70px 10px',textAlign:'center'}}>
          <div style={{width:62,height:62,borderRadius:18,background:'#e9faef',color:'#18bd61',display:'grid',placeItems:'center',margin:'0 auto 18px'}}><Store size={28}/></div>
          <span style={{fontSize:9,letterSpacing:'1.8px',fontWeight:950,color:'#18b85e'}}>RESTAURANT PARTNER</span>
          <h1 style={{fontSize:'clamp(36px,6vw,60px)',letterSpacing:'-3px',margin:'10px 0'}}>Restaurant Dashboard</h1>
          <p style={{color:'#68756d',maxWidth:520,margin:'0 auto 28px',lineHeight:1.6}}>Your restaurant workspace is ready for partner features such as incoming orders, order status updates and store management.</p>
          <div style={{display:'inline-flex',alignItems:'center',gap:9,padding:'13px 17px',border:'1px solid #dce5df',borderRadius:12,background:'#fff',fontSize:11,fontWeight:850}}><ClipboardList size={17} color="#18c968"/> Orders workspace coming next</div>
        </section>
      </div>
    </main>
  );
}
