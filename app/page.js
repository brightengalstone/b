import Link from 'next/link';
import {ArrowRight, CheckCircle2, MapPin, ShoppingCart, Truck} from 'lucide-react';

function TukTukIllustration() {
  return (
    <svg className="landing-tuktuk-art" viewBox="0 0 720 520" role="img" aria-label="BG Smart Services tuk tuk">
      <defs>
        <linearGradient id="tukGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#20d96d"/>
          <stop offset="55%" stopColor="#0ca653"/>
          <stop offset="100%" stopColor="#08743c"/>
        </linearGradient>
        <linearGradient id="tukDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#17382a"/>
          <stop offset="100%" stopColor="#07140e"/>
        </linearGradient>
        <filter id="tukShadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="26" stdDeviation="24" floodColor="#000000" floodOpacity=".42"/>
        </filter>
      </defs>

      <ellipse cx="365" cy="446" rx="285" ry="38" fill="#000" opacity=".28"/>
      <g filter="url(#tukShadow)">
        <path d="M210 173 L257 91 Q271 67 302 67 H448 Q477 67 493 91 L542 173Z" fill="url(#tukDark)" stroke="#2de177" strokeOpacity=".38" strokeWidth="3"/>
        <path d="M230 169 H522 L553 338 Q558 365 535 380 H205 Q182 365 187 338Z" fill="url(#tukGreen)" stroke="#082a19" strokeWidth="9"/>
        <path d="M246 191 H506 L521 299 H231Z" fill="#071713" stroke="#8ae8b0" strokeOpacity=".28" strokeWidth="3"/>
        <path d="M262 207 H329 V282 H249Z" fill="#163b2a"/>
        <path d="M342 207 H410 V282 H342Z" fill="#163b2a"/>
        <path d="M423 207 H492 L505 282 H423Z" fill="#163b2a"/>
        <path d="M279 213 L309 213 L305 276 L255 276Z" fill="#24513b" opacity=".72"/>
        <path d="M356 213 H397 V276 H356Z" fill="#24513b" opacity=".72"/>
        <path d="M438 213 H485 L497 276 H438Z" fill="#24513b" opacity=".72"/>

        <rect x="274" y="303" width="173" height="47" rx="12" fill="#062114" stroke="#63e69a" strokeOpacity=".38" strokeWidth="2"/>
        <text x="360" y="323" textAnchor="middle" fill="#9bf1bb" fontSize="12" fontWeight="800" letterSpacing="2">BG SMART</text>
        <text x="360" y="341" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="900" letterSpacing="2.4">SERVICES</text>

        <path d="M187 333 H145 Q130 333 130 350 V369 H196Z" fill="#0b2116"/>
        <path d="M528 332 H575 Q592 332 592 351 V369 H522Z" fill="#0b2116"/>
        <path d="M204 367 H530" stroke="#062014" strokeWidth="12"/>

        <circle cx="212" cy="392" r="42" fill="#06100c" stroke="#193a2b" strokeWidth="10"/>
        <circle cx="508" cy="392" r="42" fill="#06100c" stroke="#193a2b" strokeWidth="10"/>
        <circle cx="212" cy="392" r="15" fill="#163326"/>
        <circle cx="508" cy="392" r="15" fill="#163326"/>

        <path d="M185 177 L160 128 H213 L236 177Z" fill="#0d2a1c"/>
        <path d="M535 177 L560 128 H507 L484 177Z" fill="#0d2a1c"/>

        <rect x="303" y="107" width="114" height="32" rx="9" fill="#0a1b12" stroke="#20d96d" strokeOpacity=".55"/>
        <text x="360" y="129" textAnchor="middle" fill="#20d96d" fontSize="12" fontWeight="900" letterSpacing="2">BG DELIVERY</text>
      </g>
    </svg>
  );
}

