'use client';
import './help.css';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, HelpCircle, MessageSquare, Package, Send, ShoppingBag, CreditCard, Truck, UserRound, Wrench, MoreHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const categories = [
  { value: 'order', label: 'Order' },
  { value: 'payment', label: 'Payment' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'account', label: 'Account' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'other', label: 'Other' },
];

export default function HelpPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [category, setCategory] = useState('order');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (!active) return;
      if (!auth.user) { setLoading(false); return; }
      setUser(auth.user);

      const [{ data: orderRows }, { data: requestRows }] = await Promise.all([
        supabase.from('orders').select('id,status,created_at,total').eq('customer_id', auth.user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('support_requests').select('id,order_id,category,message,status,admin_reply,created_at').eq('customer_id', auth.user.id).order('created_at', { ascending: false }).limit(10),
      ]);

      if (!active) return;
      setOrders(orderRows || []);
      setRequests(requestRows || []);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  const selectedCategory = useMemo(() => categories.find((item) => item.value === category), [category]);

  async function submit(event) {
    event.preventDefault();
    setSuccess('');
    setError('');
    const trimmed = message.trim();
    if (trimmed.length < 5) {
      setError('Please enter at least 5 characters so our support team can understand the issue.');
      return;
    }

    setSending(true);
    const { error: insertError } = await supabase.from('support_requests').insert({
      customer_id: user.id,
      order_id: orderId || null,
      category,
      message: trimmed,
    });

    if (insertError) {
      setError(insertError.message || 'We could not send your support request. Please try again.');
      setSending(false);
      return;
    }

    setMessage('');
    setOrderId('');
    setSuccess('Your support request has been sent. Our team can now review it.');
    const { data } = await supabase.from('support_requests').select('id,order_id,category,message,status,admin_reply,created_at').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(10);
    setRequests(data || []);
    setSending(false);
  }

  if (loading) return <main className="account-page"><div className="account-shell"><div className="account-skeleton" /></div></main>;

  if (!user) return (
    <main className="account-page"><div className="account-shell">
      <Link href="/home" className="account-back"><ArrowLeft size={17} /> Back to home</Link>
      <section className="account-signin-card">
        <div className="account-profile-icon"><HelpCircle size={30} /></div>
        <div className="eyebrow">BG Smart Services</div>
        <h1>Contact Support</h1>
        <p>Sign in to contact support and view your previous support requests.</p>
        <Link className="btn btn-primary btn-large" href="/signin">Sign in</Link>
      </section>
    </div></main>
  );

  return (
    <main className="account-page">
      <div className="account-shell">
        <header className="account-topbar">
          <Link href="/home" className="account-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link>
          <Link href="/account" className="account-back"><ArrowLeft size={17} /> My Account</Link>
        </header>

        <section className="account-hero">
          <div><div className="eyebrow">Help & Support</div><h1>Contact Support</h1><p>Tell us what you need help with and our team will review your request.</p></div>
        </section>

        <div className="support-layout">
          <section className="account-section support-form-card">
            <div className="account-section-head"><div><span className="eyebrow">New request</span><h2>How can we help?</h2></div><span className="support-icon"><MessageSquare size={20} /></span></div>
            <form className="support-form" onSubmit={submit}>
              <label>Support category
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label>Related order <span className="support-optional">Optional</span>
                <select value={orderId} onChange={(event) => setOrderId(event.target.value)}>
                  <option value="">Not related to a specific order</option>
                  {orders.map((order) => <option value={order.id} key={order.id}>Order #{order.id.slice(0, 8).toUpperCase()} · {order.status}</option>)}
                </select>
              </label>
              <label>Your message
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what happened and how we can help..." rows={6} maxLength={2000} />
                <span className="support-count">{message.length}/2000</span>
              </label>
              {error && <div className="support-error">{error}</div>}
              {success && <div className="support-success"><CheckCircle2 size={18} /> {success}</div>}
              <button className="btn btn-primary btn-large support-submit" type="submit" disabled={sending}><Send size={18} /> {sending ? 'Sending...' : 'Send Support Request'}</button>
            </form>
          </section>

          <section className="account-section support-history-card">
            <div className="account-section-head"><div><span className="eyebrow">Your requests</span><h2>Support history</h2></div></div>
            {requests.length === 0 ? (
              <div className="support-empty"><HelpCircle size={24} /><p>No support requests yet.</p><small>Your requests will appear here after you contact our team.</small></div>
            ) : (
              <div className="support-history">
                {requests.map((request) => (
                  <article className="support-request" key={request.id}>
                    <div className="support-request-top"><strong>{categories.find((item) => item.value === request.category)?.label || 'Support'}</strong><span className={'support-status support-status-' + request.status}>{request.status.replace('_', ' ')}</span></div>
                    <p>{request.message}</p>
                    {request.order_id && <small><Package size={14} /> Order #{request.order_id.slice(0, 8).toUpperCase()}</small>}
                    {request.admin_reply && <div className="support-reply"><strong>BG Smart Services</strong><p>{request.admin_reply}</p></div>}
                    <time>{new Date(request.created_at).toLocaleString('en-ZA')}</time>
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
