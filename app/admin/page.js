'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    }

    loadUser();
  }, []);

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    window.location.href = '/signin';
  }

  if (loading) {
    return (
      <div className="page">
        <h1>Account</h1>
        <div className="card">
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page narrow">
        <div className="eyebrow">BG Smart Services</div>
        <h1>Account</h1>

        <div className="card">
          <h2>You’re not signed in</h2>
          <p>Sign in to view your BG Smart Services account.</p>

          <Link className="btn" href="/signin">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <div className="eyebrow">BG Smart Services</div>
      <h1>My Account</h1>

      <div className="card">
        <h2>Welcome 👋</h2>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        {user.user_metadata?.full_name && (
          <p>
            <strong>Name:</strong> {user.user_metadata.full_name}
          </p>
        )}

        <button className="btn" onClick={signOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
