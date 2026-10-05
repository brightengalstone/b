'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, History, ShoppingBag, Truck, CheckCircle2, Sparkles, ChevronRight, Clock3 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './rewards.css';

const rewards = [
  { points: 100, credit: 10, title: 'R10 delivery credit', label: 'Quick saving' },
  { points: 200, credit: 20, title: 'R20 delivery credit', label: 'Bigger saving' },
  { points: 300, credit: 30, title: 'R30 delivery credit', label: 'Best value' },
];

export default function RewardsPage() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState({ points: 0, delivery_credit: 0 });
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

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

  async function redeem(pointsToRedeem) {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.rpc('redeem_bg_reward', { p_points: pointsToRedeem });
    if (error) {
      console.error('BG Rewards redemption error:', error);
      const details = [error.message, error.details, error.hint, error.code ? `Code: ${error.code}` : '']
        .filter(Boolean)
        .join(' — ');
      setMessageType('error');
      setMessage(error.message?.includes('NOT_ENOUGH_POINTS')
        ? 'You do not have enough BG Points for that reward yet.'
        : `Redemption error: ${details || 'The reward could not be redeemed.'}`);
    } else {
      setMessageType('success');
      setMessage('Your delivery credit is ready and will be applied automatically at checkout.');
      await load();
    }
    setBusy(false);
  }

  const points = Number(account.points || 0);
  const credit = Number(account.delivery_credit || 0);
  const next = rewards.find((reward) => reward.points > points);
  const progressTarget = next?.points || 300;
  const progress = Math.min(100, Math.round((points / progressTarget) * 100));
  const pointsToNext = next ? Math.max(0, next.points - points) : 0;

  const historyLabel = (reason) => {
    if (reason === 'order_completed') return 'Order completed';
    if (reason === 'reward_redeemed') return 'Reward redeemed';
    if (reason === 'delivery_credit_used') return 'Delivery credit used';
    return 'BG Rewards activity';
  };

  if (!user) return <main className="rewards-page"><div className="rewards-shell"><div className="rewards-loading">Loading BG Rewards...</div></div></main>;

  return (
    <main className="rewards-page">
      <div className="rewards-shell">
        <header className="rewards-topbar">
          <Link href="/account" className="rewards-back"><ArrowLeft size={17} /><span>Account</span></Link>
          <div className="rewards-brand"><span className="brand-mark">BG</span><span>Smart Services</span></div>
        </header>

        <section className="rewards-hero">
          <div className="rewards-hero-copy">
            <div className="rewards-kicker"><Sparkles size={14} /><span>BG REWARDS</span></div>
            <h1>Order more.<br />Get rewarded.</h1>
            <p>Every completed BG Smart Services order helps you earn BG Points that can become real delivery savings.</p>
            <div className="rewards-hero-stats">
              <div><strong>{points}</strong><span>BG Points</span></div>
              <div><strong>R{credit.toFixed(2)}</strong><span>Delivery credit</span></div>
            </div>
          </div>

          <div className="rewards-balance-card">
            <div className="balance-card-top"><span className="balance-icon"><Gift size={21} /></span><span>YOUR BALANCE</span></div>
            <strong>{points}</strong>
            <span className="balance-points-label">BG Points</span>
            <div className="balance-divider" />
            <div className="balance-credit"><Truck size={17} /><span><small>Available delivery credit</small><b>R{credit.toFixed(2)}</b></span></div>
          </div>
        </section>

        {message && <div className={messageType === 'error' ? 'rewards-message error' : 'rewards-message'}><CheckCircle2 size={17} /><span>{message}</span></div>}

        <section className="rewards-progress rewards-panel">
          <div className="rewards-section-head">
            <div><span className="eyebrow">YOUR PROGRESS</span><h2>{next ? 'Your next reward' : 'All rewards unlocked'}</h2></div>
            <strong>{next ? pointsToNext + ' points to go' : '300+ points'}</strong>
          </div>
          <div className="progress-value-row"><span>{points} points</span><span>{progressTarget} points</span></div>
          <div className="reward-progress-track"><span style={{ width: progress + '%' }} /></div>
          <div className="reward-progress-bottom">
            <span>{next ? 'Reach ' + next.points + ' points' : 'Keep earning for future rewards'}</span>
            <b>{next ? next.title : 'R30 delivery credit unlocked'}</b>
          </div>
        </section>

        <section className="rewards-section rewards-panel">
          <div className="rewards-section-head">
            <div><span className="eyebrow">REDEEM YOUR POINTS</span><h2>Choose your reward</h2></div>
            <span>Points can become delivery savings.</span>
          </div>

          <div className="rewards-grid">
            {rewards.map((reward) => {
              const canRedeem = points >= reward.points;
              return (
                <article className={canRedeem ? 'reward-card ready' : 'reward-card'} key={reward.points}>
                  <div className="reward-card-top">
                    <span className="reward-card-icon"><Gift size={19} /></span>
                    {canRedeem && <span className="reward-ready">READY</span>}
                  </div>
                  <span className="reward-card-label">{reward.label}</span>
                  <strong>{reward.title}</strong>
                  <p>Use it automatically toward a future delivery.</p>
                  <div className="reward-card-footer">
                    <span>{reward.points} BG Points</span>
                    <button disabled={!canRedeem || busy} onClick={() => redeem(reward.points)}>
                      {canRedeem ? 'Redeem' : (reward.points - points) + ' more'}
                      {canRedeem && <ChevronRight size={15} />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rewards-how rewards-panel">
          <div className="rewards-section-head"><div><span className="eyebrow">HOW BG REWARDS WORKS</span><h2>Simple. Automatic. Worth it.</h2></div></div>
          <div className="rewards-steps">
            <div><span className="step-number">01</span><ShoppingBag size={19} /><strong>Place an order</strong><p>Order your favourite food through BG Smart Services.</p></div>
            <div><span className="step-number">02</span><Gift size={19} /><strong>Earn BG Points</strong><p>Points are added automatically when your order is delivered.</p></div>
            <div><span className="step-number">03</span><Truck size={19} /><strong>Save on delivery</strong><p>Redeem points and your delivery credit is applied at checkout.</p></div>
          </div>
        </section>

        <section className="rewards-history rewards-panel">
          <div className="rewards-section-head"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Your BG Rewards history</h2></div><History size={19} /></div>

          {!history.length ? (
            <div className="rewards-empty"><Clock3 size={20} /><div><strong>Your rewards activity will appear here.</strong><span>Complete your first BG Smart Services order to start earning.</span></div></div>
          ) : (
            <div className="reward-history-list">
              {history.map((item, index) => {
                const positive = Number(item.points_delta || 0) > 0;
                const pointsDelta = Number(item.points_delta || 0);
                return (
                  <div className="reward-history-row" key={item.created_at + '-' + index}>
                    <span className={positive ? 'history-icon' : 'history-icon spent'}><Gift size={16} /></span>
                    <div><strong>{historyLabel(item.reason)}</strong><small>{new Date(item.created_at).toLocaleDateString('en-ZA')}</small></div>
                    <b className={positive ? 'positive' : 'negative'}>{pointsDelta > 0 ? '+' : ''}{pointsDelta} pts</b>
                  </div>
                );
              })}
            </div>
          )}

          {history.length > 0 && <div className="rewards-history-note"><CheckCircle2 size={15} /><span>Your latest rewards activity is shown above.</span></div>}
        </section>
      </div>
    </main>
  );
}
