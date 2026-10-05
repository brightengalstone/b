'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Plus, Store, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './restaurants.css';

const emptyForm = { merchant_id: '', business_name: '', branch_name: '', branch_address: '', full_name: '', email: '', phone: '', password: '' };

const stages = [
  ['agreement', 'Partnership agreement'],
  ['info_form', 'Partner information form'],
  ['menu', 'Menu & pricing'],
  ['test_order', 'Test order'],
  ['driver_test', 'Driver pickup test'],
  ['delivery_test', 'Customer delivery test'],
];

export default function AdminRestaurantsClient() {
  const [merchants, setMerchants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

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

  async function updateRestaurant(merchantId, action, stage = '') {
    setError(''); setMessage('');
    const accessToken = await getToken();
    const response = await fetch('/api/admin/restaurants', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant_id: merchantId, action, stage }),
    });
    const result = await response.json();
    if (!response.ok) setError(result?.error || 'Unable to update restaurant.');
    else {
      setMessage(action === 'approve' ? 'Restaurant approved. Onboarding can now begin.' : action === 'reject' ? 'Restaurant rejected.' : action === 'go_live' ? 'Restaurant is now LIVE.' : 'Onboarding step completed.');
      await load();
    }
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
      setMessage('Restaurant partner account connected successfully. Approve it below to begin onboarding.');
      setForm({ ...emptyForm });
      await load();
    }
    setSaving(false);
  }

  function stageDone(merchant, key) {
    return Boolean(merchant[{
      agreement: 'agreement_signed',
      info_form: 'info_form_completed',
      menu: 'menu_setup_completed',
      test_order: 'test_order_completed',
      driver_test: 'driver_test_completed',
      delivery_test: 'delivery_test_completed',
    }[key]]);
  }

  function completedCount(merchant) {
    return stages.filter(([key]) => stageDone(merchant, key)).length;
  }

  return (
    <main className="restaurant-admin-page">
      <div className="restaurant-admin-shell">
        <header className="restaurant-admin-header">
          <Link href="/admin" className="back-link"><ArrowLeft size={17} /> Admin Console</Link>
          <div className="brand"><span>BG</span><div><strong>Restaurant Partners</strong><small>Partner onboarding</small></div></div>
        </header>

        <section className="hero">
          <div className="hero-icon"><Store size={27} /></div>
          <div><p>PARTNER MANAGEMENT</p><h1>Restaurant onboarding</h1><span>Approve a partner, complete the onboarding checklist, test the full order journey, then take the restaurant live.</span></div>
        </section>

        <div className="restaurant-admin-grid">
          <form className="restaurant-card" onSubmit={submit}>
            <div className="card-head"><div><h2>Connect a restaurant</h2><p>Create the restaurant manager account and link it to the restaurant record.</p></div><Plus size={19} /></div>

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
            <div className="card-head"><div><h2>Partner pipeline</h2><p>Every restaurant moves through the same approval, testing and go-live process.</p></div><Store size={19} /></div>
            {loading ? <div className="empty">Loading restaurants…</div> : (
              <div className="partner-list">
                {merchants.map((merchant) => {
                  const count = completedCount(merchant);
                  const isExpanded = expanded === merchant.id;
                  const canGoLive = merchant.approved && count === stages.length;
                  return (
                    <article className="partner-row partner-row-stack" key={merchant.id}>
                      <div className="partner-main">
                        <div className="partner-avatar">{(merchant.business_name || 'R').slice(0, 1).toUpperCase()}</div>
                        <div className="partner-info"><strong>{merchant.business_name}</strong><span>{merchant.branch_count} branch{merchant.branch_count === 1 ? '' : 'es'} · {merchant.cuisine || 'restaurant'}</span><small>{merchant.owner?.full_name ? 'Connected to ' + merchant.owner.full_name : 'No restaurant owner connected'}</small></div>
                        <div className="partner-actions">
                          <span className={merchant.onboarding_status === 'live' ? 'status good' : merchant.approved ? 'status good' : 'status pending'}>{merchant.onboarding_status === 'live' ? 'Live' : merchant.approved ? merchant.onboarding_status : 'Awaiting approval'}</span>
                          {merchant.approved ? <button type="button" className="partner-action reject" onClick={() => updateRestaurant(merchant.id, 'reject')}>Reject</button> : <button type="button" className="partner-action approve" onClick={() => updateRestaurant(merchant.id, 'approve')}>Approve</button>}
                          <button type="button" className="partner-action" onClick={() => setExpanded(isExpanded ? null : merchant.id)}>{isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Workflow</button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="onboarding-panel">
                          <div className="onboarding-summary"><strong>{count}/{stages.length} onboarding steps complete</strong><span>{merchant.onboarding_status === 'live' ? 'Restaurant is live.' : 'Complete every step before going live.'}</span></div>
                          <div className="onboarding-steps">
                            {stages.map(([key, label], index) => {
                              const done = stageDone(merchant, key);
                              return (
                                <div className={done ? 'onboarding-step done' : 'onboarding-step'} key={key}>
                                  <span className="step-number">{done ? '✓' : index + 1}</span>
                                  <div><strong>{label}</strong><small>{done ? 'Completed' : 'Ready to complete'}</small></div>
                                  {!done && merchant.approved && <button type="button" className="partner-action approve" onClick={() => updateRestaurant(merchant.id, 'stage', key)}>Mark complete</button>}
                                </div>
                              );
                            })}
                          </div>
                          <div className="go-live-row">
                            <span>{canGoLive ? 'All checks passed. The restaurant can now receive real customer orders.' : 'Go-live unlocks after all six checks are complete.'}</span>
                            <button type="button" className="restaurant-primary compact" disabled={!canGoLive || merchant.onboarding_status === 'live'} onClick={() => updateRestaurant(merchant.id, 'go_live')}>{merchant.onboarding_status === 'live' ? 'LIVE' : 'Go live'}</button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
