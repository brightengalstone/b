'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, History, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './rewards.css';

const rewards = [
  { points: 100, credit: 10, title: 'R10 delivery credit' },
  { points: 200, credit: 20, title: 'R20 delivery credit' },
  { points: 300, credit: 30, title: 'R30 delivery credit' },
];

export default function RewardsPage() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState({ points: 0, delivery_credit: 0 });
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/signin'; return; }
    setUser(user);
    const [{ data: accountRow }, { data: transactions }] = await Promise.all([
      supabase.from('reward_accounts').select('points,delivery_credit').eq('customer_id', user.id).maybeSingle(),
      supabase.from('reward_transactions').select('points_delta,credit_delta,reason,created_at').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(20),
    ]);
    setAccount(accountRow || { points: 0, delivery_credit: 0 });
    setHistory(transactions || []);
  }

  useEffect(() => { load(); }, []);

  async function redeem(points) {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.rpc('redeem_bg_reward', { p_points: points });
    if (error) setMessage(error.message.includes('NOT_ENOUGH_POINTS') ? 'You do not have enough BG Points for that reward yet.' : 'We could not redeem that reward. Please try again.');
    else {
      setMessage('Reward added to your BG delivery credits. It will be available automatically at checkout.');
      await load();
    }
    setBusy(false);
  }

  const points = Number(account.points || 0);
  const next = rewards.find(r => r.points > points) || rewards[rewards.length - 1];
  const previous = rewards.filter(r => r.points <= points).pop();
  const progressTarget = next?.points || 300;
  const progress = Math.min(100, Math.round((points / progressTarget) * 100));

  if (!user) return <main className="rewards-page"><div className="rewards-shell"><div className="rewards-loading">Loading BG Rewards…</div></div></main>;

  return (
    <main className="rewards-page">
      <div className="rewards-shell">
        <header className="rewards-topbar">
          <Link href="/account" className="rewards-back"><ArrowLeft size={17} /> Account</Link>
          <div className="rewards-brand"><span className="brand-mark">BG</span><span>Smart Services</span></div>
        </header>

        <section className="rewards-hero">
          <div>
            <span className="eyebrow">BG REWARDS</span>
            <h1>Every order gives you something back.</h1>
            <p>Complete deliveries, earn BG Points and turn your points into delivery credit.</p>
          </div>
          <div className="rewards-points-card">
            <span className="rewards-icon"><Gift size={22} /></span>
            <small>Your BG Points</small>
            <strong>{points}</strong>
            <span>points</span>
          </div>
        </section>

        {message && <div className="rewards-message"><CheckCircle2 size={17} /> {message}</div>}

        <section className="rewards-credit-card">
          <div><Truck size={20} /><span><small>Available delivery credit</small><strong>R{Number(account.delivery_credit || 0).toFixed(2)}</strong></span></div>
          <p>Use your saved credit automatically on a future delivery.</p>
        </section>

        <section className="rewards-progress">
          <div className="rewards-section-head"><div><span className="eyebrow">KEEP GOING</span><h2>Your next reward</h2></div><strong>{Math.max(0, progressTarget - points)} points to go</strong></div>
          <div className="reward-progress-track"><span style={{ width: progress + '%' }} /></div>
          <div className="reward-progress-labels"><span>{previous ? previous.title : 'Start earning'}</span><span>{next.title}</span></div>
        </section>

        <section className="rewards-section">
          <div className="rewards-section-head"><div><span className="eyebrow">REDEEM</span><h2>Choose your reward</h2></div><span>More orders = more savings</span></div>
          <div className="rewards-grid">
            {rewards.map(reward => {
              const canRedeem = points >= reward.points;
              return (
                <article className={canRedeem ? 'reward-card ready' : 'reward-card'} key={reward.points}>
                  <div className="reward-card-icon"><Gift size={20} /></div>
                  <div><strong>{reward.title}</strong><span>{reward.points} BG Points</span></div>
                  <button disabled={!canRedeem || busy} onClick={() => redeem(reward.points)}>
                    {canRedeem ? 'Redeem' : reward.points - points + ' more'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rewards-how">
          <div className="rewards-section-head"><div><span className="eyebrow">HOW IT WORKS</span><h2>Simple rewards</h2></div></div>
          <div className="rewards-steps">
            <div><span>01</span><ShoppingBag size={19} /><strong>Order</strong><p>Complete a BG Smart Services order.</p></div>
            <div><span>02</span><Gift size={19} /><strong>Earn</strong><p>Get at least 10 BG Points when your order is delivered.</p></div>
            <div><span>03</span><Truck size={19} /><strong>Save</strong><p>Redeem points for delivery credit on your next order.</p></div>
          </div>
        </section>

        <section className="rewards-history">
          <div className="rewards-section-head"><div><span className="eyebrow">ACTIVITY</span><h2>Points history</h2></div><History size={19} /></div>
          {!history.length ? <p className="rewards-empty">Your completed orders will appear here.</p> : history.map((item, index) => (
            <div className="reward-history-row" key={index}>
              <span className={item.points_delta < 0 ? 'history-icon spent' : 'history-icon'}><Gift size={16} /></span>
              <div><strong>{item.reason === 'order_completed' ? 'Completed order' : item.reason === 'reward_redeemed' ? 'Reward redeemed' : 'Delivery credit used'}</strong><small>{new Date(item.created_at).toLocaleDateString('en-ZA')}</small></div>
              <b className={item.points_delta < 0 ? 'negative' : ''}>{item.points_delta > 0 ? '+' : ''}{item.points_delta} pts</b>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
