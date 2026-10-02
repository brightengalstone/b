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
        <span className="mobile-auth-logo">
          <span className="mobile-auth-logo-bg">BG</span>
          <span className="mobile-auth-logo-name">SMART SERVICES</span>
        </span>
      </Link>
    </header>

    <div className="mobile-auth-stage">
      <section className="mobile-auth-card">
        <button className="mobile-back" type="button" onClick={back} aria-label="Go back"><ArrowLeft size={18}/></button>

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