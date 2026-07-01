import { supabase } from '../config/supabase';
import { fmtSize, makeRef } from '../utils/helpers';
import { PAYSTACK_KEY } from '../utils/constants';

// Row Mappers
function rowToBundle(r) {
  const sg = Number(r.size_gb);
  return {
    id:          r.id,
    name:        r.name,
    size:        fmtSize(sg),
    size_gb:     sg,
    price:       Number(r.price),
    network:     r.network,
    storeId:     r.store_id,
    vendorName:  r.store?.name ?? 'Unknown',
    image:       r.image_url ?? null,
    description: r.description ?? null,
    validity:    r.validity,
    isActive:    r.is_active,
    createdAt:   r.created_at,
  };
}

function rowToStore(r) {
  return {
    id:          r.id,
    name:        r.name,
    slug:        r.slug,
    description: r.description ?? '',
    logo:        r.logo_url ?? null,
    accentColor: r.accent_color ?? '#38BDF8',
    whatsapp:    r.whatsapp ?? null,
    ownerId:     r.owner_id,
    isActive:    r.is_active,
    createdAt:   r.created_at,
  };
}

function rowToOrder(r) {
  return {
    id:                r.id,
    bundleId:          r.bundle_id,
    storeId:           r.store_id,
    customerPhone:     r.customer_phone,
    amount:            Number(r.amount),
    status:            r.status,
    paystackReference: r.paystack_reference,
    deliveryReference: r.delivery_reference ?? null,
    paymentMethod:     r.payment_method ?? 'paystack',
    createdAt:         r.created_at,
  };
}

function rowToWallet(r) {
  return {
    id:        r.id,
    userId:    r.user_id,
    balance:   Number(r.balance),
    updatedAt: r.updated_at,
  };
}

// Bundle queries
export async function fetchBundles(network, limit = 50) {
  let q = supabase
    .from('bundles')
    .select('*, store:stores(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (network && network !== 'All') q = q.eq('network', network);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToBundle);
}

export async function fetchBundleById(id) {
  const { data, error } = await supabase
    .from('bundles')
    .select('*, store:stores(id, name, slug, accent_color, whatsapp, logo_url)')
    .eq('id', id)
    .single();
  if (error) return null;
  return rowToBundle(data);
}

export async function fetchBundlesByStore(storeId) {
  const { data, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('price', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToBundle);
}

// Store queries
export async function fetchStores() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToStore);
}

export async function fetchStoreBySlug(slug) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return rowToStore(data);
}

export async function fetchStoreByOwnerId(ownerId) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToStore(data);
}

export async function isSlugTaken(slug) {
  const { count } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .eq('slug', slug);
  return (count ?? 0) > 0;
}

export async function createStore(params) {
  const { data, error } = await supabase
    .from('stores')
    .insert({
      owner_id:     params.ownerId,
      name:         params.name,
      slug:         params.slug,
      description:  params.description,
      whatsapp:     params.whatsapp || null,
      accent_color: params.accentColor,
      logo_url:     params.logoUrl ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToStore(data);
}

export async function uploadStoreLogo(file, storeId) {
  const ext  = file.name.split('.').pop();
  const path = `store-logos/${storeId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('assets')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('assets').getPublicUrl(path);
  return data.publicUrl;
}

// Order queries
export async function fetchOrdersByStore(storeId, limit = 50) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(rowToOrder);
}

export async function createOrder(params) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      bundle_id:          params.bundleId,
      store_id:           params.storeId,
      customer_phone:     params.customerPhone,
      amount:             params.amount,
      paystack_reference: params.paystackReference,
      payment_method:     params.paymentMethod ?? 'paystack',
      status:             'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return rowToOrder(data);
}

// Stats RPC
export async function fetchStoreStats(storeId) {
  const { data, error } = await supabase.rpc('get_store_stats', { p_store_id: storeId });
  if (error) throw error;
  const row = data?.[0] ?? {};
  return {
    totalSales:      Number(row.total_sales      ?? 0),
    ordersToday:     Number(row.orders_today     ?? 0),
    totalOrders:     Number(row.total_orders     ?? 0),
    uniqueCustomers: Number(row.unique_customers ?? 0),
  };
}

// Wallet queries
export async function fetchWallet(userId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return rowToWallet(data);
}

export async function deductWallet(userId, amount, orderId) {
  const { data, error } = await supabase.rpc('deduct_wallet_balance', {
    p_user_id: userId,
    p_amount:  amount,
    p_order_id: orderId,
  });
  if (error) throw error;
  if (!data?.success) throw new Error('Insufficient wallet balance');
  return data;
}

export async function createBundle(params) {
  const { data, error } = await supabase
    .from('bundles')
    .insert({
      store_id:    params.storeId,
      name:        params.name,
      price:       Number(params.price),
      size_gb:     Number(params.sizeGb),
      network:     params.network ?? 'MTN',
     validity:        params.validit  ?? '90DAYS',
      is_active:   true
    })
    .select()
    .single();
    
  if (error) throw error;
  return rowToBundle(data);
}


export async function topUpWalletViaPaystack(userId, email, amount) {
  const ref = makeRef();
  return new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      resolve({ reference: ref, amount });
      return;
    }
    const handler = window.PaystackPop.setup({
      key:      PAYSTACK_KEY,
      email,
      amount:   Math.round(amount * 100),
      currency: 'GHS',
      ref,
      metadata: {
        type:    'wallet_topup',
        user_id: userId,
        custom_fields: [
          { display_name: 'Type',    variable_name: 'type',    value: 'wallet_topup' },
          { display_name: 'User ID', variable_name: 'user_id', value: userId },
        ],
      },
      callback: (response) => resolve({ reference: response.reference, amount }),
      onClose:  () => reject(new Error('cancelled')),
    });
    handler.openIframe();
  });
}

export async function payDirectViaPaystack(bundle, phone, storeId, userEmail) {
  const ref = makeRef();
  return new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      resolve({ reference: ref });
      return;
    }
    const handler = window.PaystackPop.setup({
      key:      PAYSTACK_KEY,
      email:    userEmail || `${phone.replace(/^0/, '')}@scifidata.shop`,
      amount:   Math.round(bundle.price * 100),
      currency: 'GHS',
      ref,
      metadata: {
        type:        'bundle_purchase',
        phone,
        network:     bundle.network,
        bundle_size: bundle.size,
        bundle_id:   bundle.id,
        store_id:    storeId,
        custom_fields: [
          { display_name: 'Phone',   variable_name: 'phone',       value: phone },
          { display_name: 'Network', variable_name: 'network',     value: bundle.network },
          { display_name: 'Bundle',  variable_name: 'bundle_size', value: bundle.size },
        ],
      },
      callback: (response) => resolve({ reference: response.reference }),
      onClose:  () => reject(new Error('cancelled')),
    });
    handler.openIframe();
  });
}
