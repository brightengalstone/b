'use client';

import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, ShoppingBag, ShieldCheck, Mail, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

export default function RestaurantLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    if (!supabase) {
      setMessage('Supabase is not configured in this deployment yet.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setMessage('Enter your restaurant email and password.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      setLoading(false);
      setMessage('We could not verify this restaurant account. Please try again.');
      return;
    }

    if (!['restaurant', 'partner'].includes(profile?.role)) {
      await supabase.auth.signOut();
      setLoading(false);
      setMessage('This login is for approved BG Smart Services restaurant partners.');
      return;
    }

    window.location.href = '/restaurant';
  }

  return (
    <main className="partner-page">
      <div className="partner-shell">
        <header className="partner-header">
          <Link href="/" className="partner-brand" aria-label="Back to BG Smart Services">
            <span className="partner-brand-mark">BG</span>
            <div>
              <strong>BG Smart Services</strong>
              <span>Restaurant Portal</span>
            </div>
          </Link>
          <Link href="/" className="partner-back" title="Back to home">
            <ArrowLeft size={18} />
          </Link>
        </header>

        <section className="partner-card"><div className="partner-card-glow" />
          <div className="partner-icon"><ShoppingBag size={25} /></div>
          <span className="partner-eyebrow">Restaurant partner access</span>
          <h1>Restaurant Sign In</h1>
          <p>Sign in with the partner account provided to your restaurant by BG Smart Services.</p>

          <form onSubmit={submit}>
            <label>
              <span>Restaurant email</span>
              <div className="partner-input-wrap"><Mail size={16} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your restaurant email" autoComplete="email" required /></div>
            </label>

            <label>
              <span>Password</span>
              <span className="partner-password"><LockKeyhole size={16} className="partner-lock-icon" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {message && <div className="partner-message"><ShieldCheck size={17} /><span>{message}</span></div>}

            <button className="partner-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to Restaurant Dashboard'}
            </button>
          </form>

          <div className="partner-note">
            Restaurant accounts are created and approved by BG Smart Services. There is no public restaurant registration.
          </div>
        </section>
      </div>

      <style>{`
        .partner-page{min-height:100svh;background:linear-gradient(145deg,#f8faf8 0%,#fff 50%,#eef8f2 100%);color:#101713;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .partner-shell{width:min(620px,100%);min-height:100svh;margin:auto;padding:28px 24px;display:flex;flex-direction:column}
        .partner-header{display:flex;align-items:center;justify-content:space-between}
        .partner-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#101713}
        .partner-brand-mark{font-size:31px;font-weight:950;letter-spacing:-3px;color:#18c968;line-height:.8}
        .partner-brand div{display:flex;flex-direction:column}.partner-brand strong{font-size:13px}.partner-brand span{font-size:9px;color:#78847d;letter-spacing:1.4px;font-weight:800;margin-top:3px}
        .partner-back{width:40px;height:40px;border:1px solid #dce5df;border-radius:11px;display:grid;place-items:center;color:#334139;background:#fff;text-decoration:none}
        .partner-card{position:relative;overflow:hidden;margin:auto 0;padding:34px;border:1px solid #e0e8e2;border-radius:24px;background:rgba(255,255,255,.92);box-shadow:0 24px 70px rgba(16,23,19,.08)}
        .partner-card-glow{position:absolute;width:180px;height:180px;border-radius:50%;background:#dff8e8;filter:blur(35px);opacity:.55;right:-80px;top:-90px;pointer-events:none}.partner-icon{position:relative;width:52px;height:52px;border-radius:15px;background:#e9faef;color:#18bd61;display:grid;place-items:center;margin-bottom:20px}
        .partner-eyebrow{font-size:9px;letter-spacing:1.7px;text-transform:uppercase;color:#18b85e;font-weight:950}
        .partner-card h1{position:relative;font-size:38px;letter-spacing:-2px;margin:8px 0 8px}.partner-card>p{color:#68756d;font-size:13px;line-height:1.6;margin:0 0 26px}
        .partner-card label{display:block;margin-top:17px;font-size:11px;font-weight:850;color:#303d35}.partner-card label>span:first-child{display:block;margin-bottom:7px}
        .partner-input-wrap{position:relative}.partner-input-wrap>svg{position:absolute;left:14px;top:16px;color:#8a968f;pointer-events:none}.partner-card input{width:100%;height:48px;border:1px solid #d8e2db;border-radius:11px;padding:0 13px;font:inherit;font-size:13px;outline:none;background:#fff;box-sizing:border-box}.partner-card input:focus{border-color:#18c968;box-shadow:0 0 0 4px rgba(24,201,104,.1)}
        .partner-password{position:relative;display:block}.partner-password input{padding-right:45px}.partner-password button{position:absolute;right:5px;top:5px;width:38px;height:38px;border:0;background:transparent;color:#65736b;display:grid;place-items:center;cursor:pointer}
        .partner-message{margin-top:16px;border:1px solid #f0d8d8;background:#fff7f7;color:#8b4141;border-radius:10px;padding:11px 12px;display:flex;gap:8px;align-items:flex-start;font-size:11px;line-height:1.45}
        .partner-submit{transition:.2swidth:100%;height:52px;border:0;border-radius:12px;background:#18c968;color:#fff;font-size:11px;font-weight:950;letter-spacing:.8px;margin-top:22px;cursor:pointer;box-shadow:0 12px 28px rgba(24,201,104,.2)}.partner-submit:disabled{opacity:.65;cursor:wait}
        .partner-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 16px 34px rgba(24,201,104,.25)}.partner-note{margin-top:20px;padding-top:18px;border-top:1px solid #e4ebe6;color:#87928b;font-size:10px;line-height:1.6;text-align:center}
        @keyframes partnerIn{from{opacity:0;transform:translateY(18px) scale(.99)}to{opacity:1;transform:none}}.partner-card{animation:partnerIn .65s ease both}@media(max-width:600px){.partner-shell{padding:20px 16px}.partner-card{padding:26px 20px;border-radius:20px}.partner-card h1{font-size:32px}}
      `}</style>
    </main>
  );
}
