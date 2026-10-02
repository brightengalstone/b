import Link from 'next/link';
import {ArrowRight, CheckCircle2, MapPin, Truck} from 'lucide-react';

export default function Welcome() {
  return (
    <main className="landing-page">
      <div className="landing-grid" aria-hidden="true" />
      <div className="landing-glow landing-glow-one" aria-hidden="true" />
      <div className="landing-glow landing-glow-two" aria-hidden="true" />

      <section className="landing-hero">
        <div className="landing-panel">
          <div className="landing-kicker">
            <span className="landing-kicker-dot" />
            EERSTERUST • LOCAL FOOD DELIVERY
          </div>

          <h1>
            <span>Craving something</span>
            delicious?
          </h1>

          <p className="landing-lead">
            Order from local restaurants and fast-food favourites, then have your meal delivered anywhere in Eersterust.
          </p>

          <div className="landing-actions">
            <Link className="landing-primary" href="/home">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link className="landing-secondary" href="/signin">Sign in</Link>
          </div>

          <div className="landing-features">
            <div>
              <span className="landing-feature-icon"><MapPin size={17} /></span>
              <span><strong>Eersterust only</strong><small>Local delivery</small></span>
            </div>
            <div>
              <span className="landing-feature-icon"><Truck size={17} /></span>
              <span><strong>R65 delivery</strong><small>Simple pricing</small></span>
            </div>
            <div>
              <span className="landing-feature-icon"><CheckCircle2 size={17} /></span>
              <span><strong>Track your order</strong><small>From restaurant to door</small></span>
            </div>
          </div>

          <div className="landing-brand">
            <span className="landing-brand-mark">BG</span>
            <span>SMART SERVICES</span>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page{min-height:100svh;background:#07120d;color:#fff;position:relative;overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .landing-grid{position:absolute;inset:0;opacity:.08;background-image:linear-gradient(rgba(255,255,255,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.14) 1px,transparent 1px);background-size:70px 70px;mask-image:radial-gradient(circle at center,#000 0%,transparent 75%)}
        .landing-glow{position:absolute;border-radius:50%;pointer-events:none}
        .landing-glow-one{width:620px;height:620px;left:50%;top:50%;transform:translate(-50%,-58%);background:rgba(18,201,96,.13);filter:blur(70px)}
        .landing-glow-two{width:360px;height:360px;right:-150px;bottom:-130px;background:rgba(18,201,96,.08);filter:blur(50px)}
        .landing-hero{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:28px 18px;position:relative;z-index:1}
        .landing-panel{width:min(100%,760px);padding:clamp(34px,6vw,68px) clamp(22px,6vw,70px);border:1px solid rgba(167,225,190,.16);border-radius:34px;background:linear-gradient(145deg,rgba(20,39,29,.88),rgba(7,20,13,.82));box-shadow:0 35px 100px rgba(0,0,0,.35),inset 0 1px rgba(255,255,255,.06);backdrop-filter:blur(20px);text-align:center;animation:landingEnter .65s ease both}
        .landing-kicker{display:flex;align-items:center;justify-content:center;gap:9px;color:#91cbaa;font-size:10px;font-weight:900;letter-spacing:1.6px}
        .landing-kicker-dot{width:7px;height:7px;border-radius:50%;background:#18cf68;box-shadow:0 0 16px rgba(24,207,104,.8)}
        .landing-panel h1{font-size:clamp(58px,9vw,92px);line-height:.88;letter-spacing:-5px;text-transform:uppercase;margin:38px 0 25px}
        .landing-panel h1 span{display:block;font-family:cursive;text-transform:none;font-size:clamp(31px,4.5vw,48px);font-weight:500;letter-spacing:0;color:#c7e8d5;line-height:1.05;margin-bottom:10px}
        .landing-lead{max-width:590px;margin:0 auto;color:#b6c9be;font-size:16px;line-height:1.7}
        .landing-actions{display:flex;justify-content:center;gap:12px;margin-top:32px}
        .landing-primary,.landing-secondary{min-height:54px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;gap:10px;font-weight:900;transition:transform .2s ease,box-shadow .2s ease,background .2s ease}
        .landing-primary{background:#18c966;color:#06130d;padding:0 25px;box-shadow:0 14px 35px rgba(24,201,102,.22)}
        .landing-primary:hover{transform:translateY(-2px);background:#21dc73;box-shadow:0 18px 42px rgba(24,201,102,.3)}
        .landing-secondary{padding:0 24px;border:1px solid rgba(190,225,204,.22);background:rgba(255,255,255,.045);color:#e0eee6}
        .landing-secondary:hover{transform:translateY(-2px);background:rgba(255,255,255,.08)}
        .landing-features{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:34px auto 0;max-width:620px;text-align:left}
        .landing-features>div{display:flex;align-items:center;gap:9px;padding:12px;border-radius:15px;border:1px solid rgba(171,222,190,.13);background:rgba(255,255,255,.035)}
        .landing-feature-icon{width:32px;height:32px;display:grid;place-items:center;flex:none;border-radius:10px;background:rgba(24,201,102,.12);color:#29d875}
        .landing-features span:last-child{display:grid;gap:2px;min-width:0}
        .landing-features strong{font-size:11px;white-space:nowrap}
        .landing-features small{font-size:9px;color:#82998d;white-space:nowrap}
        .landing-brand{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:32px;color:#9ab6a7;font-size:11px;font-weight:900;letter-spacing:1.8px}
        .landing-brand-mark{color:#19d06a;font-size:29px;line-height:.8;font-weight:950;letter-spacing:-3px}
        @keyframes landingEnter{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}
        @media(max-width:600px){
          .landing-hero{padding:16px 12px}
          .landing-panel{border-radius:26px;padding:32px 17px 25px}
          .landing-kicker{font-size:8px;letter-spacing:1.05px}
          .landing-panel h1{font-size:55px;letter-spacing:-3.5px;margin:30px 0 21px}
          .landing-panel h1 span{font-size:29px}
          .landing-lead{font-size:14px;line-height:1.65}
          .landing-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}
          .landing-primary,.landing-secondary{width:100%;padding:0 12px}
          .landing-features{grid-template-columns:1fr;gap:8px;margin-top:25px}
          .landing-features>div{padding:10px 12px}
          .landing-features strong,.landing-features small{white-space:normal}
          .landing-brand{margin-top:25px}
        }
      `}</style>
    </main>
  );
}
