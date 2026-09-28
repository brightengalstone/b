'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Banknote, Check, CreditCard, Landmark, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const methodInfo = {
  cash_on_delivery: { title: 'Cash on Delivery', text: 'Pay the driver when your order arrives.', icon: Banknote },
  card: { title: 'Card', text: 'Secure online card payment.', icon: CreditCard },
  eft: { title: 'EFT', text: 'Pay by electronic bank transfer.', icon: Landmark },
};

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [selected, setSelected] = useState('cash_on_delivery');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('payment_methods').select('id,method_type,display_label,last4,is_default,created_at').eq('customer_id', user.id).order('is_default',{ascending:false}).order('created_at',{ascending:false});
    setMethods(data || []);
    const defaultMethod = (data || []).find(x => x.is_default);
    if (defaultMethod) setSelected(defaultMethod.method_type);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function choose(type) {
    setSelected(type);
    setSaving(true);
    setMessage('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage('Please sign in first.'); setSaving(false); return; }

    await supabase.from('payment_methods').update({ is_default: false }).eq('customer_id', user.id);
    const existing = methods.find(x => x.method_type === type);
    if (existing) {
      await supabase.from('payment_methods').update({ is_default: true }).eq('id', existing.id);
    } else {
      const info = methodInfo[type];
      await supabase.from('payment_methods').insert({ customer_id: user.id, method_type: type, display_label: info.title, is_default: true });
    }
    await load();
    setSaving(false);
    setMessage('Default payment method saved.');
  }

  async function remove(id) {
    await supabase.from('payment_methods').delete().eq('id', id);
    await load();
  }

  if (loading) return <main className="payment-page"><div className="payment-shell"><div className="payment-loading">Loading payment methods…</div></div></main>;

  return (
    <main className="payment-page">
      <div className="payment-shell">
        <header className="payment-top">
          <Link href="/account" className="payment-brand"><span className="brand-mark">BG</span><span>Smart Services</span></Link>
          <Link href="/account" className="payment-back"><ArrowLeft size={17} /> Back to account</Link>
        </header>

        <section className="payment-hero">
          <div><div className="eyebrow">Account settings</div><h1>Payment Methods</h1><p>Choose the payment method you want to use at checkout.</p></div>
        </section>

        <section className="payment-card">
          <div className="payment-card-head"><div><div className="eyebrow">Available methods</div><h2>How would you like to pay?</h2></div><ShieldCheck size={21} /></div>

          <div className="payment-options">
            {Object.entries(methodInfo).map(([type, info]) => {
              const Icon = info.icon;
              const active = selected === type;
              return <button type="button" key={type} className={'payment-option' + (active ? ' active' : '')} onClick={() => choose(type)} disabled={saving}>
                <span className="payment-option-icon"><Icon size={21} /></span>
                <span><strong>{info.title}</strong><small>{info.text}</small></span>
                <span className="payment-option-check">{active && <Check size={15} />}</span>
              </button>;
            })}
          </div>

          {message && <div className="payment-message">{message}</div>}

          <div className="payment-saved">
            <div className="payment-card-head"><div><div className="eyebrow">Saved</div><h2>Your saved options</h2></div><Plus size={19} /></div>
            {methods.length === 0 ? <p className="payment-empty">No saved payment methods yet. Select one above to save it as your default.</p> :
              <div className="payment-saved-list">{methods.map(item => { const info=methodInfo[item.method_type] || methodInfo.cash_on_delivery; const Icon=info.icon; return <div className="payment-saved-row" key={item.id}><span className="payment-option-icon"><Icon size={19}/></span><span><strong>{item.display_label}</strong><small>{item.is_default ? 'Default payment method' : 'Saved payment method'}</small></span><button type="button" onClick={()=>remove(item.id)} aria-label="Remove payment method"><Trash2 size={17}/></button></div>; })}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
