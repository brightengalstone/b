import Link from 'next/link';
import { ArrowRight, MapPin, Search, ShoppingBag, Clock3, Truck, ChevronRight } from 'lucide-react';

export default function Welcome() {
  return (
    <main className="welcome-page">
      <div className="welcome-bg" aria-hidden="true" />
      <section className="welcome-shell">
        <header className="welcome-header">
          <Link href="/" className="welcome-logo" aria-label="BG Smart Services home">
            <span className="welcome-logo-mark">BG</span>
            <span className="welcome-logo-name">SMART SERVICES</span>
          </Link>
          <div className="welcome-location">
            <MapPin size={15} />
            <span>Eersterust</span>
            <ChevronRight size={14} />
          </div>
        </header>

        <div className="welcome-hero">
          <div className="welcome-copy">
            <div className="welcome-pill"><span /> EERSTERUST DELIVERY</div>
            <h1>Your favourites,<br /><span>delivered.</span></h1>
            <p>Food, groceries and everyday essentials from local shops and restaurants — delivered to your door.</p>

            <div className="welcome-search">
              <Search size={19} />
              <span>What are you looking for?</span>
            </div>

            <div className="welcome-actions">
              <Link href="/signin?mode=signup" className="welcome-primary">
                Start ordering <ArrowRight size={18} />
              </Link>
              <Link href="/signin?mode=login" className="welcome-secondary">Sign in</Link>
            </div>

            <div className="welcome-note">
              <Truck size={16} />
              <span><strong>R65 delivery</strong> · Eersterust only</span>
            </div>
          </div>

          <div className="welcome-showcase" aria-hidden="true">
            <div className="showcase-glow" />
            <div className="showcase-card showcase-card-one">
              <div className="fake-food food-red">McDONALD'S</div>
              <strong>McDonald's</strong>
              <small>Fast food · Burgers</small>
            </div>
            <div className="showcase-card showcase-card-two">
              <div className="fake-food food-dark">KFC</div>
              <strong>KFC</strong>
              <small>Chicken · Fast food</small>
            </div>
            <div className="showcase-card showcase-card-three">
              <div className="fake-food food-orange">SHOP</div>
              <strong>Local shopping</strong>
              <small>Groceries · Essentials</small>
            </div>
            <div className="showcase-tuktuk">
              <div className="delivery-badge"><span><Clock3 size={14} /></span><div><strong>On the way</strong><small>Your order is coming</small></div></div>
              <img src="/bg-tuktuk.svg" alt="" />
            </div>
          </div>
        </div>

        <section className="welcome-services" aria-label="How BG Smart Services works">
          <div className="service"><span><Search size={17} /></span><div><strong>Choose what you want</strong><small>Browse local stores and restaurants</small></div></div>
          <div className="service"><span><ShoppingBag size={17} /></span><div><strong>Place your order</strong><small>Simple, secure checkout</small></div></div>
          <div className="service"><span><Truck size={17} /></span><div><strong>We deliver to you</strong><small>Track your order from pickup to door</small></div></div>
        </section>

        <footer className="welcome-footer">
          <span>Built for Eersterust</span><i /><span>Food · Shopping · Delivery</span>
        </footer>
      </section>

      <style>{`
        .welcome-page{min-height:100svh;background:#fff;color:#111815;overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;position:relative}
        .welcome-bg{position:absolute;inset:0;background:radial-gradient(circle at 84% 28%,rgba(27,211,107,.11),transparent 30%),radial-gradient(circle at 12% 80%,rgba(27,211,107,.07),transparent 28%);pointer-events:none}
        .welcome-shell{width:min(1280px,100%);min-height:100svh;margin:auto;padding:22px 38px 18px;position:relative;z-index:1;display:flex;flex-direction:column}
        .welcome-header{display:flex;align-items:center;justify-content:space-between}
        .welcome-logo{display:flex;align-items:center;gap:10px;color:#101712;text-decoration:none}
        .welcome-logo-mark{font-size:31px;font-weight:950;letter-spacing:-3px;color:#18c968;line-height:.8}
        .welcome-logo-name{font-size:11px;font-weight:950;letter-spacing:2px}
        .welcome-location{display:flex;align-items:center;gap:6px;padding:10px 13px;border:1px solid #e1e7e3;border-radius:999px;background:#fff;color:#3d4942;font-size:12px;font-weight:800;box-shadow:0 5px 20px rgba(15,35,23,.05)}
        .welcome-location svg:first-child{color:#16bb60}
        .welcome-hero{flex:1;display:grid;grid-template-columns:minmax(0,.95fr) minmax(430px,1.05fr);align-items:center;gap:55px;padding:48px 0 34px}
        .welcome-copy{max-width:620px;animation:rise .7s ease both}
        .welcome-pill{display:inline-flex;align-items:center;gap:8px;color:#159f50;font-size:10px;font-weight:950;letter-spacing:1.5px}
        .welcome-pill span{width:7px;height:7px;border-radius:50%;background:#18ca68;box-shadow:0 0 0 5px rgba(24,202,104,.1)}
        .welcome-copy h1{font-size:clamp(58px,6.6vw,88px);line-height:.9;letter-spacing:-5px;margin:24px 0 24px;font-weight:950}
        .welcome-copy h1 span{color:#16c766}
        .welcome-copy>p{max-width:550px;color:#5d6962;font-size:16px;line-height:1.65;margin:0}
        .welcome-search{height:56px;max-width:520px;margin-top:27px;border:1px solid #dce3de;border-radius:12px;background:#fff;display:flex;align-items:center;gap:11px;padding:0 17px;color:#8a958e;box-shadow:0 7px 24px rgba(21,47,31,.06)}
        .welcome-search svg{color:#536159}.welcome-search span{font-size:13px;font-weight:650}
        .welcome-actions{display:flex;gap:10px;margin-top:14px}
        .welcome-primary,.welcome-secondary{min-height:52px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;gap:9px;text-decoration:none;font-size:13px;font-weight:900;transition:.2s ease}
        .welcome-primary{padding:0 23px;background:#18c968;color:#fff;box-shadow:0 9px 24px rgba(24,201,104,.22)}
        .welcome-primary:hover{transform:translateY(-2px);background:#12b95c}
        .welcome-secondary{padding:0 22px;border:1px solid #dce3de;color:#202b25;background:#fff}
        .welcome-secondary:hover{transform:translateY(-2px);background:#f7faf8}
        .welcome-note{display:flex;align-items:center;gap:8px;margin-top:18px;color:#68756d;font-size:11px}.welcome-note svg{color:#18bd61}.welcome-note strong{color:#1b2720}
        .welcome-showcase{height:570px;position:relative;display:flex;align-items:center;justify-content:center;animation:show .8s .1s ease both}
        .showcase-glow{position:absolute;width:500px;height:500px;border-radius:50%;background:rgba(24,201,104,.12);filter:blur(55px)}
        .showcase-card{position:absolute;width:190px;padding:9px;background:#fff;border:1px solid #e4e9e5;border-radius:16px;box-shadow:0 18px 45px rgba(17,38,26,.13);z-index:2}
        .showcase-card strong{display:block;font-size:11px;margin:8px 4px 0}.showcase-card small{display:block;color:#8a958e;font-size:8px;margin:3px 4px 2px}
        .fake-food{height:105px;border-radius:11px;display:grid;place-items:center;color:#fff;font-size:19px;font-weight:950;letter-spacing:-1px}
        .food-red{background:linear-gradient(135deg,#c51f19,#ef5a28)}.food-dark{background:linear-gradient(135deg,#171717,#333)}.food-orange{background:linear-gradient(135deg,#e77a16,#f1a53b)}
        .showcase-card-one{left:4%;top:12%;transform:rotate(-8deg);animation:cardOne 5s ease-in-out infinite}
        .showcase-card-two{right:4%;top:22%;transform:rotate(8deg);animation:cardTwo 5s ease-in-out infinite -1.5s}
        .showcase-card-three{left:12%;bottom:9%;transform:rotate(6deg);animation:cardThree 5s ease-in-out infinite -3s}
        .showcase-tuktuk{position:absolute;z-index:4;bottom:3%;width:520px;max-width:90%;filter:drop-shadow(0 25px 20px rgba(0,0,0,.2));animation:tukFloat 4s ease-in-out infinite}
        .showcase-tuktuk img{width:100%;display:block}
        .delivery-badge{position:absolute;right:-30px;top:2px;z-index:5;display:flex;align-items:center;gap:8px;padding:9px 11px;background:#fff;border:1px solid #e4e9e5;border-radius:12px;box-shadow:0 13px 30px rgba(17,38,26,.14);white-space:nowrap}
        .delivery-badge>span{width:28px;height:28px;border-radius:9px;background:#e9f9ef;color:#13b95b;display:grid;place-items:center}.delivery-badge strong{display:block;font-size:9px}.delivery-badge small{display:block;color:#89948d;font-size:7px;margin-top:2px}
        .welcome-services{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;border-top:1px solid #e7ece8;padding-top:20px}
        .service{display:flex;align-items:center;gap:10px;padding:12px 13px;border-radius:12px;background:#f7f9f7}
        .service>span{width:35px;height:35px;border-radius:10px;background:#e5f8ed;color:#14b85b;display:grid;place-items:center;flex:none}
        .service strong{display:block;font-size:10px}.service small{display:block;color:#7c8880;font-size:8px;margin-top:3px}
        .welcome-footer{display:flex;justify-content:center;align-items:center;gap:10px;padding-top:14px;color:#8b968f;font-size:8px;font-weight:750}.welcome-footer i{width:3px;height:3px;border-radius:50%;background:#b8c1bb}
        @keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes show{from{opacity:0;transform:translateX(22px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes cardOne{50%{transform:rotate(-5deg) translateY(-8px)}}@keyframes cardTwo{50%{transform:rotate(5deg) translateY(7px)}}@keyframes cardThree{50%{transform:rotate(9deg) translateY(-6px)}}@keyframes tukFloat{50%{transform:translateY(-7px)}}
        @media(max-width:900px){.welcome-shell{padding:18px 18px 14px}.welcome-hero{grid-template-columns:1fr;gap:20px;padding:45px 0 22px}.welcome-copy{text-align:center;margin:auto}.welcome-pill{justify-content:center}.welcome-copy>p{margin:auto}.welcome-search{margin-left:auto;margin-right:auto;text-align:left}.welcome-actions{justify-content:center}.welcome-note{justify-content:center}.welcome-showcase{height:430px;transform:scale(.88);margin:-15px 0 -30px}.welcome-services{margin-top:5px}.welcome-footer{padding-top:10px}}
        @media(max-width:560px){.welcome-shell{padding:15px 12px 10px}.welcome-logo-name{font-size:8px;letter-spacing:1.3px}.welcome-logo-mark{font-size:27px}.welcome-location{font-size:10px;padding:8px 10px}.welcome-hero{padding-top:32px}.welcome-copy h1{font-size:48px;letter-spacing:-3.5px;line-height:.93}.welcome-copy>p{font-size:13px;line-height:1.55}.welcome-search{height:51px;margin-top:22px}.welcome-actions{display:grid;grid-template-columns:1.3fr 1fr}.welcome-primary,.welcome-secondary{min-height:49px;font-size:11px;padding:0 10px}.welcome-showcase{height:350px;transform:scale(.68);margin:-40px 0 -75px}.showcase-card{width:190px}.welcome-services{grid-template-columns:1fr;gap:6px}.service{padding:9px}.welcome-footer{font-size:7px}}
      `}</style>
    </main>
  );
}
