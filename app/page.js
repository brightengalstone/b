import Link from 'next/link';
import {ArrowRight, CheckCircle2, MapPin, Truck} from 'lucide-react';

export default function Welcome() {
  return (
    <main className="landing-page">
      <div className="landing-grid" aria-hidden="true" />
      <div className="landing-glow landing-glow-one" aria-hidden="true" />
      <div className="landing-glow landing-glow-two" aria-hidden="true" />

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-kicker">
            ORDER LOCAL <b>•</b> DELIVER LOCAL <b>•</b> EERSTERUST ONLY
          </div>

          <h1>
            <span>Your local food</span>
            delivery partner.
          </h1>

          <p className="landing-lead">
            Order from local restaurants and fast-food favourites, then let BG Smart Services bring your meal to your door anywhere in Eersterust.
          </p>

          <div className="landing-actions">
            <Link className="landing-primary" href="/signin">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link className="landing-secondary" href="/signin">Sign in</Link>
          </div>

          <div className="landing-trust">
            <div><MapPin size={18} /><span><strong>Eersterust only</strong><small>Local delivery zone</small></span></div>
            <div><Truck size={18} /><span><strong>R65 delivery</strong><small>No service fee</small></span></div>
            <div><CheckCircle2 size={18} /><span><strong>Simple & secure</strong><small>Track your order</small></span></div>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page{min-height:100svh;background:#06130d;color:#fff;position:relative;overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .landing-grid{position:absolute;inset:0;opacity:.12;background-image:linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px);background-size:62px 62px;mask-image:linear-gradient(to bottom,#000 0%,transparent 92%)}
        .landing-glow{position:absolute;border-radius:50%;filter:blur(2px);pointer-events:none}
        .landing-glow-one{width:560px;height:560px;right:-180px;top:-210px;background:rgba(20,205,100,.14)}
        .landing-glow-two{width:420px;height:420px;left:-230px;bottom:-180px;background:rgba(20,205,100,.08)}
        .landing-hero{min-height:100svh;max-width:1100px;margin:auto;display:grid;grid-template-columns:minmax(0,1fr);position:relative;z-index:1}
        .landing-copy{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:70px clamp(28px,6vw,92px);position:relative;z-index:4}
        .landing-kicker{margin-top:0;color:#98d5b2;font-size:11px;font-weight:850;letter-spacing:1.8px}
        .landing-kicker b{color:#1fd66f;padding:0 6px}
        .landing-copy h1{font-size:clamp(54px,6.1vw,88px);line-height:.91;letter-spacing:-5px;text-transform:uppercase;margin:48px 0 25px;max-width:760px}
        .landing-copy h1 span{display:block;font-family:cursive;text-transform:none;font-size:clamp(29px,3.3vw,47px);font-weight:500;letter-spacing:0;color:#c8ead7;line-height:1.05;margin-bottom:9px}
        .landing-lead{max-width:610px;color:#b6cabf;font-size:17px;line-height:1.7;margin:0}
        .landing-actions{display:flex;align-items:center;gap:14px;margin-top:31px}
        .landing-primary,.landing-secondary{min-height:52px;border-radius:15px;display:inline-flex;align-items:center;justify-content:center;gap:10px;font-weight:900;transition:transform .2s ease,background .2s ease}
        .landing-primary{background:#16bd61;color:#fff;padding:0 23px;box-shadow:0 16px 38px rgba(22,189,97,.24)}
        .landing-primary:hover{transform:translateY(-2px);background:#1bd36c}
        .landing-secondary{border:1px solid rgba(180,225,199,.22);padding:0 22px;color:#d5e9de;background:rgba(255,255,255,.04)}
        .landing-secondary:hover{transform:translateY(-2px);background:rgba(255,255,255,.08)}
        .landing-trust{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:30px;max-width:700px}
        .landing-trust>div{display:flex;align-items:center;gap:10px;min-width:0;padding:13px 12px;border:1px solid rgba(153,220,178,.17);background:rgba(255,255,255,.035);border-radius:15px}
        .landing-trust svg{flex:none;color:#1dd16b}
        .landing-trust span{display:grid;gap:2px;min-width:0}
        .landing-trust strong{font-size:12px}
        .landing-trust small{font-size:10px;color:#8da99c}
        @media(max-width:560px){
          .landing-copy{padding:32px 18px 46px}
          .landing-kicker{font-size:9px;letter-spacing:1.15px}
          .landing-kicker b{padding:0 3px}
          .landing-copy h1{font-size:48px;line-height:.93;margin-top:31px}
          .landing-copy h1 span{font-size:28px}
          .landing-lead{font-size:15px;line-height:1.6}
          .landing-actions{display:grid;grid-template-columns:1fr 1fr}
          .landing-primary,.landing-secondary{width:100%}
          .landing-trust{grid-template-columns:1fr 1fr}
          .landing-trust>div:last-child{grid-column:1/-1}
        }
      `}</style>
    </main>
  );
}
