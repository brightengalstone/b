import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) return null;
  return createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function requireAdmin(request) {
  const admin = adminClient();
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!admin || !token) return { admin: null, user: null, error: 'Unauthorized', status: 401 };
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { admin: null, user: null, error: 'Unauthorized', status: 401 };
  const { data: profile, error: profileError } = await admin.from('profiles').select('id, role').eq('id', data.user.id).maybeSingle();
  if (profileError || profile?.role !== 'admin') return { admin: null, user: null, error: 'Administrator access required', status: 403 };
  return { admin, user: data.user, error: null, status: 200 };
}

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data: merchants, error } = await auth.admin
    .from('merchants')
    .select('id, business_name, description, phone, address, approved, active, slug, cuisine, owner_id, created_at')
    .order('business_name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: locations } = await auth.admin
    .from('merchant_locations')
    .select('id, merchant_id, name, address, phone, active, display_order')
    .order('display_order');

  const ownerIds = [...new Set((merchants || []).map((m) => m.owner_id).filter(Boolean))];
  const ownerProfiles = ownerIds.length
    ? (await auth.admin.from('profiles').select('id, full_name, phone').in('id', ownerIds)).data || []
    : [];
  const ownerById = Object.fromEntries(ownerProfiles.map((p) => [p.id, p]));

  const locationCount = {};
  for (const location of locations || []) locationCount[location.merchant_id] = (locationCount[location.merchant_id] || 0) + 1;

  return NextResponse.json({
    merchants: (merchants || []).map((merchant) => ({
      ...merchant,
      branch_count: locationCount[merchant.id] || 0,
      owner: merchant.owner_id ? ownerById[merchant.owner_id] || null : null,
    })),
  });
}

export async function PATCH(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }

  const merchantId = String(body?.merchant_id || '').trim();
  const action = String(body?.action || '').trim().toLowerCase();
  if (!merchantId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Restaurant and approval action are required.' }, { status: 400 });
  }

  const update = action === 'approve'
    ? { approved: true, active: true }
    : { approved: false, active: false };

  const { data, error } = await auth.admin
    .from('merchants')
    .update(update)
    .eq('id', merchantId)
    .select('id, business_name, approved, active, owner_id')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Restaurant record not found.' }, { status: 404 });

  return NextResponse.json({ ok: true, merchant: data });
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }

  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const fullName = String(body?.full_name || '').trim();
  const phone = String(body?.phone || '').trim();
  const merchantId = String(body?.merchant_id || '').trim();
  const businessName = String(body?.business_name || '').trim();
  const branchName = String(body?.branch_name || '').trim();
  const branchAddress = String(body?.branch_address || '').trim();

  if (!email || !password || !fullName) return NextResponse.json({ error: 'Full name, email and password are required.' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  if (!merchantId && !businessName) return NextResponse.json({ error: 'Select an existing restaurant or enter a new restaurant name.' }, { status: 400 });

  const { data: created, error: createError } = await auth.admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'merchant' },
  });

  if (createError || !created?.user) {
    return NextResponse.json({ error: createError?.message || 'Unable to create restaurant login.' }, { status: 400 });
  }

  const ownerId = created.user.id;
  const { error: profileError } = await auth.admin.from('profiles').upsert({
    id: ownerId,
    full_name: fullName,
    phone: phone || null,
    role: 'merchant',
  });

  if (profileError) {
    await auth.admin.auth.admin.deleteUser(ownerId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  let finalMerchantId = merchantId;
  if (merchantId) {
    const { error: merchantError } = await auth.admin
      .from('merchants')
      .update({ owner_id: ownerId, approved: true, active: true })
      .eq('id', merchantId);
    if (merchantError) {
      await auth.admin.auth.admin.deleteUser(ownerId);
      return NextResponse.json({ error: merchantError.message }, { status: 500 });
    }
  } else {
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + ownerId.slice(0, 6);
    const { data: merchant, error: merchantError } = await auth.admin
      .from('merchants')
      .insert({
        owner_id: ownerId,
        business_name: businessName,
        phone: phone || null,
        address: branchAddress || null,
        approved: true,
        active: true,
        slug,
        cuisine: 'fast_food',
      })
      .select('id')
      .single();
    if (merchantError || !merchant) {
      await auth.admin.auth.admin.deleteUser(ownerId);
      return NextResponse.json({ error: merchantError?.message || 'Unable to create restaurant.' }, { status: 500 });
    }
    finalMerchantId = merchant.id;
  }

  if (branchName) {
    const { error: branchError } = await auth.admin.from('merchant_locations').insert({
      merchant_id: finalMerchantId,
      name: branchName,
      address: branchAddress || null,
      phone: phone || null,
      active: true,
    });
    if (branchError) return NextResponse.json({ error: branchError.message, warning: 'Account was created but the branch could not be added.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, merchant_id: finalMerchantId, owner_id: ownerId });
}
