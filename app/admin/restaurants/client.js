'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Plus, Store, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './restaurants.css';

const emptyForm = { merchant_id: '', business_name: '', branch_name: '', branch_address: '', full_name: '', email: '', phone: '', password: '' };

export default function AdminRestaurantsClient() {
  const [merchants, setMerchants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || '';
  }

  async function load() {
    setLoading(true);
    const accessToken = await getToken();
    if (!accessToken) { setError('Please sign in as an administrator.'); setLoading(false); return; }
    const response = await fetch('/api/admin/restaurants', { headers: { Authorization: 'Bearer ' + accessToken }, cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) setError(result?.error || 'Unable to load restaurant partners.');
    else setMerchants(result.merchants || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function chooseMerchant(value) {
    const merchant = merchants.find((item) => item.id === value);
    setForm((current) => ({ ...current, merchant_id: value, business_name: merchant?.business_name || '', branch_name: '', branch_address: '' }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    const accessToken = await getToken();
    const response = await fetch('/api/admin/restaurants', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    if (!response.ok) setError(result?.error || 'Unable to connect restaurant.');
    else {
      setMessage('Restaurant partner account connected successfully.');
      setForm({ ...emptyForm });
      await load();
    }
    setSaving(false);
  }

  return (
    <main className="restaurant-admin-page">
      <div className="restaurant-admin-shell">
        <header className="restaurant-admin-header">
          <Link href="/admin" className="back-link"><ArrowLeft size={17} /> Admin Console</Link>
          <div className="brand"><span>BG</span><div><strong>Restaurant Partners</strong><small>Partner connection</small></div></div>
        </header>

        <section className="hero">
          <div className="hero-icon"><Store size={27} /></div>
          <div><p>PARTNER MANAGEMENT</p><h1>Connect a restaurant</h1><span>Give a restaurant manager a secure login and connect that account to its BG Smart Services restaurant record.</span></div>
        </section>

        <div className="restaurant-admin-grid">
          <form className="restaurant-card" onSubmit={submit}>
            <div className="card-head"><div><h2>Restaurant account</h2><p>Use this for the manager who will receive BG orders.</p></div><Plus size={19} /></div>

            <label>Existing restaurant
              <select value={form.merchant_id} onChange={(event) => chooseMerchant(event.target.value)}>
                <option value="">Create a new restaurant record</option>
                {merchants.map((merchant) => <option key={merchant.id} value={merchant.id}>{merchant.business_name} · {merchant.branch_count} branch{merchant.branch_count === 1 ? '' : 'es'}</option>)}
              </select>
            </label>

            {!form.merchant_id && <label>Restaurant name<input value={form.business_name} onChange={(event) => setForm({ ...form, business_name: event.target.value })} placeholder="e.g. Nando's" required /></label>}

            <div className="two">
              <label>Manager full name<input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Full name" required /></label>
              <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone number" /></label>
            </div>

            <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="manager@restaurant.co.za" required /></label>
            <label>Temporary password<input type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" required /></label>

            <div className="branch-heading"><span>Optional branch</span><small>Useful when creating a new restaurant or adding a branch.</small></div>
            <div className="two">
              <label>Branch name<input value={form.branch_name} onChange={(event) => setForm({ ...form, branch_name: event.target.value })} placeholder="e.g. Denlyn" /></label>
              <label>Pickup address<input value={form.branch_address} onChange={(event) => setForm({ ...form, branch_address: event.target.value })} placeholder="Restaurant pickup address" /></label>
            </div>

            {error && <div className="restaurant-message error"><XCircle size={17} />{error}</div>}
            {message && <div className="restaurant-message success"><CheckCircle2 size={17} />{message}</div>}
            <button className="restaurant-primary" disabled={saving}>{saving ? 'Connecting restaurant…' : 'Connect restaurant partner'}</button>
          </form>

          <section className="restaurant-card">
            <div className="card-head"><div><h2>Restaurant records</h2><p>Restaurant records currently in Supabase.</p></div><Store size={19} /></div>
            {loading ? <div className="empty">Loading restaurants…</div> : (
              <div className="partner-list">
                {merchants.map((merchant) => (
                  <article className="partner-row" key={merchant.id}>
                    <div className="partner-avatar">{(merchant.business_name || 'R').slice(0, 1).toUpperCase()}</div>
                    <div className="partner-info"><strong>{merchant.business_name}</strong><span>{merchant.branch_count} branch{merchant.branch_count === 1 ? '' : 'es'} · {merchant.cuisine || 'restaurant'}</span><small>{merchant.owner?.full_name ? 'Connected to ' + merchant.owner.full_name : 'No restaurant owner connected'}</small></div>
                    <span className={merchant.approved && merchant.active && merchant.owner_id ? 'status good' : 'status pending'}>{merchant.approved && merchant.active && merchant.owner_id ? 'Connected' : merchant.approved ? 'Approved' : 'Not approved'}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
