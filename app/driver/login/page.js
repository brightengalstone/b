'use client';

import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Truck, ShieldCheck, Mail, LockKeyhole, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

export default function DriverLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    if (!supabase) {
      setMessage('Supabase is not configured in this deployment yet.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setMessage('Enter your driver email and password.');
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
      setMessage('We could not verify this driver account. Please try again.');
      return;
    }

    if (profile?.role !== 'driver') {
      await supabase.auth.signOut();
      setLoading(false);
      setMessage('This login is for approved BG Smart Services drivers only.');
      return;
    }

    const { data: driverProfile, error: driverError } = await supabase
      .from('driver_profiles')
      .select('approved')
      .eq('id', data.user.id)
      .maybeSingle();

    if (driverError || !driverProfile) {
      await supabase.auth.signOut();
      setLoading(false);
      setMessage('Driver profile not found. Please contact the administrator.');
      return;
    }

    if (!driverProfile.approved) {
      setLoading(false);
      setMessage('Your driver account is waiting for admin approval.');
      return;
    }

    window.location.href = '/driver';
  }

  return (
    <main className="driver-page">
      <div className="driver-shell driver-login-shell">
        <header className="driver-header">
          <Link href="/" className="driver-brand" aria-label="Back to BG Smart Services">
            <span className="brand-mark">BG</span>
            <div>
              <strong>BG Smart Services</strong>
              <span>Driver Portal</span>
            </div>
          </Link>
          <Link href="/" className="driver-icon-button" title="Back to home">
            <ArrowLeft size={18} />
          </Link>
        </header>

        <section className="driver-login-card">
          <div className="driver-card-glow" />
          <div className="driver-login-icon"><Truck size={25} /></div>
          <span className="driver-eyebrow">Driver access</span>
          <h1>Driver Login</h1>
          <p>Sign in with the driver account created for you by BG Smart Services.</p>

          <form className="driver-login-form" onSubmit={submit}>
            <label>
              <span>Email address</span>
              <div className="driver-input-wrap"><Mail size={16} /><input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your driver email"
                autoComplete="email"
                required
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
              /></div>
            </label>

            <label>
              <span>Password</span>
              <span className="driver-password"><LockKeyhole size={16} className="driver-lock-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {message && <div className="driver-message"><ShieldCheck size={17} /><span>{message}</span></div>}

            <button className="driver-button primary driver-login-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to Driver Dashboard'}
            </button>
          </form>

          <div className="driver-login-note">
            Driver accounts are created and approved by an administrator. There is no public driver registration.
          </div>
        </section>
      </div>
    </main>
  );
}
