'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Check, CheckCheck, CreditCard, PackageCheck, HelpCircle, Info, Truck, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const iconFor = (type) => {
  if (type === 'payment') return CreditCard;
  if (type === 'delivery') return Truck;
  if (type === 'support') return HelpCircle;
  if (type === 'order') return PackageCheck;
  return Info;
};

const labelFor = (type) => {
  if (type === 'payment') return 'Payment';
  if (type === 'delivery') return 'Delivery';
  if (type === 'support') return 'Support';
  if (type === 'order') return 'Order';
  return 'Update';
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

const relativeDate = (value) => {
  const diff = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'Just now';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return minutes + ' min ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + ' hr ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + (days === 1 ? ' day ago' : ' days ago');
  return formatDate(value);
};

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredNotifications = useMemo(
    () => filter === 'unread' ? notifications.filter((item) => !item.read_at) : notifications,
    [notifications, filter]
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
    return (
      <main className="notifications-page">
        <div className="notifications-shell">
          <div className="notifications-skeleton" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="notifications-page">
        <div className="notifications-shell">
          <Link href="/home" className="notifications-back"><ArrowLeft size={17} /> Back to home</Link>
          <section className="notifications-empty-card">
            <div className="notifications-empty-icon"><Bell size={30} /></div>
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
    <main className="notifications-page">
      <div className="notifications-shell">
        <header className="notifications-topbar">
          <Link href="/home" className="notifications-brand">
            <span className="brand-mark">BG</span>
            <span>Smart Services</span>
          </Link>
          <Link href="/account" className="notifications-back"><ArrowLeft size={17} /> Back</Link>
        </header>

        <section className="notifications-hero">
          <div className="notifications-hero-glow notifications-hero-glow-one" />
          <div className="notifications-hero-glow notifications-hero-glow-two" />
          <div className="notifications-hero-copy">
            <div className="notifications-live-label">
              <span className="notifications-live-dot" />
              Live updates
            </div>
            <h1>Your notifications<span>Everything important, in one place.</span></h1>
            <p>Stay up to date with your orders, payments, deliveries and support requests.</p>
            <div className="notifications-metrics">
              <div><strong>{notifications.length}</strong><span>Total updates</span></div>
              <div><strong>{unreadCount}</strong><span>Need your attention</span></div>
            </div>
          </div>
          <div className="notifications-hero-art" aria-hidden="true">
            <div className="notifications-ring notifications-ring-one" />
            <div className="notifications-ring notifications-ring-two" />
            <div className="notifications-bell-orb"><Bell size={38} /></div>
            <span className="notifications-orbit-dot dot-one" />
            <span className="notifications-orbit-dot dot-two" />
            <span className="notifications-orbit-dot dot-three" />
          </div>
        </section>

        <section className="notifications-content">
          <div className="notifications-toolbar">
            <div>
              <span className="eyebrow">{unreadCount} unread</span>
              <h2>Notification centre</h2>
            </div>
            {unreadCount > 0 && (
              <button className="notifications-mark-all" type="button" onClick={markAllRead}>
                <CheckCheck size={16} /> Mark all as read
              </button>
            )}
          </div>

          <div className="notifications-filters">
            <button className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')} type="button">
              All <span>{notifications.length}</span>
            </button>
            <button className={filter === 'unread' ? 'is-active' : ''} onClick={() => setFilter('unread')} type="button">
              Unread <span>{unreadCount}</span>
            </button>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="notifications-empty-icon"><CheckCheck size={27} /></div>
              <h3>{filter === 'unread' ? 'You are all caught up' : 'No notifications yet'}</h3>
              <p>{filter === 'unread' ? 'There are no unread updates waiting for you.' : 'New order, payment, delivery and support updates will appear here automatically.'}</p>
              {filter === 'unread' && notifications.length > 0 && (
                <button className="btn" type="button" onClick={() => setFilter('all')}>View all notifications</button>
              )}
            </div>
          ) : (
            <div className="notifications-feed">
              {filteredNotifications.map((notification) => {
                const Icon = iconFor(notification.type);
                const unread = !notification.read_at;
                return (
                  <article className={'notification-card' + (unread ? ' is-unread' : '')} key={notification.id}>
                    <div className={'notification-icon notification-icon-' + (notification.type || 'info')}>
                      <Icon size={20} />
                    </div>
                    <div className="notification-main">
                      <div className="notification-card-top">
                        <div className="notification-heading">
                          <span className="notification-type">{labelFor(notification.type)}</span>
                          {unread && <span className="notification-new">New</span>}
                        </div>
                        <time title={formatDate(notification.created_at)}>{relativeDate(notification.created_at)}</time>
                      </div>
                      <h3>{notification.title}</h3>
                      <p>{notification.message}</p>
                      <div className="notification-card-bottom">
                        {notification.order_id ? (
                          <Link href={'/track-delivery?order=' + notification.order_id} className="notification-context">
                            View order <ChevronRight size={14} />
                          </Link>
                        ) : <span />}
                        {unread ? (
                          <button className="notification-read" type="button" onClick={() => markRead(notification.id)}>
                            <Check size={15} /> Mark as read
                          </button>
                        ) : (
                          <span className="notification-read-done"><Check size={15} /> Read</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        .notifications-page{min-height:100vh;background:#f5f7fa;color:#111827}
        .notifications-shell{max-width:1120px;margin:auto;padding:28px 24px 80px}
        .notifications-topbar{display:flex;align-items:center;justify-content:space-between}
        .notifications-brand{display:flex;align-items:center;gap:11px;font-weight:850}
        .notifications-back{display:flex;align-items:center;gap:7px;color:#667085;font-size:13px;font-weight:800}
        .notifications-hero{position:relative;min-height:350px;margin:24px 0 28px;padding:45px 50px;display:grid;grid-template-columns:minmax(0,1fr) 310px;align-items:center;gap:30px;overflow:hidden;border:1px solid #dce6df;border-radius:30px;background:linear-gradient(120deg,#111814 0%,#18231d 58%,#102018 100%);box-shadow:0 24px 60px rgba(16,32,24,.13)}
        .notifications-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 34%,rgba(6,193,103,.055) 34%,rgba(6,193,103,.055) 56%,transparent 56%);pointer-events:none}
        .notifications-hero-copy{position:relative;z-index:2}
        .notifications-live-label{display:flex;align-items:center;gap:8px;width:max-content;padding:7px 10px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.05);border-radius:999px;color:#b9c5be;font-size:9px;font-weight:900;letter-spacing:.8px;text-transform:uppercase}
        .notifications-live-dot{width:7px;height:7px;border-radius:50%;background:#06c167;box-shadow:0 0 0 5px rgba(6,193,103,.12);animation:notificationsPulse 1.8s infinite}
        .notifications-hero h1{margin:18px 0 12px;color:#fff;font-size:clamp(43px,5.3vw,64px);line-height:.96;letter-spacing:-3.3px}
        .notifications-hero h1 span{display:block;margin-top:10px;color:#9eaaa2;font-size:.48em;line-height:1.15;letter-spacing:-1px;font-weight:650}
        .notifications-hero p{max-width:560px;margin:0;color:#aeb9b2;font-size:13px;line-height:1.65}
        .notifications-metrics{display:flex;gap:9px;margin-top:24px}
        .notifications-metrics>div{display:flex;align-items:baseline;gap:7px;padding:9px 12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);border-radius:13px}
        .notifications-metrics strong{color:#fff;font-size:16px}.notifications-metrics span{color:#89968e;font-size:9px;font-weight:750}
        .notifications-hero-art{position:relative;z-index:2;width:270px;height:270px;justify-self:end;display:grid;place-items:center}
        .notifications-ring{position:absolute;border:1px solid rgba(6,193,103,.22);border-radius:50%}
        .notifications-ring-one{width:205px;height:205px;border-style:dashed;animation:notificationsSpin 18s linear infinite}
        .notifications-ring-two{width:145px;height:145px;border-color:rgba(255,255,255,.09);animation:notificationsSpinReverse 13s linear infinite}
        .notifications-bell-orb{width:88px;height:88px;border-radius:27px;display:grid;place-items:center;background:#06c167;color:#fff;box-shadow:0 0 0 10px rgba(6,193,103,.1),0 20px 48px rgba(0,0,0,.32);animation:notificationsFloat 3s ease-in-out infinite}
        .notifications-orbit-dot{position:absolute;width:9px;height:9px;border-radius:50%;background:#06c167;box-shadow:0 0 0 5px rgba(6,193,103,.1)}
        .notifications-orbit-dot.dot-one{top:31px;left:54px}.notifications-orbit-dot.dot-two{right:25px;top:112px}.notifications-orbit-dot.dot-three{bottom:42px;left:79px}
        .notifications-content{max-width:900px;margin:0 auto}
        .notifications-toolbar{display:flex;align-items:end;justify-content:space-between;gap:20px;margin:0 0 15px}
        .notifications-toolbar h2{margin:7px 0 0;font-size:27px;letter-spacing:-1.1px}
        .notifications-mark-all,.notification-read{display:flex;align-items:center;gap:7px;border:1px solid #dfe4e0;background:#fff;border-radius:11px;padding:10px 13px;color:#344054;font-size:11px;font-weight:850;box-shadow:0 4px 12px rgba(16,24,40,.04)}
        .notifications-filters{display:flex;gap:4px;width:max-content;padding:4px;margin-bottom:13px;background:#eef0f2;border-radius:11px}
        .notifications-filters button{display:flex;align-items:center;gap:7px;padding:8px 12px;border-radius:8px;color:#667085;font-size:10px;font-weight:850}
        .notifications-filters button.is-active{background:#fff;color:#111827;box-shadow:0 2px 6px rgba(16,24,40,.08)}
        .notifications-filters button span{min-width:17px;height:17px;padding:0 4px;display:grid;place-items:center;border-radius:99px;background:#e9f8f1;color:#078b4b;font-size:8px}
        .notifications-feed{display:grid;gap:11px}
        .notification-card{display:flex;gap:15px;padding:17px 18px;background:#fff;border:1px solid #e2e6ea;border-radius:17px;box-shadow:0 7px 24px rgba(16,24,40,.045);transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
        .notification-card:hover{transform:translateY(-2px);border-color:#cfd6d1;box-shadow:0 12px 30px rgba(16,24,40,.07)}
        .notification-card.is-unread{border-left:3px solid #06c167;padding-left:16px;background:linear-gradient(90deg,#fbfffc,#fff)}
        .notification-icon{width:45px;height:45px;flex:none;border-radius:13px;display:grid;place-items:center}
        .notification-icon-order{background:#eef4ff;color:#315d9b}.notification-icon-delivery{background:#eaf8f0;color:#078b4b}.notification-icon-payment{background:#fff5e9;color:#b76b00}.notification-icon-support{background:#f3efff;color:#6b4db3}.notification-icon-info{background:#f1f3f5;color:#56615a}
        .notification-main{min-width:0;flex:1}
        .notification-card-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .notification-heading{display:flex;align-items:center;gap:7px}.notification-type{font-size:8px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#7b8494}.notification-new{padding:3px 6px;border-radius:99px;background:#e9f8f1;color:#078b4b;font-size:7px;font-weight:900;text-transform:uppercase}
        .notification-card time{font-size:9px;color:#89938d;white-space:nowrap}
        .notification-card h3{margin:7px 0 4px;font-size:14px;letter-spacing:-.2px;color:#18231d}
        .notification-card p{margin:0;color:#667085;font-size:11px;line-height:1.55}
        .notification-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:13px;padding-top:11px;border-top:1px solid #edf0f2}
        .notification-context{display:flex;align-items:center;gap:3px;color:#087a42;font-size:10px;font-weight:900}
        .notification-read{padding:7px 10px;border-radius:9px;box-shadow:none;background:#fff;font-size:9px}
        .notification-read-done{display:flex;align-items:center;gap:5px;color:#89938d;font-size:9px;font-weight:800}
        .notifications-empty,.notifications-empty-card{background:#fff;border:1px solid #e2e6ea;border-radius:22px;box-shadow:0 15px 45px rgba(16,24,40,.05);text-align:center}
        .notifications-empty{padding:50px 25px}.notifications-empty-card{max-width:680px;margin:70px auto;padding:50px 30px}
        .notifications-empty-icon{width:66px;height:66px;border-radius:21px;background:#eef8f2;color:#078b4b;display:grid;place-items:center;margin:0 auto 18px}
        .notifications-empty h3,.notifications-empty-card h1{margin:10px 0;font-size:30px;letter-spacing:-1.2px}
        .notifications-empty p,.notifications-empty-card p{max-width:510px;margin:0 auto 22px;color:#667085;line-height:1.6;font-size:12px}
        .notifications-skeleton{height:430px;border-radius:30px;background:linear-gradient(90deg,#fff 25%,#eef1ef 50%,#fff 75%);background-size:200% 100%;animation:notificationsShimmer 1.5s infinite;border:1px solid #e2e6ea}
        @keyframes notificationsPulse{70%{box-shadow:0 0 0 9px rgba(6,193,103,0)}100%{box-shadow:0 0 0 0 rgba(6,193,103,0)}}@keyframes notificationsSpin{to{transform:rotate(345deg)}}@keyframes notificationsSpinReverse{to{transform:rotate(-360deg)}}@keyframes notificationsFloat{50%{transform:translateY(-7px)}}@keyframes notificationsShimmer{to{background-position:-200% 0}}
        @media(max-width:800px){.notifications-hero{grid-template-columns:1fr;padding:34px 28px;min-height:0}.notifications-hero-art{display:none}.notifications-hero h1{font-size:48px}}
        @media(max-width:560px){.notifications-shell{padding:22px 15px 60px}.notifications-hero{margin:16px 0 22px;padding:28px 20px 24px;border-radius:23px}.notifications-hero h1{font-size:40px;letter-spacing:-2.4px}.notifications-hero h1 span{font-size:.56em}.notifications-hero p{font-size:11px}.notifications-metrics{display:grid;grid-template-columns:1fr 1fr}.notifications-metrics>div{display:grid;gap:2px}.notifications-toolbar{align-items:start}.notifications-toolbar h2{font-size:24px}.notifications-mark-all{font-size:9px;padding:9px}.notifications-filters{width:100%}.notifications-filters button{flex:1;justify-content:center}.notification-card{padding:14px;gap:11px}.notification-card.is-unread{padding-left:12px}.notification-icon{width:40px;height:40px;border-radius:11px}.notification-card h3{font-size:13px}.notification-card p{font-size:10px}.notification-card-bottom{align-items:flex-end}.notification-read{font-size:8px}.notification-card time{font-size:8px}}
      `}</style>
    </main>
  );
}
