'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [signup, setSignup] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');

    if (!supabase) {
      setMsg('Supabase is not configured in this deployment yet.');
      return;
    }

    if (forgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      setMsg(
        error?.message ||
          'Password reset email sent. Check your email for the reset link.'
      );

      return;
    }

    if (signup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      setMsg(
        error?.message ||
          'Account created. Check your email if confirmation is enabled.'
      );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      setMsg('Signed in successfully.');

      window.location.href = '/account';
    }
  }

  function switchMode() {
    setMsg('');
    setForgot(false);
    setSignup(!signup);
  }

  return (
    <div className="page narrow">
      <div className="eyebrow">BG Smart Services</div>

      <h1>
        {forgot ? 'Reset password' : signup ? 'Create account' : 'Sign in'}
      </h1>

      <form className="card form" onSubmit={submit}>
        {forgot ? (
          <>
            <p>
              Enter your email address and we’ll send you a link to reset
              your password.
            </p>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <button className="btn" type="submit">
              Send reset link
            </button>

            {msg && <div className="notice">{msg}</div>}

            <button
              className="text-button"
              type="button"
              onClick={() => {
                setForgot(false);
                setMsg('');
              }}
            >
              ← Back to sign in
            </button>
          </>
        ) : (
          <>
            {signup && (
              <label>
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <button className="btn" type="submit">
              {signup ? 'Create account' : 'Sign in'}
            </button>

            {msg && <div className="notice">{msg}</div>}

            {!signup && (
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setForgot(true);
                  setMsg('');
                }}
              >
                Forgot password?
              </button>
            )}

            <button
              className="text-button"
              type="button"
              onClick={switchMode}
            >
              {signup
                ? 'Already have an account? Sign in'
                : 'Need an account? Create one'}
            </button>

            <Link className="text-link" href="/marketplace">
              Continue shopping →
            </Link>
          </>
        )}
      </form>
    </div>
  );
}
