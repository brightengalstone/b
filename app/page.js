import Link from 'next/link';
import { ArrowRight, MapPin, Search, ShoppingBag, Clock3, Truck, ChevronRight } from 'lucide-react';

export default function Welcome() {
  return (
    <main className="welcome-page">
      <div className="welcome-orb welcome-orb-one" aria-hidden="true" />
      <div className="welcome-orb welcome-orb-two" aria-hidden="true" />

      <section className="welcome-screen">
        <header className="welcome-header">
          <Link href="/" className="welcome-brand" aria-label="BG Smart Services">
            <span className="welcome-brand-mark">BG</span>
            <span className="welcome-brand-name">SMART SERVICES</span>
          </Link>
          <span className="welcome-status"><span /> EERSTERUST</span>
        </header>

        <div className="welcome-center">
          <div className="welcome-intro">
            <span className="welcome-line" />
            <span>WELCOME</span>
            <span className="welcome-line" />
          </div>

          <div className="welcome-brand-hero">
            <span>BG</span>
            <strong>SMART SERVICES</strong>
          </div>

          <p className="welcome-tagline">Built for Poort. Made for you.</p>

          <div className="welcome-divider" />

          <h1>Welcome to<br /><span>BG Smart Services</span></h1>

          <p className="welcome-local">
            <MapPin size={17} strokeWidth={2.2} />
            Proudly serving Eersterust aka Poort
          </p>

          <div className="welcome-actions">
            <Link href="/home" className="welcome-enter">
              ENTER BG SMART SERVICES
              <ArrowRight size={19} />
            </Link>
            <Link href="/signin" className="welcome-signin">
              Already a member? <span>Sign in</span>
            </Link>
            <Link href="/signup" className="welcome-create-account">
              Create an account
            </Link>
          </div>
        </div>

        <footer className="welcome-footer">
          <span>LOCAL</span>
          <i />
          <span>CONVENIENT</span>
          <i />
          <span>MADE FOR POORT</span>
        </footer>
      </section>

      <style>{`
        .welcome-page{min-height:100svh;background:#f8faf8;color:#101713;overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;position:relative}
        .welcome-page:before{content:"";position:absolute;inset:0;background:linear-gradient(145deg,#f8faf8 0%,#ffffff 48%,#eef8f2 100%);z-index:0}
        .welcome-page:after{content:"";position:absolute;width:72vw;height:72vw;max-width:900px;max-height:900px;border:1px solid rgba(20,195,96,.10);border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 110px rgba(20,195,96,.025),0 0 0 220px rgba(20,195,96,.018);pointer-events:none}
        .welcome-orb{position:absolute;border-radius:50%;filter:blur(2px);pointer-events:none}
        .welcome-orb-one{width:280px;height:280px;right:-110px;top:-100px;background:rgba(24,201,104,.12)}
        .welcome-orb-two{width:230px;height:230px;left:-120px;bottom:-80px;background:rgba(24,201,104,.08)}
        .welcome-screen{position:relative;z-index:2;width:min(1180px,100%);min-height:100svh;margin:auto;padding:28px 38px 22px;display:flex;flex-direction:column}
        .welcome-header{display:flex;align-items:center;justify-content:space-between;animation:fadeDown .7s ease both}
        .welcome-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#101713}
        .welcome-brand-mark{font-size:32px;line-height:.8;font-weight:950;letter-spacing:-3.5px;color:#18c968}
        .welcome-brand-name{font-size:10px;letter-spacing:2.2px;font-weight:950}
        .welcome-status{display:flex;align-items:center;gap:8px;font-size:9px;font-weight:900;letter-spacing:1.5px;color:#66736b}
        .welcome-status span{width:7px;height:7px;border-radius:50%;background:#19c968;box-shadow:0 0 0 5px rgba(25,201,104,.10)}
        .welcome-center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:35px 0}
        .welcome-intro{display:flex;align-items:center;gap:12px;color:#7b877f;font-size:9px;font-weight:950;letter-spacing:3px;animation:reveal .8s .1s ease both}
        .welcome-line{width:34px;height:1px;background:#ccd5cf}
        .welcome-brand-hero{margin-top:30px;display:flex;flex-direction:column;align-items:center;animation:logoReveal 1s .25s cubic-bezier(.2,.8,.2,1) both}
        .welcome-brand-hero span{font-size:clamp(76px,11vw,132px);font-weight:1000;line-height:.72;letter-spacing:-10px;color:#18c968}
        .welcome-brand-hero strong{font-size:clamp(12px,1.5vw,18px);letter-spacing:6px;font-weight:950;margin-top:17px}
        .welcome-tagline{font-size:clamp(15px,1.8vw,20px);font-weight:700;letter-spacing:.2px;color:#445149;margin:34px 0 0;animation:rise .8s .65s ease both}
        .welcome-divider{width:1px;height:42px;background:#d4ddd7;margin:24px 0;animation:grow .7s 1s ease both}
        .welcome-center h1{font-size:clamp(38px,5.2vw,70px);line-height:1.02;letter-spacing:-3.5px;margin:0;font-weight:950;animation:rise .8s 1.05s ease both}
        .welcome-center h1 span{color:#18c968}
        .welcome-local{display:flex;align-items:center;justify-content:center;gap:8px;color:#56635b;font-size:13px;font-weight:700;margin:20px 0 0;animation:rise .8s 1.2s ease both}
        .welcome-local svg{color:#18bd61}
        .welcome-actions{display:flex;flex-direction:column;align-items:center;margin-top:31px;animation:rise .8s 1.35s ease both}
        .welcome-enter{min-height:56px;padding:0 27px;border-radius:12px;background:#18c968;color:#fff;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:13px;font-size:11px;font-weight:950;letter-spacing:1.1px;box-shadow:0 15px 35px rgba(24,201,104,.24);transition:transform .2s ease,box-shadow .2s ease,background .2s ease}
        .welcome-enter:hover{transform:translateY(-3px);background:#11b85b;box-shadow:0 19px 40px rgba(24,201,104,.28)}
        .welcome-signin{margin-top:17px;color:#77837b;text-decoration:none;font-size:11px;font-weight:650}
        .welcome-signin span{color:#121b16;font-weight:900;margin-left:3px;text-decoration:underline;text-underline-offset:3px}
        .welcome-create-account{margin-top:12px;color:#18b85e;text-decoration:none;font-size:11px;font-weight:900;letter-spacing:.1px;padding:7px 10px;border-radius:8px;transition:background .2s ease,transform .2s ease}
        .welcome-create-account:hover{background:rgba(24,201,104,.08);transform:translateY(-1px)}
        .welcome-footer{display:flex;justify-content:center;align-items:center;gap:11px;color:#9aa49e;font-size:8px;font-weight:900;letter-spacing:1.5px;animation:fadeUp .8s 1.45s ease both}
        .welcome-footer i{width:3px;height:3px;border-radius:50%;background:#b8c2bb}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes reveal{from{opacity:0;letter-spacing:0}to{opacity:1;letter-spacing:3px}}
        @keyframes logoReveal{from{opacity:0;transform:scale(.72) translateY(18px);filter:blur(9px)}to{opacity:1;transform:none;filter:none}}
        @keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        @keyframes grow{from{opacity:0;transform:scaleY(0)}to{opacity:1;transform:scaleY(1)}}
        @media(max-width:600px){
          .welcome-screen{padding:20px 18px 17px}
          .welcome-brand-mark{font-size:28px}.welcome-brand-name{font-size:8px;letter-spacing:1.6px}
          .welcome-status{font-size:8px;letter-spacing:1px}
          .welcome-center{padding:25px 0}
          .welcome-intro{font-size:8px;letter-spacing:2.4px}
          .welcome-brand-hero{margin-top:25px}
          .welcome-brand-hero span{font-size:86px;letter-spacing:-7px}
          .welcome-brand-hero strong{font-size:11px;letter-spacing:4px;margin-top:14px}
          .welcome-tagline{font-size:15px;margin-top:27px}
          .welcome-divider{height:34px;margin:20px 0}
          .welcome-center h1{font-size:40px;letter-spacing:-2.5px}
          .welcome-local{font-size:11px;margin-top:17px}
          .welcome-enter{width:100%;max-width:330px;min-height:54px;font-size:10px}
          .welcome-signin{font-size:10px}
          .welcome-footer{font-size:7px;gap:8px;letter-spacing:1px}
          .welcome-page:after{width:125vw;height:125vw}
        }
        @media(prefers-reduced-motion:reduce){.welcome-header,.welcome-intro,.welcome-brand-hero,.welcome-tagline,.welcome-divider,.welcome-center h1,.welcome-local,.welcome-actions,.welcome-footer{animation:none!important}}
      `}</style>
    </main>
  );
}
