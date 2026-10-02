import Link from 'next/link';
import {ArrowRight, MapPin, ShoppingBag, Truck, Clock3, ChevronRight} from 'lucide-react';

export default function Welcome() {
  return (
    <main className="welcome-page">
      <div className="welcome-orb welcome-orb-one" aria-hidden="true" />
      <div className="welcome-orb welcome-orb-two" aria-hidden="true" />
      <div className="welcome-noise" aria-hidden="true" />

      <section className="welcome-shell">
        <header className="welcome-header">
          <Link href="/" className="welcome-logo" aria-label="BG Smart Services home">
            <span className="welcome-logo-mark">BG</span>
            <span className="welcome-logo-name">SMART SERVICES</span>
          </Link>
          <div className="welcome-location">
            <MapPin size={15} />
            <span>Eersterust</span>
          </div>
        </header>

        <div className="welcome-main">
          <div className="welcome-drive-layer" aria-hidden="true"><img src="/bg-tuktuk.svg" alt="" className="welcome-drive-tuktuk" /></div>
          <div className="welcome-copy">
            <div className="welcome-eyebrow">
              <span className="welcome-live-dot" />
              LOCAL DELIVERY, MADE SIMPLE
            </div>

            <h1>
              Everything you want,
              <span>delivered to your door.</span>
            </h1>

            <p className="welcome-description">
              Shop your favourite restaurants and local stores in Eersterust, all in one place.
              We collect your order and bring it straight to you.
            </p>

            <div className="welcome-actions">
              <Link href="/signin" className="welcome-primary">
                Start ordering
                <ArrowRight size={19} />
              </Link>
              <Link href="/signin" className="welcome-secondary">
                Sign in
              </Link>
            </div>

            <div className="welcome-trust">
              <div className="welcome-trust-item">
                <span><Truck size={17} /></span>
                <div><strong>R65 delivery</strong><small>Simple, clear pricing</small></div>
              </div>
              <div className="welcome-trust-item">
                <span><Clock3 size={17} /></span>
                <div><strong>Live order tracking</strong><small>Follow your delivery</small></div>
              </div>
              <div className="welcome-trust-item">
                <span><ShoppingBag size={17} /></span>
                <div><strong>Local favourites</strong><small>Restaurants & stores</small></div>
              </div>
            </div>
          </div>

          <div className="welcome-visual" aria-hidden="true">
            <div className="road-glow" />
            <div className="welcome-tuktuk-scene">
              <div className="tuktuk-message">YOUR ORDER IS ON THE WAY</div>
              <img src="/bg-tuktuk.svg" alt="" className="welcome-tuktuk" />
              <div className="tuktuk-shadow" />
              <span className="tuktuk-light light-one" />
              <span className="tuktuk-light light-two" />
            </div>
            <div className="welcome-route-line"><span /><i /><b /><em /></div>
            <div className="welcome-float welcome-float-one">
              <span className="welcome-float-icon"><MapPin size={16} /></span>
              <div><strong>Eersterust only</strong><small>Delivered locally</small></div>
            </div>
            <div className="welcome-float welcome-float-two">
              <span className="welcome-check">✓</span>
              <div><strong>Order confirmed</strong><small>Your driver is on the way</small></div>
            </div>
          </div>
        </div>

        <footer className="welcome-footer">
          <span>Built for Eersterust</span>
          <i />
          <span>Food, shopping & local delivery</span>
          <i />
          <span>Simple pricing</span>
        </footer>
      </section>

      <style>{`

        .welcome-tuktuk-scene{width:100%;height:520px;position:relative;display:flex;align-items:center;justify-content:center;overflow:visible}
        .welcome-tuktuk{width:min(720px,100%);position:relative;z-index:3;filter:drop-shadow(0 28px 25px rgba(0,0,0,.42));animation:tuktukDrive 7s cubic-bezier(.55,.05,.25,1) infinite}
        .tuktuk-shadow{position:absolute;width:70%;height:35px;bottom:96px;border-radius:50%;background:rgba(0,0,0,.55);filter:blur(16px);z-index:1;animation:tuktukShadow 7s ease-in-out infinite}
        .road-glow{position:absolute;width:900px;height:260px;bottom:35px;background:radial-gradient(ellipse,rgba(28,216,110,.18),transparent 67%);filter:blur(12px)}
        .welcome-route-line{position:absolute;bottom:77px;left:8%;right:8%;height:2px;background:linear-gradient(90deg,transparent,#1bd36b 15%,#1bd36b 85%,transparent);opacity:.35}
        .welcome-route-line span,.welcome-route-line i,.welcome-route-line b,.welcome-route-line em{position:absolute;width:8px;height:8px;border-radius:50%;background:#20d970;top:-3px;box-shadow:0 0 16px rgba(32,217,112,.8)}
        .welcome-route-line span{left:12%}.welcome-route-line i{left:39%}.welcome-route-line b{left:67%}.welcome-route-line em{right:5%}
        .tuktuk-message{position:absolute;top:40px;left:50%;transform:translateX(-50%);z-index:4;color:#8fbca1;font-size:10px;font-weight:950;letter-spacing:2px;white-space:nowrap;animation:messagePulse 2.4s ease-in-out infinite}
        .tuktuk-light{position:absolute;z-index:4;width:180px;height:70px;border-radius:50%;filter:blur(18px);background:rgba(38,223,117,.15);top:235px;animation:lightPulse 1.8s ease-in-out infinite}
        .light-one{left:9%}.light-two{right:9%;animation-delay:-.9s}
        .welcome-float{position:absolute;z-index:5;display:flex;align-items:center;gap:9px;padding:11px 13px;border-radius:15px;border:1px solid rgba(192,230,205,.17);background:rgba(13,28,19,.86);backdrop-filter:blur(18px);box-shadow:0 18px 40px rgba(0,0,0,.28);animation:welcomeFloat 4s ease-in-out infinite}
        .welcome-float strong{display:block;font-size:10px}.welcome-float small{display:block;color:#789082;font-size:8px;margin-top:2px}
        .welcome-float-icon,.welcome-check{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:rgba(27,211,107,.12);color:#26db74}
        .welcome-check{font-size:17px;font-weight:950}.welcome-float-one{left:0;top:30%}.welcome-float-two{right:-10px;bottom:22%;animation-delay:-1.6s}
        @keyframes tuktukDrive{0%,8%{transform:translateX(-115%);opacity:0}18%{opacity:1}45%{transform:translateX(0) scale(1);opacity:1}70%{transform:translateX(8%) scale(1.02);opacity:1}92%{transform:translateX(120%);opacity:0}100%{transform:translateX(120%);opacity:0}}
        @keyframes tuktukShadow{0%,10%,90%,100%{transform:scaleX(.65);opacity:.2}45%,70%{transform:scaleX(1);opacity:.6}}
        @keyframes messagePulse{50%{opacity:.5;letter-spacing:2.5px}}
        @keyframes lightPulse{50%{opacity:.8;transform:scaleX(1.15)}}
        @media(max-width:900px){.welcome-visual{height:475px;transform:scale(.82);margin-top:-20px;margin-bottom:-25px}.welcome-tuktuk-scene{height:430px}.tuktuk-message{top:18px}.welcome-float-one{left:-8px}.welcome-float-two{right:-8px}}
        @media(max-width:560px){.welcome-visual{height:410px;transform:scale(.7);margin-top:-35px;margin-bottom:-55px}.welcome-tuktuk-scene{height:370px}.tuktuk-message{font-size:8px}.welcome-float-one{left:-15px}.welcome-float-two{right:-15px}}

        .welcome-drive-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
        .welcome-drive-tuktuk{position:absolute;width:min(590px,52vw);left:-650px;top:61%;filter:drop-shadow(0 25px 24px rgba(0,0,0,.48));animation:driveAcross 9s linear infinite;will-change:transform}
        @keyframes driveAcross{0%{transform:translate3d(-5vw,-50%,0) scale(.72);opacity:0}8%{opacity:1}28%{transform:translate3d(24vw,-50%,0) scale(.78);opacity:1}50%{transform:translate3d(52vw,-50%,0) scale(.86);opacity:1}72%{transform:translate3d(80vw,-50%,0) scale(.96);opacity:1}92%{transform:translate3d(118vw,-50%,0) scale(1.06);opacity:0}100%{transform:translate3d(125vw,-50%,0) scale(1.08);opacity:0}}
        .welcome-drive-layer:after{content:"";position:absolute;left:0;right:0;top:61%;height:120px;transform:translateY(-20%);background:radial-gradient(ellipse at center,rgba(27,211,107,.12),transparent 68%);filter:blur(18px)}
        @media(max-width:900px){.welcome-drive-tuktuk{width:520px;top:58%;animation-duration:8s}}
        @media(max-width:560px){.welcome-drive-tuktuk{width:430px;top:57%;animation-duration:7s}.welcome-drive-layer{z-index:6}}
        .welcome-page{min-height:100svh;background:#07110c;color:#f6faf7;overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;position:relative}
        .welcome-page:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 18%,rgba(24,207,104,.12),transparent 32%),radial-gradient(circle at 82% 70%,rgba(24,207,104,.08),transparent 30%),linear-gradient(135deg,#07110c 0%,#0a1710 52%,#06100b 100%)}
        .welcome-noise{position:absolute;inset:0;opacity:.04;background-image:linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(circle at center,#000,transparent 78%)}
        .welcome-orb{position:absolute;border-radius:50%;filter:blur(75px);pointer-events:none}
        .welcome-orb-one{width:440px;height:440px;left:-180px;top:30%;background:rgba(17,190,91,.12)}
        .welcome-orb-two{width:520px;height:520px;right:-250px;top:10%;background:rgba(21,213,108,.09)}
        .welcome-shell{width:min(1240px,100%);min-height:100svh;margin:auto;padding:24px 34px 18px;position:relative;z-index:1;display:flex;flex-direction:column}
        .welcome-header{display:flex;align-items:center;justify-content:space-between}
        .welcome-logo{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none}
        .welcome-logo-mark{font-size:31px;font-weight:950;letter-spacing:-3px;color:#19d36c;line-height:.8}
        .welcome-logo-name{font-size:11px;font-weight:950;letter-spacing:2px;color:#b6c9bd}
        .welcome-location{display:flex;align-items:center;gap:7px;padding:9px 13px;border:1px solid rgba(184,224,199,.15);background:rgba(255,255,255,.035);border-radius:999px;color:#b8cbc0;font-size:12px;font-weight:800}
        .welcome-location svg{color:#20d570}
        .welcome-main{flex:1;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(430px,.98fr);align-items:center;gap:40px;padding:35px 0 25px}
        .welcome-copy{max-width:660px;animation:welcomeRise .75s ease both}
        .welcome-eyebrow{display:flex;align-items:center;gap:9px;color:#8fbca1;font-size:10px;font-weight:950;letter-spacing:1.65px}
        .welcome-live-dot{width:7px;height:7px;border-radius:50%;background:#1bd36b;box-shadow:0 0 18px rgba(27,211,107,.85);animation:welcomePulse 2s infinite}
        .welcome-copy h1{font-size:clamp(54px,6.3vw,86px);line-height:.91;letter-spacing:-5px;margin:27px 0 24px;max-width:700px}
        .welcome-copy h1 span{display:block;color:#20d56f}
        .welcome-description{max-width:570px;color:#a9bdb1;font-size:16px;line-height:1.7;margin:0}
        .welcome-actions{display:flex;gap:11px;margin-top:30px}
        .welcome-primary,.welcome-secondary{min-height:54px;border-radius:15px;display:inline-flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;font-weight:950;transition:transform .2s ease,box-shadow .2s ease,background .2s ease}
        .welcome-primary{padding:0 24px;background:#1bd36b;color:#06130c;box-shadow:0 15px 35px rgba(27,211,107,.2)}
        .welcome-primary:hover{transform:translateY(-2px);background:#27df77;box-shadow:0 19px 42px rgba(27,211,107,.28)}
        .welcome-secondary{padding:0 23px;color:#e4eee8;background:rgba(255,255,255,.045);border:1px solid rgba(185,221,198,.2)}
        .welcome-secondary:hover{transform:translateY(-2px);background:rgba(255,255,255,.08)}
        .welcome-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:35px;max-width:650px}
        .welcome-trust-item{display:flex;gap:9px;align-items:center;min-width:0}
        .welcome-trust-item>span{width:35px;height:35px;border-radius:11px;display:grid;place-items:center;flex:none;background:rgba(27,211,107,.1);border:1px solid rgba(27,211,107,.12);color:#28db76}
        .welcome-trust-item div{display:grid;gap:2px}
        .welcome-trust-item strong{font-size:11px;white-space:nowrap}
        .welcome-trust-item small{font-size:9px;color:#71877a;white-space:nowrap}
        .welcome-visual{height:610px;position:relative;display:grid;place-items:center;animation:welcomeVisual .9s .08s ease both}
        .welcome-phone{width:315px;height:600px;border:8px solid #17251d;border-radius:42px;background:#f7faf8;box-shadow:0 45px 90px rgba(0,0,0,.48),0 0 0 1px rgba(255,255,255,.08);overflow:hidden;position:relative;z-index:3;transform:rotate(2deg)}
        .welcome-phone:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 45px rgba(0,0,0,.08)}
        .welcome-phone-top{height:30px;background:#f7faf8;display:grid;place-items:center}
        .welcome-phone-notch{width:105px;height:23px;border-radius:0 0 15px 15px;background:#101713}
        .welcome-phone-content{padding:14px 15px;color:#17231c}
        .phone-mini-header{display:flex;align-items:center;justify-content:space-between}
        .phone-mini-header div{display:grid;gap:2px}
        .phone-mini-header small{font-size:8px;color:#84928a}
        .phone-mini-header strong{font-size:12px}
        .phone-avatar{width:30px;height:30px;border-radius:10px;background:#122118;color:#1ddd70;display:grid;place-items:center;font-size:9px;font-weight:950}
        .phone-search{height:36px;border-radius:11px;background:#edf2ee;margin-top:14px;display:flex;align-items:center;gap:7px;padding:0 11px;color:#8a978f;font-size:9px;font-weight:650}
        .phone-search-icon{font-size:18px;line-height:0;color:#59675f}
        .phone-hero{height:138px;border-radius:18px;background:linear-gradient(135deg,#10291b,#17452b);color:#fff;margin-top:12px;padding:16px;display:flex;justify-content:space-between;overflow:hidden;position:relative}
        .phone-hero:after{content:"";position:absolute;width:120px;height:120px;border-radius:50%;right:-40px;bottom:-45px;background:rgba(42,222,119,.18)}
        .phone-hero div:first-child{display:grid;align-content:start;gap:6px;position:relative;z-index:1}
        .phone-hero small{font-size:6px;letter-spacing:1px;color:#7ee4a6;font-weight:950}
        .phone-hero strong{font-size:19px;line-height:1.05;letter-spacing:-.7px}
        .phone-hero span{font-size:8px;color:#b4cabe;margin-top:2px}
        .phone-hero-circle{width:49px;height:49px;border-radius:50%;background:#1bd36b;color:#092014;display:grid;place-items:center;align-self:center;position:relative;z-index:1;box-shadow:0 10px 25px rgba(27,211,107,.2)}
        .phone-section-title{display:flex;align-items:center;justify-content:space-between;margin:18px 1px 10px}
        .phone-section-title strong{font-size:12px}
        .phone-section-title span{display:flex;align-items:center;color:#1b9e58;font-size:8px;font-weight:800}
        .phone-restaurant-row{display:grid;grid-template-columns:1fr 1fr;gap:9px}
        .phone-food-card{border:1px solid #e4eae5;border-radius:13px;padding:7px;box-shadow:0 5px 12px rgba(20,40,28,.05)}
        .phone-food-image{height:83px;border-radius:9px;display:grid;place-items:center;color:#fff;font-weight:950;font-size:13px;letter-spacing:-.5px}
        .food-one{background:linear-gradient(135deg,#c91f19,#ef4c26)}
        .food-two{background:linear-gradient(135deg,#a80c0c,#e5281c)}
        .phone-food-card>strong{font-size:9px;display:block;margin-top:7px}
        .phone-food-card>small{font-size:7px;color:#87928b;display:block;margin-top:2px}
        .welcome-card-back{position:absolute;border-radius:34px;background:rgba(20,46,31,.68);border:1px solid rgba(172,225,190,.12);box-shadow:0 30px 80px rgba(0,0,0,.2)}
        .welcome-card-back-one{width:310px;height:520px;transform:rotate(-11deg) translate(-90px,12px);opacity:.7}
        .welcome-card-back-two{width:295px;height:540px;transform:rotate(13deg) translate(100px,18px);opacity:.45}
        .welcome-float{position:absolute;z-index:5;display:flex;align-items:center;gap:9px;padding:11px 13px;border-radius:15px;border:1px solid rgba(192,230,205,.17);background:rgba(13,28,19,.86);backdrop-filter:blur(18px);box-shadow:0 18px 40px rgba(0,0,0,.28);animation:welcomeFloat 4s ease-in-out infinite}
        .welcome-float strong{display:block;font-size:10px}
        .welcome-float small{display:block;color:#789082;font-size:8px;margin-top:2px}
        .welcome-float-icon,.welcome-check{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:rgba(27,211,107,.12);color:#26db74}
        .welcome-check{font-size:17px;font-weight:950}
        .welcome-float-one{left:0;top:30%}
        .welcome-float-two{right:-10px;bottom:22%;animation-delay:-1.6s}
        .welcome-footer{display:flex;align-items:center;justify-content:center;gap:12px;color:#62766a;font-size:9px;font-weight:800;letter-spacing:.4px;padding-top:8px}
        .welcome-footer i{width:3px;height:3px;border-radius:50%;background:#31543f}
        @keyframes welcomeRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes welcomeVisual{from{opacity:0;transform:translateX(24px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes welcomePulse{50%{box-shadow:0 0 0 6px rgba(27,211,107,.04),0 0 18px rgba(27,211,107,.8)}}
        @keyframes welcomeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @media(max-width:900px){
          .welcome-shell{padding:18px 18px 14px}
          .welcome-main{grid-template-columns:1fr;gap:15px;padding-top:42px}
          .welcome-copy{text-align:center;margin:auto}
          .welcome-eyebrow{justify-content:center}
          .welcome-copy h1{font-size:clamp(50px,10vw,72px);margin-top:23px}
          .welcome-description{margin:auto}
          .welcome-actions{justify-content:center}
          .welcome-trust{margin-left:auto;margin-right:auto}
          .welcome-visual{height:475px;transform:scale(.82);margin-top:-45px;margin-bottom:-55px}
          .welcome-footer{padding-top:0}
        }
        @media(max-width:560px){
          .welcome-shell{padding:16px 12px 12px}
          .welcome-location{padding:8px 10px;font-size:10px}
          .welcome-logo-name{font-size:9px;letter-spacing:1.4px}
          .welcome-logo-mark{font-size:27px}
          .welcome-main{padding-top:30px}
          .welcome-copy h1{font-size:47px;letter-spacing:-3.3px;line-height:.94}
          .welcome-description{font-size:13px;line-height:1.6;max-width:350px}
          .welcome-actions{display:grid;grid-template-columns:1.35fr 1fr;gap:8px}
          .welcome-primary,.welcome-secondary{min-height:50px;padding:0 12px;font-size:12px}
          .welcome-trust{grid-template-columns:1fr;max-width:330px;margin-top:24px;text-align:left}
          .welcome-trust-item{padding:8px 0}
          .welcome-visual{height:410px;transform:scale(.67);margin-top:-62px;margin-bottom:-90px}
          .welcome-float-one{left:-10px}
          .welcome-float-two{right:-15px}
          .welcome-footer{font-size:7px;gap:7px;white-space:nowrap}
        }
      `}</style>
    </main>
  );
}
