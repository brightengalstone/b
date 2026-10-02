import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const authHeader = request.headers.get('authorization') || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret || !accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(accessToken);
  if (authError || !authData?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile, error: profileError } = await admin.from('profiles').select('id, role').eq('id', authData.user.id).maybeSingle();
  if (profileError || profile?.role !== 'admin') return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const [{ data: profiles, error: profilesError }, { data: addresses, error: addressesError }, { data: orders, error: ordersError }, { data: retailers, error: retailersError }] = await Promise.all([
    admin.from('profiles').select('id, full_name, phone, role, created_at').eq('role', 'customer').order('created_at', { ascending: false }).limit(1000),
    admin.from('customer_addresses').select('customer_id, label, address_line, suburb, instructions, is_default').order('is_default', { ascending: false }),
    admin.from('orders').select('id, customer_id, retailer_id, status, subtotal, delivery_fee, total, delivery_address, payment_method, created_at, updated_at').order('created_at', { ascending: false }).limit(5000),
    admin.from('retailers').select('id, name'),
  ]);
  const failure = profilesError || addressesError || ordersError || retailersError;
  if (failure) return NextResponse.json({ error: failure.message }, { status: 500 });

  const emailById = {};
  for (const customer of profiles || []) {
    const { data: userData } = await admin.auth.admin.getUserById(customer.id);
    if (userData?.user) emailById[customer.id] = userData.user.email || '';
  }

  const addressById = {};
  for (const address of addresses || []) {
    if (!addressById[address.customer_id] || address.is_default) addressById[address.customer_id] = address;
  }

  const shopById = Object.fromEntries((retailers || []).map((shop) => [shop.id, shop.name]));
  const customers = (profiles || []).map((customer) => ({
    ...customer,
    email: emailById[customer.id] || '',
    address: addressById[customer.id] ? [addressById[customer.id].address_line, addressById[customer.id].suburb].filter(Boolean).join(', ') : '',
  }));
  const customerIds = new Set(customers.map((customer) => customer.id));
  const customerOrders = (orders || [])
    .filter((order) => customerIds.has(order.customer_id))
    .map((order) => ({ ...order, shop_name: shopById[order.retailer_id] || 'Shop' }));

  return NextResponse.json({ customers, orders: customerOrders });
}
