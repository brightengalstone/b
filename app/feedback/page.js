'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MessageSquare, Star, Truck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import './feedback.css';

function FeedbackContent() {
  const params = useSearchParams();
  const orderId = params.get('id');
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [overall, setOverall] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase || !orderId) {
        if (active) { setLoading(false); setError('This feedback link is not valid.'); }
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth?.user;
      if (!currentUser) {
        if (active) { setLoading(false); setError('Please sign in to leave feedback.'); }
        return;
      }
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id,status,driver_id,retailers(name)')
        .eq('id', orderId)
        .eq('customer_id', currentUser.id)
        .single();

      if (orderError || !orderData) {
        if (active) { setLoading(false); setError('We could not find this order.'); }
        return;
      }

      const { data: existing } = await supabase
        .from('delivery_feedback')
        .select('id,overall_rating,driver_rating,delivery_rating,comment')
        .eq('order_id', orderId)
        .maybeSingle();

      if (active) {
        setUser(currentUser);
        setOrder(orderData);
        setFeedback(existing || null);
        if (existing) {
          setOverall(existing.overall_rating || 0);
          setDriverRating(existing.driver_rating || 0);
          setDeliveryRating(existing.delivery_rating || 0);
          setComment(existing.comment || '');
        }
        setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [orderId]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!overall || !driverRating || !deliveryRating) {
      setError('Please rate the overall experience, driver and delivery.');
      return;
    }
    if (!user || !order || order.status !== 'delivered') {
      setError('Feedback can only be submitted after delivery.');
      return;
    }

    setSaving(true);
    const payload = {
      order_id: order.id,
      customer_id: user.id,
      driver_id: order.driver_id || null,
      overall_rating: overall,
      driver_rating: driverRating,
      delivery_rating: deliveryRating,
      comment: comment.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = feedback
      ? await supabase.from('delivery_feedback').update(payload).eq('id', feedback.id)
      : await supabase.from('delivery_feedback').insert(payload);

    if (saveError) {
      setError(saveError.message || 'We could not save your feedback. Please try again.');
      setSaving(false);
      return;
    }

    setDone(true);
    setSaving(false);
  }

  if (loading) return <main className="feedback-page"><div className="feedback-card"><div className="feedback-loading">Loading your delivery…</div></div></main>;

  if (done) return (
    <main className="feedback-page">
      <div className="feedback-shell">
        <Link href="/orders" className="feedback-back"><ArrowLeft size={17}/> My Orders</Link>
        <div className="feedback-card feedback-success">
          <div className="feedback-success-icon"><CheckCircle2 size={42}/></div>
          <span className="feedback-eyebrow">FEEDBACK RECEIVED</span>
          <h1>Thank you for your feedback.</h1>
          <p>Your feedback has been received successfully. It helps BG Smart Services recognise good service and improve the delivery experience.</p>

          {order && (
            <div className="feedback-received-summary">
              <div className="feedback-received-row">
                <span>Order</span>
                <strong>#{String(order.id).slice(0, 8).toUpperCase()}</strong>
              </div>
              <div className="feedback-received-row">
                <span>Overall rating</span>
                <strong className="feedback-received-rating"><Star size={14} fill="currentColor"/> {overall}/5</strong>
              </div>
            </div>
          )}

          <div className="feedback-received-note">
            <CheckCircle2 size={17}/>
            <span>Your feedback is now linked to this delivery.</span>
          </div>

          <div className="feedback-actions">
            <Link className="feedback-primary" href="/orders">Back to My Orders</Link>
            <Link className="feedback-secondary" href="/home">Go to Home</Link>
          </div>
        </div>
      </div>
    </main>
  );

  const delivered = order?.status === 'delivered';

  return (
    <main className="feedback-page">
      <div className="feedback-shell">
        <Link href="/orders" className="feedback-back"><ArrowLeft size={17}/> My Orders</Link>
        <section className="feedback-card">
          <div className="feedback-icon"><Truck size={28}/></div>
          <span className="feedback-eyebrow">DELIVERY COMPLETE</span>
          <h1>How was your delivery?</h1>
          <p className="feedback-intro">Your feedback helps us recognise good service and find problems that need attention.</p>
          {!delivered && <div className="feedback-warning">You can leave feedback once this order has been marked as delivered.</div>}
          {error && <div className="feedback-error">{error}</div>}
          <form onSubmit={submit}>
            <Rating label="Overall experience" value={overall} setValue={setOverall}/>
            <Rating label="Driver" value={driverRating} setValue={setDriverRating}/>
            <Rating label="Delivery" value={deliveryRating} setValue={setDeliveryRating}/>
            <label className="feedback-comment">
              <span><MessageSquare size={15}/> Tell us more <em>Optional</em></span>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="What went well? Is there anything we should improve?" rows={5}/>
            </label>
            <button className="feedback-submit" disabled={saving || !delivered}>
              {saving ? 'Saving feedback…' : feedback ? 'Update Feedback' : 'Submit Feedback'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Rating({ label, value, setValue }) {
  return (
    <div className="feedback-rating">
      <div className="feedback-rating-head"><strong>{label}</strong><span>{value ? `${value}/5` : 'Select a rating'}</span></div>
      <div className="feedback-stars" role="radiogroup" aria-label={label}>
        {[1,2,3,4,5].map((star) => (
          <button type="button" key={star} className={star <= value ? 'is-selected' : ''} onClick={() => setValue(star)} aria-label={`${star} out of 5`}>
            <Star size={27} fill={star <= value ? 'currentColor' : 'none'}/>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return <Suspense fallback={<main className="feedback-page"><div className="feedback-card"><div className="feedback-loading">Loading…</div></div></main>}><FeedbackContent/></Suspense>;
}
