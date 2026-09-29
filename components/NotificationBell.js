'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function NotificationBell({ className = '' }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    let channel;

    async function load() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!active || !user) return;

      const refresh = async () => {
        const { count } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('read_at', null);
        if (active) setUnread(Number(count || 0));
      };

      await refresh();

      channel = supabase
        .channel('customer-notification-bell-' + user.id)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=eq.' + user.id,
        }, refresh)
        .subscribe();
    }

    load();

    return () => {
      active = false;
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link
      href="/account/notifications"
      className={'notification-bell ' + className}
      aria-label={unread ? 'Notifications, ' + unread + ' unread' : 'Notifications'}
      title="Notifications"
    >
      <Bell size={19} />
      {unread > 0 && <span className="notification-bell-dot" aria-label={unread + ' unread notifications'} />}
    </Link>
  );
}
