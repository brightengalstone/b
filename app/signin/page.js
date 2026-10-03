'use client';
import React,{useEffect,useState} from 'react';
import {Eye,EyeOff,ArrowLeft,Mail,LockKeyhole,ArrowRight,ShieldCheck} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {supabase} from '../../lib/supabase';

export default function Signin(){
  const pathname=usePathname();
  const[signup,setSignup]=useState(false),[forgot,setForgot]=useState(false),[showPassword,setShowPassword]=useState(false),[showRetype,setShowRetype]=useState(false),[accepted,setAccepted]=useState(false),[accountType,setAccountType]=useState('customer');
  const[name,setName]=useState(''),[surname,setSurname]=useState(''),[cellphone,setCellphone]=useState(''),[address,setAddress]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[retype,setRetype]=useState(''),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false),[signupStep,setSignupStep]=useState(1);
  useEffect(()=>{setSignup(pathname==='/signup'||new URLSearchParams(window.location.search).get('mode')==='signup')},[pathname]);

  async function submit(e){
    e.preventDefault();setMsg('');
    const normalizedEmail=email.trim().toLowerCase();
    if(!supabase){setMsg('Supabase is not configured in this deployment yet.');return}
    if(forgot){
      if(!normalizedEmail){setMsg('Please enter your email address.');return}
      setLoading(true);
      const{error}=await supabase.auth.resetPasswordForEmail(normalizedEmail,{redirectTo:`${window.location.origin}/reset-password`});
      setLoading(false);setMsg(error?.message||'Password reset email sent. Check your email for the reset link.');return
    }
    if(signup){
      if(!accepted){setMsg('Please accept the Terms & Conditions and Privacy Policy.');return}
      if(!normalizedEmail){setMsg('Please enter your email address.');return}
      if(password!==retype){setMsg('Passwords do not match.');return}
      setLoading(true);
      const{data:signUpData,error}=await supabase.auth.signUp({email:normalizedEmail,password,options:{data:{name,surname,cellphone,address,full_name:`${name} ${surname}`.trim()}}});
      if(error){setLoading(false);setMsg(error.message);return}
      if(!signUpData?.session){
        const{error:signInError}=await supabase.auth.signInWithPassword({email:normalizedEmail,password});
        if(signInError){setLoading(false);setMsg('Your account was created. Please confirm your email before signing in.');return}
      }
      setLoading(false);window.location.href='/home';return
    }
    if(!normalizedEmail){setMsg('Please enter your email address.');return}
    if(!password){setMsg('Please enter your password.');return}
    setLoading(true);
    const{error}=await supabase.auth.signInWithPassword({email:normalizedEmail,password});
    if(error){setLoading(false);setMsg(error.message);return}
    const{data:currentUserData}=await supabase.auth.getUser();
    const currentUserId=currentUserData?.user?.id;
    const{data:profile}=await supabase.from('profiles').select('role').eq('id',currentUserId).maybeSingle();
    const role=profile?.role||'customer';
    const expectedRole=accountType==='driver'?'driver':accountType==='merchant'?'merchant':'customer';
    if(role!==expectedRole&&!(accountType==='customer'&&role==='admin')){
      await supabase.auth.signOut();setLoading(false);
      setMsg(`This account is not registered as a ${accountType==='driver'?'driver':accountType==='merchant'?'restaurant partner':'customer'}. Please choose the correct account type.`);return
    }
    setLoading(false);
    if(role==='admin')window.location.href='/admin';
    else if(role==='driver')window.location.href='/driver';
    else if(role==='merchant')window.location.href='/merchant';
    else window.location.href='/home'
  }

  const back=()=>{if(forgot)setForgot(false);else if(signup){window.location.href='/'}else window.location.href='/'};
  const nextSignupStep=()=>{setMsg('');if(signupStep===1&&!name.trim()||!surname.trim()||!cellphone.trim()){setMsg('Please complete your personal details.');return}if(signupStep===2&&(!email.trim()||!address.trim())){setMsg('Please complete your contact and delivery details.');return}setSignupStep(Math.min(3,signupStep+1))};
  const prevSignupStep=()=>{setMsg('');setSignupStep(Math.max(1,signupStep-1))};

  return <main className={signup?'modern-signup-screen':'modern-auth-screen'}>
    <style>{`
      .modern-auth-screen,.modern-signup-screen{min-height:100svh;background:linear-gradient(145deg,#f7fbf8,#fff 55%,#eef8f1);color:#101713;overflow-x:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .modern-auth-wrap,.modern-signup-wrap{min-height:100svh;width:min(1120px,100%);margin:auto;padding:22px 24px 28px;display:flex;flex-direction:column}
      .modern-auth-top,.modern-signup-top{display:flex;justify-content:space-between;align-items:center}
      .modern-auth-logo,.modern-signup-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#101713}
      .modern-auth-logo-mark,.modern-signup-logo-mark{font-size:34px;font-weight:1000;letter-spacing:-4px;color:#17c867}.modern-auth-logo-text,.modern-signup-logo-text{font-size:10px;font-weight:950;letter-spacing:2px}
      .modern-auth-back,.modern-signup-back{border:0;background:#fff;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;color:#526158;box-shadow:0 8px 25px rgba(18,50,31,.08);cursor:pointer}
      .modern-auth-layout,.modern-signup-layout{flex:1;display:grid;grid-template-columns:minmax(260px,.85fr) minmax(360px,1.15fr);gap:70px;align-items:center;padding:30px 5%}
      .modern-auth-intro,.modern-signup-intro{animation:maIntro .7s ease both}
      .modern-auth-kicker,.modern-signup-kicker{display:inline-flex;align-items:center;gap:8px;color:#18bd61;font-size:9px;font-weight:950;letter-spacing:2px}.modern-auth-kicker i,.modern-signup-kicker i{width:7px;height:7px;border-radius:50%;background:#18c968;box-shadow:0 0 0 6px rgba(24,201,104,.1)}
      .modern-auth-intro h1,.modern-signup-intro h1{font-size:clamp(42px,5vw,72px);line-height:.94;letter-spacing:-4px;margin:22px 0 18px;font-weight:1000}.modern-auth-intro h1 span,.modern-signup-intro h1 span{color:#18c968}
      .modern-auth-intro p,.modern-signup-intro p{max-width:390px;color:#617067;font-size:15px;line-height:1.65;margin:0}
      .modern-auth-points{margin-top:34px;display:grid;gap:13px}.modern-auth-point{display:flex;align-items:center;gap:11px;color:#657169;font-size:10px;font-weight:800;letter-spacing:.4px}.modern-auth-point span{width:30px;height:30px;border-radius:9px;background:#eaf8ef;color:#18bd61;display:grid;place-items:center}
      .modern-form-card{background:rgba(255,255,255,.92);border:1px solid #e7eee9;border-radius:26px;padding:30px;box-shadow:0 25px 70px rgba(24,64,39,.1);animation:maCard .75s .08s ease both}
      .modern-form-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:25px}.modern-form-head small{color:#8a958e;font-size:8px;font-weight:950;letter-spacing:1.5px}.modern-form-head h2{font-size:28px;letter-spacing:-1.5px;margin:5px 0 0;font-weight:950}.modern-step-count{font-size:10px;color:#18bd61;font-weight:950}
      .modern-fields{display:grid;grid-template-columns:1fr 1fr;gap:15px}.modern-field{display:flex;flex-direction:column;gap:7px}.modern-field.full{grid-column:1/-1}.modern-field label{font-size:9px;font-weight:900;letter-spacing:.7px;color:#66736b}
      .modern-field input{height:50px;border:1px solid #dfe7e2;border-radius:12px;padding:0 14px;background:#fbfdfb;color:#162019;outline:none;font-size:13px;transition:border .2s,box-shadow .2s}.modern-field input:focus{border-color:#18c968;box-shadow:0 0 0 4px rgba(24,201,104,.1)}
      .modern-password{position:relative}.modern-password input{width:100%;padding-right:45px}.modern-password button{position:absolute;right:5px;top:5px;width:40px;height:40px;border:0;background:transparent;color:#77837b;cursor:pointer}
      .modern-actions{display:flex;gap:10px;margin-top:22px}.modern-actions button{height:52px;border-radius:12px;font-size:10px;font-weight:950;letter-spacing:1px;cursor:pointer}.modern-primary{flex:1;border:0;background:#18c968;color:#fff;box-shadow:0 13px 28px rgba(24,201,104,.2)}.modern-primary:disabled{opacity:.65;cursor:wait}.modern-secondary{width:52px;border:1px solid #dfe7e2;background:#fff;color:#526158}
      .modern-forgot{text-align:right;margin-top:11px}.modern-forgot button,.modern-switch button{border:0;background:none;color:#18a956;font-size:10px;font-weight:900;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
      .modern-notice{margin-top:14px;padding:11px 12px;border-radius:10px;background:#fff5f5;color:#b42318;font-size:10px}.modern-switch{text-align:center;margin-top:22px;font-size:10px;color:#87928b}.modern-switch button{color:#111a15}
      .modern-terms{display:flex;gap:10px;align-items:flex-start;margin-top:19px;color:#7b877f;font-size:9px;line-height:1.5}.modern-terms input{accent-color:#18c968;margin-top:2px}.modern-terms a{color:#172019;font-weight:850}
      .modern-journey{margin-top:42px;display:flex;align-items:center;max-width:410px}.modern-journey-step{display:flex;align-items:center;gap:9px;color:#9aa59e;font-size:9px;font-weight:950;letter-spacing:1px;white-space:nowrap}.modern-journey-step.active{color:#152019}.modern-journey-dot{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#edf2ee;color:#78857c}.modern-journey-step.active .modern-journey-dot{background:#18c968;color:#fff}.modern-journey-line{height:1px;flex:1;background:#dce4df;margin:0 9px}
      .modern-footer{text-align:center;color:#9aa59e;font-size:8px;font-weight:900;letter-spacing:1.5px;padding-top:10px}.modern-footer span{color:#18bd61}
      @keyframes maIntro{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes maCard{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:none}}
      @media(max-width:760px){.modern-auth-wrap,.modern-signup-wrap{padding:18px 16px}.modern-auth-layout,.modern-signup-layout{display:block;padding:35px 0 20px}.modern-auth-intro,.modern-signup-intro{text-align:center}.modern-auth-intro p,.modern-signup-intro p{margin:auto;font-size:13px}.modern-auth-intro h1,.modern-signup-intro h1{font-size:47px;letter-spacing:-3px;margin:18px 0 14px}.modern-auth-points{max-width:310px;margin:25px auto}.modern-form-card{padding:22px 18px;border-radius:21px}.modern-form-head h2{font-size:24px}.modern-fields{grid-template-columns:1fr}.modern-field.full{grid-column:auto}.modern-actions{margin-top:18px}.modern-auth-logo-mark,.modern-signup-logo-mark{font-size:29px}.modern-auth-logo-text,.modern-signup-logo-text{font-size:8px;letter-spacing:1.5px}}
      @media(prefers-reduced-motion:reduce){.modern-auth-intro,.modern-form-card,.modern-signup-intro{animation:none}}
    `}</style>
    {signup?
      <div className="modern-signup-wrap">
        <header className="modern-signup-top"><Link href="/" className="modern-signup-logo"><span className="modern-signup-logo-mark">BG</span><span className="modern-signup-logo-text">SMART SERVICES</span></Link><button className="modern-signup-back" onClick={back} aria-label="Go back"><ArrowLeft size={18}/></button></header>
        <div className="modern-signup-layout">
          <section className="modern-signup-intro"><div className="modern-signup-kicker"><i/> EERSTERUST / POORT</div><h1>Let's get<br/><span>you started.</span></h1><p>Create your BG Smart Services account and make your local shopping experience simple from the start.</p><div className="modern-journey">{[['01','About you'],['02','Your details'],['03','Secure']].map((x,i)=><React.Fragment key={x[0]}><div className={signupStep===i+1?'modern-journey-step active':'modern-journey-step'}><span className="modern-journey-dot">{x[0]}</span><span>{x[1]}</span></div>{i<2&&<div className="modern-journey-line"/>}</React.Fragment>)}</div></section>
          <section className="modern-form-card"><div className="modern-form-head"><div><small>CREATE YOUR ACCOUNT</small><h2>{signupStep===1?'Tell us about you':signupStep===2?'Your delivery details':'Secure your account'}</h2></div><span className="modern-step-count">0{signupStep} / 03</span></div>
            <form onSubmit={e=>{e.preventDefault();if(signupStep<3)nextSignupStep();else submit(e)}}>
              {signupStep===1&&<div className="modern-fields"><div className="modern-field"><label>FIRST NAME</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your first name"/></div><div className="modern-field"><label>SURNAME</label><input value={surname} onChange={e=>setSurname(e.target.value)} placeholder="Your surname"/></div><div className="modern-field full"><label>MOBILE NUMBER</label><input type="tel" value={cellphone} onChange={e=>setCellphone(e.target.value)} placeholder="Your mobile number"/></div></div>}
              {signupStep===2&&<div className="modern-fields"><div className="modern-field full"><label>EMAIL ADDRESS</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div><div className="modern-field full"><label>DELIVERY ADDRESS</label><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Where should we deliver?"/></div></div>}
              {signupStep===3&&<div className="modern-fields"><div className="modern-field full"><label>CREATE PASSWORD</label><span className="modern-password"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6}/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></div><div className="modern-field full"><label>RETYPE PASSWORD</label><span className="modern-password"><input type={showRetype?'text':'password'} value={retype} onChange={e=>setRetype(e.target.value)} placeholder="Retype your password" minLength={6}/><button type="button" onClick={()=>setShowRetype(!showRetype)}>{showRetype?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></div><label className="modern-terms"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>I agree to the BG Smart Services <Link href="/terms">Terms & Conditions</Link> and <Link href="/privacy">Privacy Policy</Link>.</span></label></div>}
              {msg&&<div className="modern-notice">{msg}</div>}<div className="modern-actions">{signupStep>1&&<button type="button" className="modern-secondary" onClick={prevSignupStep}><ArrowLeft size={17}/></button>}<button type="submit" className="modern-primary" disabled={loading}>{loading?'Creating account…':signupStep===3?'Create Account':'Continue'}</button></div>
            </form><div className="modern-switch">Already have an account? <button type="button" onClick={()=>window.location.href='/signin'}>Sign in</button></div>
          </section>
        </div><footer className="modern-footer">LOCAL <span>•</span> CONVENIENT <span>•</span> MADE FOR POORT</footer>
      </div>
    :
      <div className="modern-auth-wrap">
        <header className="modern-auth-top"><Link href="/" className="modern-auth-logo"><span className="modern-auth-logo-mark">BG</span><span className="modern-auth-logo-text">SMART SERVICES</span></Link><button className="modern-auth-back" onClick={back} aria-label="Go back"><ArrowLeft size={18}/></button></header>
        <div className="modern-auth-layout">
          <section className="modern-auth-intro"><div className="modern-auth-kicker"><i/> EERSTERUST / POORT</div><h1>Welcome<br/><span>back.</span></h1><p>Sign in to your BG Smart Services account and continue your local delivery experience.</p><div className="modern-auth-points"><div className="modern-auth-point"><span><MapPinIcon/></span>Local delivery across Eersterust</div><div className="modern-auth-point"><span><ShieldCheck size={15}/></span>Your account stays secure</div></div></section>
          <section className="modern-form-card">
            <div className="modern-form-head"><div><small>{forgot?'RESET ACCESS':'WELCOME BACK'}</small><h2>{forgot?'Reset your password':'Sign in to continue'}</h2></div><span className="modern-step-count">{forgot?'02 / 02':'01 / 01'}</span></div>
            <form onSubmit={submit}>
              <div className="modern-fields">
                <div className="modern-field full"><label>EMAIL ADDRESS</label><div className="modern-password"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/><Mail size={16} style={{position:'absolute',right:14,top:17,color:'#8b968f',pointerEvents:'none'}}/></div></div>
                {!forgot&&<div className="modern-field full"><label>PASSWORD</label><span className="modern-password"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password"/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></div>}
              </div>
              {msg&&<div className="modern-notice">{msg}</div>}
              {!forgot&&<div className="modern-forgot"><button type="button" onClick={()=>{setForgot(true);setMsg('')}}>Forgot password?</button></div>}
              <div className="modern-actions">{forgot&&<button type="button" className="modern-secondary" onClick={()=>{setForgot(false);setMsg('')}}><ArrowLeft size={17}/></button>}<button type="submit" className="modern-primary" disabled={loading}>{loading?(forgot?'Sending…':'Signing in…'):(forgot?'Send reset link':'Sign In')}<ArrowRight size={17}/></button></div>
            </form>
            <div className="modern-switch">New to BG Smart Services? <Link href="/signup">Create an account</Link></div>
          </section>
        </div><footer className="modern-footer">LOCAL <span>•</span> CONVENIENT <span>•</span> MADE FOR POORT</footer>
      </div>}
  </main>
}
function MapPinIcon(){return <span style={{fontSize:13}}>●</span>}
