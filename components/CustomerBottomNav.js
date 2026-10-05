'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, ShoppingCart, ClipboardList, UserRound } from 'lucide-react';

const ITEMS = [
  { href: '/home', label: 'Home', Icon: Home },
  { href: '/marketplace', label: 'Browse', Icon: Store },
  { href: '/cart', label: 'Cart', Icon: ShoppingCart },
  { href: '/orders', label: 'Orders', Icon: ClipboardList },
  { href: '/account', label: 'Account', Icon: UserRound },
];

export default function CustomerBottomNav() {
  const pathname = usePathname();
  if (!pathname || pathname === '/' || pathname === '/signin' || pathname.startsWith('/driver') || pathname.startsWith('/admin') || pathname.startsWith('/restaurant') || pathname.startsWith('/api')) return null;
  return <nav className="customer-bottom-nav" aria-label="Main navigation"><div className="customer-bottom-nav-inner">{ITEMS.map(({ href, label, Icon }) => { const active = pathname === href || (href !== '/home' && pathname.startsWith(href + '/')); return <Link key={href} href={href} className={active ? 'customer-bottom-nav-item active' : 'customer-bottom-nav-item'} aria-current={active ? 'page' : undefined}><span className="customer-bottom-nav-icon"><Icon size={21} strokeWidth={active ? 2.4 : 1.9} /></span><span>{label}</span></Link>; })}</div></nav>;
}
