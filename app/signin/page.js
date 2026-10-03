'use client';
import {useEffect,useState} from 'react';
import {Eye,EyeOff,ArrowLeft,Check,UserRound,Truck,Store} from 'lucide-react';
import Link from 'next/link';
import {supabase} from '../../lib/supabase';

export default function Signin(){
  const[signup,setSignup]=useState(false),[forgot,setForgot]=useState(false),[showPassword,setShowPassword]=useState(false),[showRetype,setShowRetype]=useState(false),[accepted,setAccepted]=useState(false),[accountType,setAccountType]=useState('customer');
  useEffect(()=>{
    const mode=new URLSearchParams(window.location.search).get('mode');
    setSignup(mode==='signup');
  },[]);
  const[name,setName]=useState(''),[surname,setSurname]=useState(''),[cellphone,setCellphone]=useState(''),[address,setAddress]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[retype,setRetype]=useState(''),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false);

  async function socialSignIn(provider){
    if(!supabase){setMsg('Supabase is not configured in this deployment yet.');return}
    setMsg('');
    setLoading(true);
    const{error}=await supabase.auth.signInWithOAuth({
      provider,
      options:{redirectTo:`${window.location.origin}/home`}
    });
    if(error){setLoading(false);setMsg(error.message)}
  }

  async function submit(e){
    e.preventDefault();
    setMsg('');
    const normalizedEmail=email.trim().toLowerCase();

    if(!supabase){setMsg('Supabase is not configured in this deployment yet.');return}

    if(forgot){
      if(!normalizedEmail){setMsg('Please enter your email address.');return}
      setLoading(true);
      const{error}=await supabase.auth.resetPasswordForEmail(normalizedEmail,{redirectTo:`${window.location.origin}/reset-password`});
      setLoading(false);
      setMsg(error?.message||'Password reset email sent. Check your email for the reset link.');
      return
    }

    if(signup){
      if(!accepted){setMsg('Please accept the Terms & Conditions and Privacy Policy.');return}
      if(!normalizedEmail){setMsg('Please enter your email address.');return}
      if(password!==retype){setMsg('Passwords do not match.');return}

      setLoading(true);
      const{error}=await supabase.auth.signUp({
        email:normalizedEmail,
        password,
        options:{data:{name,surname,cellphone,address,full_name:`${name} ${surname}`.trim()}}
      });
      setLoading(false);
      setMsg(error?.message||'Account created. Check your email if confirmation is enabled.');
      return
    }

    if(!normalizedEmail){setMsg('Please enter your email address.');return}
    setLoading(true);
    const{error}=await supabase.auth.signInWithPassword({email:normalizedEmail,password});
    setLoading(false);
    if(error){setMsg(error.message);return}
    const { data: currentUserData } = await supabase.auth.getUser();
    const currentUserId = currentUserData?.user?.id;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .maybeSingle();

    const role = profile?.role || 'customer';
    const expectedRole = accountType === 'driver' ? 'driver' : accountType === 'merchant' ? 'merchant' : 'customer';
    if (role !== expectedRole && !(accountType === 'customer' && role === 'admin')) {
      await supabase.auth.signOut();
      setMsg(`This account is not registered as a ${accountType === 'driver' ? 'driver' : accountType === 'merchant' ? 'restaurant partner' : 'customer'}. Please choose the correct account type.`);
      return;
    }
    if (role === 'admin') window.location.href = '/admin';
    else if (role === 'driver') window.location.href = '/driver';
    else if (role === 'merchant') window.location.href = '/merchant';
    else window.location.href = '/home'
  }

  const back=()=>{if(forgot)setForgot(false);else if(signup)setSignup(false);else window.location.href='/'};

  return <main className="mobile-auth-screen">
    <header className="mobile-auth-brand">
      <Link href="/" aria-label="BG Smart Services home">
        <span className="mobile-auth-logo" aria-label="BG Smart Services">
          <img src="/bg-tuktuk.svg" alt="BG Smart Services — Local Delivery" />
        </span>
      </Link>
    </header>

    <div className="mobile-auth-stage">
      <section className={signup?"mobile-auth-card signup-experience":"mobile-auth-card"}>
        {signup&&<div className="signup-bag-opening" aria-hidden="true">
          <div className="signup-float-item signup-item-one">BG</div>
          <div className="signup-float-item signup-item-two"><span /></div>
          <div className="signup-float-item signup-item-three"><span /><span /></div>
          <div className="signup-bag">
            <div className="signup-bag-handle" />
            <div className="signup-bag-body"><span>BG</span></div>
          </div>
          <div className="signup-bag-shadow" />
          <div className="signup-bag-caption">YOUR SHOPPING EXPERIENCE STARTS HERE</div>
        </div>}
        <button className="mobile-back" type="button" onClick={back} aria-label="Go back"><ArrowLeft size={18}/></button>


        {signup&&<style>{`\
          .signup-experience{overflow:hidden}
          .signup-bag-opening{height:230px;position:relative;display:flex;align-items:flex-end;justify-content:center;margin:-8px -6px 8px;animation:signupOpenOut .9s ease both}
          .signup-bag{position:relative;width:126px;height:142px;z-index:3;animation:bagArrive .9s .1s cubic-bezier(.2,.85,.25,1) both;transform-origin:50% 100%}
          .signup-bag-body{position:absolute;left:0;right:0;bottom:0;height:108px;border-radius:10px 10px 17px 17px;background:linear-gradient(145deg,#22d474,#11b95c);box-shadow:0 22px 35px rgba(18,170,83,.24);display:flex;align-items:center;justify-content:center;overflow:hidden}
          .signup-bag-body:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.2),transparent 42%)}
          .signup-bag-body span{position:relative;color:#fff;font-size:38px;font-weight:1000;letter-spacing:-4px;transform:translateX(-2px)}
          .signup-bag-handle{position:absolute;width:68px;height:48px;left:29px;top:0;border:7px solid #16bd61;border-bottom:0;border-radius:40px 40px 0 0;z-index:-1;transform:translateY(-23px)}
          .signup-bag-shadow{position:absolute;width:116px;height:15px;bottom:-2px;border-radius:50%;background:rgba(20,39,29,.12);filter:blur(7px);animation:shadowIn .8s .2s ease both}
          .signup-float-item{position:absolute;z-index:4;opacity:0;box-shadow:0 12px 24px rgba(20,39,29,.13)}
          .signup-item-one{left:calc(50% - 88px);top:48px;width:48px;height:48px;border-radius:12px;background:#fff;color:#16bd61;font-size:15px;font-weight:1000;display:flex;align-items:center;justify-content:center;animation:itemOne 1.25s .35s cubic-bezier(.18,.8,.25,1) both}
          .signup-item-two{right:calc(50% - 91px);top:36px;width:39px;height:50px;border-radius:7px;background:#f6faf7;transform:rotate(12deg);animation:itemTwo 1.25s .45s cubic-bezier(.18,.8,.25,1) both}
          .signup-item-two span{display:block;width:23px;height:6px;background:#16bd61;border-radius:4px;margin:14px auto 0}
          .signup-item-three{left:calc(50% + 42px);top:78px;width:42px;height:42px;border-radius:50%;background:#fff;transform:rotate(-14deg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;animation:itemThree 1.25s .5s cubic-bezier(.18,.8,.25,1) both}
          .signup-item-three span{width:21px;height:4px;border-radius:4px;background:#16bd61}
          .signup-bag-caption{position:absolute;bottom:0;color:#7a877f;font-size:7px;font-weight:950;letter-spacing:1.8px;text-align:center;animation:captionIn .7s .8s ease both}
          .signup-experience .mobile-auth-title,.signup-experience .mobile-auth-form{animation:signupContentIn .75s 1.35s ease both;animation-fill-mode:both}
          @keyframes bagArrive{from{opacity:0;transform:translateY(38px) scale(.82)}to{opacity:1;transform:none}}
          @keyframes itemOne{0%{opacity:0;transform:translateY(70px) rotate(-18deg) scale(.55)}22%{opacity:1}72%{opacity:1;transform:translate(-12px,-38px) rotate(8deg) scale(1)}100%{opacity:0;transform:translate(-35px,-90px) rotate(-8deg) scale(.9)}}
          @keyframes itemTwo{0%{opacity:0;transform:translateY(75px) rotate(12deg) scale(.55)}22%{opacity:1}72%{opacity:1;transform:translate(15px,-55px) rotate(-9deg) scale(1)}100%{opacity:0;transform:translate(42px,-108px) rotate(7deg) scale(.9)}}
          @keyframes itemThree{0%{opacity:0;transform:translateY(55px) rotate(-14deg) scale(.55)}25%{opacity:1}72%{opacity:1;transform:translate(28px,-25px) rotate(15deg) scale(1)}100%{opacity:0;transform:translate(62px,-74px) rotate(4deg) scale(.88)}}
          @keyframes shadowIn{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
          @keyframes captionIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
          @keyframes signupOpenOut{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
          @keyframes signupContentIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
          @media(max-width:600px){.signup-bag-opening{height:205px}.signup-bag{transform:scale(.9);transform-origin:50% 100%}.signup-bag-caption{font-size:6px;letter-spacing:1.4px}}
          @media(prefers-reduced-motion:reduce){.signup-bag-opening,.signup-bag,.signup-float-item,.signup-bag-shadow,.signup-bag-caption,.signup-experience .mobile-auth-title,.signup-experience .mobile-auth-form{animation:none!important;opacity:1!important;transform:none!important}}
        `}</style>}
        <div className="mobile-auth-title">
          <span className="mobile-auth-welcome">WELCOME BACK</span>
          <h1>{forgot?'Reset Password':signup?'Create Your Account':'Welcome Back'}</h1>
          <p>{forgot?'Enter your email to reset your password.':signup?'Fill in your details to get started':accountType==='driver'?'Driver access for active BG Smart Services drivers.':accountType==='merchant'?'Restaurant partner access for approved businesses.':'Sign in to continue shopping.'}</p>
        </div>

        {!forgot&&!signup&&<div className="account-type-picker">
          <div className="account-type-label">Sign in as</div>
          <div className="account-type-options">
            <button type="button" className={accountType==='customer'?'account-type-option active':'account-type-option'} onClick={()=>setAccountType('customer')}><UserRound size={18}/><span>Customer</span></button>
            <button type="button" className={accountType==='driver'?'account-type-option active':'account-type-option'} onClick={()=>setAccountType('driver')}><Truck size={18}/><span>Driver</span></button>
            <button type="button" className={accountType==='merchant'?'account-type-option active':'account-type-option'} onClick={()=>setAccountType('merchant')}><Store size={18}/><span>Restaurant Partner</span></button>
          </div>
        </div>}

        <form className="mobile-auth-form" onSubmit={submit}>
          {forgot?<label><span>Email Address</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" required/></label>:signup?<><label><span>First Name</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your first name" required/></label><label><span>Surname</span><input value={surname} onChange={e=>setSurname(e.target.value)} placeholder="Enter your surname" required/></label><label><span>Mobile Number</span><input type="tel" value={cellphone} onChange={e=>setCellphone(e.target.value)} placeholder="Enter your mobile number" required/></label><label><span>Email Address</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email address" autoComplete="email" required/></label><label><span>Delivery Address</span><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Enter your delivery address" required/></label><label><span>Create Password</span><span className="mobile-password"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" minLength={6} required/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label><label><span>Retype Password</span><span className="mobile-password"><input type={showRetype?'text':'password'} value={retype} onChange={e=>setRetype(e.target.value)} placeholder="Retype your password" minLength={6} required/><button type="button" onClick={()=>setShowRetype(!showRetype)}>{showRetype?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label><label className="terms-check"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span className="fake-check">{accepted&&<Check size={13}/>}</span><span>I agree to the BG Smart Services <Link href="/terms">Terms & Conditions</Link> and <Link href="/privacy">Privacy Policy</Link></span></label></>:<><label><span>Email Address</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" required/></label><label><span>Password</span><span className="mobile-password"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label></>}

          {msg&&<div className="notice">{msg}</div>}
          <button className="mobile-green-button" disabled={loading}>{loading?'Please wait…':forgot?'Send Reset Link':signup?'Create Account':'Sign In'}</button>
          {!forgot&&!signup&&<button className="mobile-text-button" type="button" onClick={()=>setForgot(true)}>Forgot password?</button>}
          <button className="mobile-text-button" type="button" onClick={()=>{setSignup(!signup);setForgot(false);setMsg('');setAccountType('customer')}}>{signup?'Already have an account? Log In':'Create an account'}</button>
          {!forgot&&!signup&&<div className="social-login social-login-bottom">
            <div className="auth-divider"><span>or continue with</span></div>
            <button type="button" className="social-login-button" disabled={loading} onClick={()=>socialSignIn('google')}>
              <img className="google-mark" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" aria-hidden="true"/>
              <span>Continue with Google</span>
            </button>
            <button type="button" className="social-login-button" disabled={loading} onClick={()=>socialSignIn('apple')}>
              <img className="apple-mark" src="https://appleid.cdn-apple.com/appleid/button/logo?color=white&border=false&border_radius=0&scale=1&size=30" alt="" aria-hidden="true"/>
              <span>Continue with Apple</span>
            </button>
          </div>}
        </form>
      </section>
    </div>
  </main>
}