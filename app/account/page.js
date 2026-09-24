'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import {
  UserRound, MapPin, CreditCard, ShoppingBag, Heart, PackageCheck,
  Bell, HelpCircle, FileText, ShieldCheck, LockKeyhole, LogOut,
  ChevronRight, Pencil, ArrowLeft
} from 'lucide-react';

const accountLinks = [
  { href: '/orders', icon: ShoppingBag, title: 'My Orders', text: 'View your current and previous orders' },
  { href: '/favorites', icon: Heart, title: 'Favorites', text: 'Your saved products and stores' },
  { href: '/tracking', icon: PackageCheck, title: 'Track Delivery', text: 'Follow an active delivery' },
];

const settingsLinks = [
  { href: '/account/personal', icon: UserRound, title: 'Personal Information', text: 'Manage your name and contact details' },
  { href: '/account/addresses', icon: MapPin, title: 'Saved Addresses', text: 'Manage your delivery addresses' },
  { href: '/account/payment-methods', icon: CreditCard, title: 'Payment Methods', text: 'Manage your saved payment options' },
  { href: '/account/notifications', icon: Bell, title: 'Notifications', text: 'Choose how BG Smart Services contacts you' },
];

const supportLinks = [
  { href: '/help', icon: HelpCircle, title: 'Help & Support', text: 'Get assistance with your account or order' },
  { href: '/terms', icon: FileText, title: 'Terms & Conditions', text: 'Read the platform terms' },
  { href: '/privacy', icon: ShieldCheck, title: 'Privacy Policy', text: 'Learn how your information is handled' },
];

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase?.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user || null);
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function out() {
    await supabase?.auth.signOut();
    setUser(null);
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Customer';

  if (loading) {
    return <main className="account-page"><div className="account-shell"><div className="account-skeleton" /></div></main>;
  }

  if (!user) {
    return (
      <main className="account-page">
        <div className="account-shell">
          <Link href="/home" className="account-back"><ArrowLeft size={17} /> Back to home</Link>
          <section className="account-signin-card">
            <div className="account-profile-icon"><UserRound size={30} /></div>
            <div className="eyebrow">BG Smart Services</div>
            <h1>Sign in to your account</h1>
            <p>Manage your profile, addresses, orders, favorites and delivery details from one place.</p>
            <Link className="btn btn-primary btn-large" href="/signin">Sign in</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <header className="account-topbar">
          <Link href="/home" className="account-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link>
          <Link href="/home" className="account-back"><ArrowLeft size={17} /> Back</Link>
        </header>

        <section className="account-hero">
          <div>
            <div className="eyebrow">Your account</div>
            <h1>My Account</h1>
            <p>Manage your BG Smart Services profile and preferences.</p>
          </div>
        </section>

        <section className="account-profile-card">
          <div className="account-avatar">{displayName.slice(0, 1).toUpperCase()}</div>
          <div className="account-profile-copy">
            <span className="account-welcome">Welcome back</span>
            <h2>{displayName}</h2>
            <p>{user.email}</p>
          </div>
          <Link className="account-edit" href="/account/personal" aria-label="Edit profile"><Pencil size={17} /><span>Edit Profile</span></Link>
        </section>

        <section className="account-section">
          <div className="account-section-head"><div><span className="eyebrow">Quick access</span><h2>Your activity</h2></div></div>
          <div className="account-quick-grid">
            {accountLinks.map(({ href, icon: Icon, title, text }) => (
              <Link className="account-quick-card" href={href} key={title}>
                <span className="account-link-icon"><Icon size={21} /></span>
                <span><strong>{title}</strong><small>{text}</small></span>
                <ChevronRight size={18} />
              </Link>
            ))}
          </div>
        </section>

        <div className="account-columns">
          <section className="account-section">
            <div className="account-section-head"><div><span className="eyebrow">Settings</span><h2>Account preferences</h2></div></div>
            <div className="account-list">
              {settingsLinks.map(({ href, icon: Icon, title, text }) => (
                <Link className="account-list-row" href={href} key={title}>
                  <span className="account-link-icon"><Icon size={19} /></span>
                  <span><strong>{title}</strong><small>{text}</small></span>
                  <ChevronRight size={18} />
                </Link>
              ))}
            </div>
          </section>

          <section className="account-section">
            <div className="account-section-head"><div><span className="eyebrow">Support</span><h2>Need help?</h2></div></div>
            <div className="account-list">
              {supportLinks.map(({ href, icon: Icon, title, text }) => (
                <Link className="account-list-row" href={href} key={title}>
                  <span className="account-link-icon"><Icon size={19} /></span>
                  <span><strong>{title}</strong><small>{text}</small></span>
                  <ChevronRight size={18} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="account-security-card">
          <div className="account-security-icon"><LockKeyhole size={20} /></div>
          <div><strong>Security</strong><p>Keep your account protected with a secure password.</p></div>
          <Link href="/account/change-password" className="btn account-password">Change Password</Link>
        </section>

        <button className="account-signout" type="button" onClick={out}><LogOut size={18} /><span>Sign out</span></button>
      </div>
    </main>
  );
}