export default function Welcome() {
  return (
    <main className="landing-page">
      <div className="landing-grid" aria-hidden="true" />
      <div className="landing-glow landing-glow-one" aria-hidden="true" />
      <div className="landing-glow landing-glow-two" aria-hidden="true" />

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-brand">
            <span className="landing-brand-mark">BG</span>
            <ShoppingCart size={22} strokeWidth={2.5} />
            <span>SMART SERVICES</span>
          </div>

          <div className="landing-kicker">
            SHOP LOCAL <b>•</b> DELIVER LOCAL <b>•</b> EERSTERUST ONLY
          </div>

          <h1>
            <span>Your local shopping</span>
            delivery partner.
          </h1>

          <p className="landing-lead">
            Shop from local stores and restaurants, then let BG Smart Services bring your order to your door in Eersterust.
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

        <div className="landing-visual" aria-hidden="true">
          <div className="landing-route">
            <span className="route-dot route-dot-a" />
            <span className="route-dot route-dot-b" />
            <span className="route-dot route-dot-c" />
            <svg viewBox="0 0 620 260" preserveAspectRatio="none">
              <path d="M22 210 C 155 35, 290 42, 375 160 S 510 268, 600 70" />
            </svg>
          </div>

          <div className="landing-delivery-card landing-delivery-card-top">
            <Truck size={19} />
            <span><strong>Fast delivery</strong><small>Across Eersterust</small></span>
          </div>

          <div className="landing-tuktuk">
            <TukTukIllustration />
          </div>

          <div className="landing-delivery-card landing-delivery-card-bottom">
            <ShoppingCart size={18} />
            <span><strong>Shop local</strong><small>Groceries & restaurants</small></span>
          </div>

          <div className="landing-circle landing-circle-one" />
          <div className="landing-circle landing-circle-two" />
        </div>
      </section>

      <style>{`
        .landing-page{min-height:100svh;background:#06130d;color:#fff;position:relative;overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .landing-grid{position:absolute;inset:0;opacity:.12;background-image:linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px);background-size:62px 62px;mask-image:linear-gradient(to bottom,#000 0%,transparent 92%)}
        .landing-glow{position:absolute;border-radius:50%;filter:blur(2px);pointer-events:none}
        .landing-glow-one{width:560px;height:560px;right:-180px;top:-210px;background:rgba(20,205,100,.14)}
        .landing-glow-two{width:420px;height:420px;left:-230px;bottom:-180px;background:rgba(20,205,100,.08)}
        .landing-hero{min-height:100svh;max-width:1440px;margin:auto;display:grid;grid-template-columns:minmax(0,.92fr) minmax(500px,1.08fr);position:relative;z-index:1}
        .landing-copy{display:flex;flex-direction:column;justify-content:center;padding:70px clamp(28px,6vw,92px);position:relative;z-index:4}
        .landing-brand{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:1.6px;font-size:15px}
        .landing-brand svg{color:#19cf67}
        .landing-brand-mark{font-size:56px;line-height:.72;font-weight:950;letter-spacing:-6px;color:#15c862}
        .landing-kicker{margin-top:34px;color:#98d5b2;font-size:11px;font-weight:850;letter-spacing:1.8px}
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
        .landing-visual{position:relative;min-height:100svh;overflow:hidden;display:grid;place-items:center;background:radial-gradient(circle at 52% 50%,rgba(22,202,101,.16),transparent 33%),linear-gradient(145deg,#0b2518,#07140e 72%)}
        .landing-visual:before{content:"";position:absolute;inset:12% 7% 8%;border:1px solid rgba(157,227,181,.08);border-radius:42px;transform:rotate(-2deg)}
        .landing-route{position:absolute;inset:15% 4% 15%;opacity:.7}
        .landing-route svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
        .landing-route path{fill:none;stroke:#4fbc7e;stroke-opacity:.3;stroke-width:2;stroke-dasharray:7 9}
        .route-dot{position:absolute;width:14px;height:14px;border-radius:50%;background:#f4fff8;box-shadow:0 0 0 7px rgba(255,255,255,.05);z-index:2}
        .route-dot-a{left:4%;top:74%}.route-dot-b{left:51%;top:49%;background:#18d36a;box-shadow:0 0 0 8px rgba(24,211,106,.09)}.route-dot-c{right:5%;top:19%}
        .landing-tuktuk{width:min(680px,91%);position:relative;z-index:3;animation:landingFloat 5s ease-in-out infinite}
        .landing-tuktuk-art{width:100%;height:auto;display:block}
        .landing-delivery-card{position:absolute;z-index:5;display:flex;align-items:center;gap:11px;background:rgba(250,255,252,.96);color:#102219;padding:13px 16px;border-radius:17px;box-shadow:0 22px 50px rgba(0,0,0,.28);min-width:220px}
        .landing-delivery-card svg{color:#0fa654;flex:none}
        .landing-delivery-card span{display:grid;gap:3px}
        .landing-delivery-card strong{font-size:12px}
        .landing-delivery-card small{font-size:10px;color:#708177}
        .landing-delivery-card-top{right:6%;top:16%}
        .landing-delivery-card-bottom{left:5%;bottom:18%}
        .landing-circle{position:absolute;border-radius:50%;border:1px solid rgba(145,226,175,.08)}
        .landing-circle-one{width:500px;height:500px}.landing-circle-two{width:720px;height:720px;opacity:.55}
        @keyframes landingFloat{50%{transform:translateY(-10px) rotate(.25deg)}}
        @media(max-width:900px){
          .landing-hero{grid-template-columns:1fr}
          .landing-visual{min-height:54svh;order:-1}
          .landing-copy{padding:36px 22px 54px}
          .landing-copy h1{margin-top:34px;font-size:52px;letter-spacing:-3px}
          .landing-copy h1 span{font-size:31px}
          .landing-visual:before{inset:8% 4% 7%}
          .landing-tuktuk{width:88%}
          .landing-delivery-card-top{right:3%;top:8%;transform:scale(.9)}
          .landing-delivery-card-bottom{left:3%;bottom:9%;transform:scale(.9)}
        }
        @media(max-width:560px){
          .landing-visual{min-height:47svh}
          .landing-tuktuk{width:108%;margin-top:20px}
          .landing-delivery-card{min-width:0;padding:10px 12px;border-radius:14px}
          .landing-delivery-card-top{right:8px;top:14px}
          .landing-delivery-card-bottom{left:8px;bottom:12px}
          .landing-copy{padding:32px 18px 46px}
          .landing-brand-mark{font-size:48px}
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
