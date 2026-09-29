'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Check, CheckCheck, CreditCard, PackageCheck, HelpCircle, Info, Truck } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const iconFor = (type) => {
  if (type === 'payment') return CreditCard;
  if (type === 'delivery') return Truck;
  if (type === 'support') return HelpCircle;
  if (type === 'order') return PackageCheck;
  return Info;
};

const formatDate = (value) => {
  try {
    return new Intl.DateTimeFormat('en-ZA', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(value));
  } catch {
    return '';
  }
};

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications(userId) {
    const { data } = await supabase
      .from('notifications')
      .select('id,type,title,message,order_id,support_request_id,read_at,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    let channel;

    async function boot() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      const currentUser = data.user || null;
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }

      await loadNotifications(currentUser.id);
      if (!active) return;

      channel = supabase
        .channel('customer-notifications-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=eq.' + currentUser.id,
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((current) => [payload.new, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((current) => current.map((item) => item.id === payload.new.id ? payload.new : item));
          } else if (payload.eventType === 'DELETE') {
            setNotifications((current) => current.filter((item) => item.id !== payload.old.id));
          }
        })
        .subscribe();
    }

    boot();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read_at).length,
    [notifications]
  );

  async function markRead(id) {
    const readAt = new Date().toISOString();
    const { error } = await supabase.from('notifications').update({ read_at: readAt }).eq('id', id);
    if (!error) {
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, read_at: readAt } : item));
    }
  }

  async function markAllRead() {
    if (!user || unreadCount === 0) return;
    const readAt = new Date().toISOString();
    const { error } = await supabase.from('notifications').update({ read_at: readAt }).eq('user_id', user.id).is('read_at', null);
    if (!error) {
      setNotifications((current) => current.map((item) => item.read_at ? item : { ...item, read_at: readAt }));
    }
  }

  if (loading) {
    return <main className="account-page"><div className="account-shell"><div className="account-skeleton" /></div></main>;
  }

  if (!user) {
    return (
      <main className="account-page">
        <div className="account-shell">
          <Link href="/home" className="account-back"><ArrowLeft size={17} /> Back to home</Link>
          <section className="account-signin-card">
            <div className="account-profile-icon"><Bell size={30} /></div>
            <div className="eyebrow">BG Smart Services</div>
            <h1>Sign in to view notifications</h1>
            <p>Stay updated about your orders, payments, deliveries and support requests.</p>
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
          <Link href="/account" className="account-back"><ArrowLeft size={17} /> Back</Link>
        </header>

        <section className="account-hero">
          <div>
            <div className="eyebrow">Stay informed</div>
            <h1>Notifications</h1>
            <p>Updates about your orders, payments, deliveries and support.</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn" type="button" onClick={markAllRead}>
              <CheckCheck size={17} /> Mark all as read
            </button>
          )}
        </section>

        <section className="account-section">
          <div className="account-section-head">
            <div>
              <span className="eyebrow">{unreadCount} unread</span>
              <h2>Notification history</h2>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="account-signin-card">
              <div className="account-profile-icon"><Bell size={28} /></div>
              <h2>You’re all caught up</h2>
              <p>New order and support updates will appear here automatically.</p>
            </div>
          ) : (
            <div className="account-list">
              {notifications.map((notification) => {
                const Icon = iconFor(notification.type);
                const unread = !notification.read_at;
                return (
                  <div className="account-list-row" key={notification.id} style={{ opacity: unread ? 1 : 0.72 }}>
                    <span className="account-link-icon"><Icon size={19} /></span>
                    <span style={{ flex: 1 }}>
                      <strong>{notification.title}</strong>
                      <small>{notification.message}</small>
                      <small>{formatDate(notification.created_at)}</small>
                    </span>
                    {unread ? (
                      <button className="account-edit" type="button" onClick={() => markRead(notification.id)} aria-label="Mark notification as read">
                        <Check size={17} /><span>Read</span>
                      </button>
                    ) : (
                      <span className="account-link-icon" aria-label="Read"><Check size={17} /></span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
