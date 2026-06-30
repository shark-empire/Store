/**
 * DataPulse — Single-file React App
 * All pages, components, contexts, and data logic inlined.
 *
 * Stack: React 18 · React Router v6 · Framer Motion · Supabase JS · Lucide React · Three.js
 *
 * Entry point: main.jsx (HashRouter wrapping <App />)
 * Styling:     index.css (Tailwind + CSS vars)
 * Env vars:    VITE_SUPABASE_URL · VITE_SUPABASE_ANON_KEY · VITE_PAYSTACK_PUBLIC_KEY
 */

import {
  createContext, useContext, useState, useEffect, useCallback,
  useRef, useMemo, memo,
} from 'react';
import {
  Routes, Route, useLocation, useNavigate, useParams, Link,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import * as THREE from 'three';
import {
  Zap, ArrowRight, Store, TrendingUp, Users, Wallet,
  CheckCircle, Shield, Clock, Headphones, Star, MessageCircle,
  ArrowLeft, ShoppingCart, ChevronDown, ChevronRight, ChevronLeft,
  Upload, Globe, Image as ImageIcon, Loader2, Package, Menu, X,
  LayoutDashboard, Settings, ExternalLink, ArrowUpRight, Check, Rocket,
  User, Palette, Signal, TowerControl, Smartphone, Plus, Minus,
  CreditCard, AlertTriangle, RefreshCw,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUPABASE CLIENT
// ─────────────────────────────────────────────────────────────────────────────
const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const networkColors = {
  MTN:     { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  text: '#F59E0B', lightBg: 'rgba(245,158,11,0.07)'  },
  Telecel: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   text: '#EF4444', lightBg: 'rgba(239,68,68,0.07)'   },
  AT:      { bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.3)',  text: '#38BDF8', lightBg: 'rgba(56,189,248,0.07)'  },
};

const ACCENT_COLORS = [
  { name: 'Blue',   value: '#38BDF8' },
  { name: 'Green',  value: '#22D3A1' },
  { name: 'Amber',  value: '#F59E0B' },
  { name: 'Red',    value: '#EF4444' },
  { name: 'Purple', value: '#A78BFA' },
  { name: 'Pink',   value: '#F472B6' },
];

const networkPrefixes = {
  MTN:     ['024', '054', '055', '059', '028'],
  Telecel: ['020', '050'],
  AT:      ['026', '027', '056', '057'],
};

const TESTIMONIALS = [
  { id: 't1', quote: 'Sci-fi Data transformed how I buy data. Instant delivery every time.', author: 'Kwame Asante',       role: 'Regular Customer', network: 'MTN'     },
  { id: 't2', quote: "I started my store and I'm already making GH₵2,000 a month. The dashboard is so easy.", author: 'Abena Osei', role: 'Store Owner',   network: 'AT'      },
  { id: 't3', quote: 'Best prices, I buy in bulk for all my employees. Reliable every time.', author: 'Dr. Emmanuel Mensah', role: 'Business Customer', network: 'Telecel' },
];

// Generate a collision-safe Paystack reference
function makeRef() {
  return `DP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// Compute a URL-safe slug from a store name
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Format GHS amounts
function ghs(amount) {
  return `GH₵${Number(amount).toFixed(2)}`;
}

// Validate phone prefix against network
function phoneMatchesNetwork(phone, network) {
  const prefixes = networkPrefixes[network] ?? [];
  return prefixes.some((p) => phone.startsWith(p));
}

// Format data size
function fmtSize(sizeGb) {
  return sizeGb < 1 ? `${Math.round(sizeGb * 1024)}MB` : `${sizeGb}GB`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SUPABASE DATA LAYER
// ─────────────────────────────────────────────────────────────────────────────

// Row mappers ─────────────────────────────────────────────────────────────────

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

// Bundle queries ──────────────────────────────────────────────────────────────

async function fetchBundles(network, limit = 50) {
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

async function fetchBundleById(id) {
  const { data, error } = await supabase
    .from('bundles')
    .select('*, store:stores(id, name, slug, accent_color, whatsapp, logo_url)')
    .eq('id', id)
    .single();
  if (error) return null;
  return rowToBundle(data);
}

async function fetchBundlesByStore(storeId) {
  const { data, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('price', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToBundle);
}

// Store queries ───────────────────────────────────────────────────────────────

async function fetchStores() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToStore);
}

async function fetchStoreBySlug(slug) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return rowToStore(data);
}

async function fetchStoreByOwnerId(ownerId) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToStore(data);
}

async function isSlugTaken(slug) {
  const { count } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .eq('slug', slug);
  return (count ?? 0) > 0;
}

async function createStore(params) {
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

async function uploadStoreLogo(file, storeId) {
  const ext  = file.name.split('.').pop();
  const path = `store-logos/${storeId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('assets')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('assets').getPublicUrl(path);
  return data.publicUrl;
}

// Order queries ───────────────────────────────────────────────────────────────

async function fetchOrdersByStore(storeId, limit = 50) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(rowToOrder);
}

async function createOrder(params) {
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

// Stats RPC ───────────────────────────────────────────────────────────────────

async function fetchStoreStats(storeId) {
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

// Wallet queries ──────────────────────────────────────────────────────────────

async function fetchWallet(userId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return rowToWallet(data);
}

/**
 * Atomically deduct wallet balance via a security-definer RPC.
 * The RPC uses SELECT FOR UPDATE (row lock) so two concurrent requests
 * cannot both pass the balance check — one will block until the first commits.
 *
 * Returns { success, new_balance } or throws on insufficient funds.
 */
async function deductWallet(userId, amount, orderId) {
  const { data, error } = await supabase.rpc('deduct_wallet_balance', {
    p_user_id: userId,
    p_amount:  amount,
    p_order_id: orderId,
  });
  if (error) throw error;
  if (!data?.success) throw new Error('Insufficient wallet balance');
  return data;
}

/**
 * Top-up wallet via Paystack inline popup.
 * After payment succeeds on the frontend, the Activepieces webhook
 * will also call credit_wallet_balance as a second verification layer.
 * The RPC is idempotent on paystack_reference so double-credit is impossible.
 */
async function topUpWalletViaPaystack(userId, email, amount) {
  const ref = makeRef();
  return new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      // dev fallback
      resolve({ reference: ref, amount });
      return;
    }
    const handler = window.PaystackPop.setup({
      key:      PAYSTACK_KEY,
      email,
      amount:   Math.round(amount * 100), // pesewas
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

/**
 * Direct Paystack payment for a bundle (no wallet involved).
 * The Activepieces webhook receives charge.success and triggers Datamart.
 */
async function payDirectViaPaystack(bundle, phone, storeId, userEmail) {
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. AUTH CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

async function loadProfile(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (!profile) return null;
  const { data: { user: authUser } } = await supabase.auth.getUser();
  return {
    id:       profile.id,
    email:    authUser?.email ?? '',
    fullName: profile.full_name,
    phone:    profile.phone ?? null,
    role:     profile.role,
    avatar:   profile.avatar_url ?? null,
  };
}

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) setUser(await loadProfile(session.user.id));
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN'  && session?.user) setUser(await loadProfile(session.user.id));
        if (event === 'SIGNED_OUT')                  setUser(null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return true;
  }, []);

  const register = useCallback(async ({ fullName, email, phone, password }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw error;
    if (authData.user && phone) {
      await supabase.from('profiles').update({ phone }).eq('id', authData.user.id);
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TOAST CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const toastColors = { success: '#22D3A1', error: '#EF4444', info: '#38BDF8', warn: '#F59E0B' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={   { opacity: 0, y: 20, scale: 0.95 }}
              style={{
                background: '#0D1526',
                border: `1px solid ${toastColors[t.type]}44`,
                borderLeft: `3px solid ${toastColors[t.type]}`,
                borderRadius: 10,
                padding: '12px 18px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                color: '#F0F6FF',
                maxWidth: 340,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  return useContext(ToastContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SHARED MICRO-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// NetworkBadge ────────────────────────────────────────────────────────────────
const networkIcons = {
  MTN:     <Signal       className="w-3.5 h-3.5" />,
  Telecel: <TowerControl className="w-3.5 h-3.5" />,
  AT:      <Smartphone   className="w-3.5 h-3.5" />,
};
const badgeSizes = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-3 py-1 text-[13px] gap-1.5',
  lg: 'px-4 py-1.5 text-sm gap-2',
};
function NetworkBadge({ network, size = 'md' }) {
  const c = networkColors[network];
  return (
    <span
      className={`inline-flex items-center font-dm font-semibold rounded-full ${badgeSizes[size]}`}
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {networkIcons[network]} {network}
    </span>
  );
}

// BundleCard ──────────────────────────────────────────────────────────────────
function BundleCard({ bundle }) {
  const navigate  = useNavigate();
  const nc        = networkColors[bundle.network];
  return (
    <div className="card-base overflow-hidden group cursor-pointer" onClick={() => navigate(`/bundle/${bundle.id}`)}>
      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${nc.text}, ${nc.text}88)` }} />
      <div className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(135deg, ${nc.bg}, ${nc.lightBg})` }}>
        {bundle.image && (
          <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <div className="absolute top-3 right-3"><NetworkBadge network={bundle.network} size="sm" /></div>
      </div>
      <div className="p-5">
        <h3 className="font-syne font-bold text-base text-[#F0F6FF] mb-1">{bundle.name}</h3>
        <p className="font-dm text-[13px] text-[#94A3B8] mb-3">{bundle.size} · {bundle.validity}</p>
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-syne font-extrabold text-2xl text-[#22D3A1]">{ghs(bundle.price)}</span>
        </div>
        <p className="font-dm text-xs text-[#64748B] mb-4">Sold by <span className="text-[#94A3B8]">{bundle.vendorName}</span></p>
        <button className="w-full btn-primary py-3 text-sm rounded-[10px]" onClick={(e) => { e.stopPropagation(); navigate(`/bundle/${bundle.id}`); }}>
          <ShoppingCart className="w-4 h-4" /> Buy Now
        </button>
      </div>
    </div>
  );
}

// GradientMesh (Three.js) ─────────────────────────────────────────────────────
const vertexShader = `
  varying vec2 vUv; varying float vWave; uniform float uTime; uniform float uNoiseStrength;
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;} vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
  void main(){vUv=uv;vec3 pos=position;float noiseFreq=1.5;float noiseAmp=uNoiseStrength;
  float angle=uTime*.2;mat3 rX=mat3(1.,0.,0.,0.,cos(angle),-sin(angle),0.,sin(angle),cos(angle));
  mat3 rY=mat3(cos(angle),0.,sin(angle),0.,1.,0.,-sin(angle),0.,cos(angle));
  vec3 np=rX*rY*vec3(pos.x*noiseFreq,pos.y*noiseFreq,pos.z);float wave=snoise(np+uTime);
  vWave=wave;pos.z+=wave*noiseAmp;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);}
`;
const fragmentShader = `
  varying vec2 vUv;varying float vWave;uniform float uTime;
  void main(){float mx=(vWave+1.)*.5;vec3 c1=vec3(.02,.04,.08);vec3 c2=vec3(.22,.74,.97);vec3 c3=vec3(.13,.83,.63);
  float ts=sin(uTime*.1)*.5+.5;vec3 c=mix(mix(c1,c2,mx),c3,vUv.x*ts);gl_FragColor=vec4(c,1.);}
`;
function GradientMesh() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const seg = window.innerWidth < 768 ? 16 : 32;
    const geo = new THREE.PlaneGeometry(15, 15, seg, seg);
    const mat = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: { uTime: { value: 0 }, uNoiseStrength: { value: 1.2 } },
      side: THREE.DoubleSide,
    });
    scene.add(new THREE.Mesh(geo, mat));
    const clock = new THREE.Clock();
    let raf;
    const tick = () => { raf = requestAnimationFrame(tick); mat.uniforms.uTime.value = clock.getElapsedTime(); renderer.render(scene, camera); };
    tick();
    const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); geo.dispose(); mat.dispose(); renderer.dispose(); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
}

// PhoneInput ──────────────────────────────────────────────────────────────────
function PhoneInput({ value, onChange, network, disabled }) {
  const [verifying, setVerifying] = useState(false);
  const [verified,  setVerified]  = useState(false);
  const [mismatch,  setMismatch]  = useState(false);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setVerified(false); setMismatch(false);
    onChange(raw);
  };

  const handleBlur = async () => {
    if (value.length < 9 || !network) return;
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 400));
    const ok = phoneMatchesNetwork(value, network);
    setVerified(ok); setMismatch(!ok);
    setVerifying(false);
  };

  return (
    <div>
      <div className="flex items-stretch rounded-[10px] overflow-hidden transition-all"
        style={{ border: `1px solid ${mismatch ? '#EF4444' : verified ? '#22D3A1' : 'var(--border-subtle)'}`, background: 'var(--input-bg)' }}>
        <div className="flex items-center gap-2 px-4 shrink-0" style={{ borderRight: '1px solid var(--border-subtle)' }}>
          <img src="https://flagcdn.com/w20/gh.png" alt="GH" className="w-5 rounded-sm" />
          <span className="font-dm text-sm font-semibold text-[#94A3B8]">+233</span>
        </div>
        <input type="tel" value={value} onChange={handleChange} onBlur={handleBlur}
          placeholder="54 000 0000" disabled={disabled}
          className="flex-1 bg-transparent px-4 py-3.5 font-dm text-[15px] text-[#F0F6FF] outline-none placeholder:text-[#64748B] disabled:opacity-50" />
      </div>
      {verifying && <p className="mt-1.5 font-dm text-xs text-[#94A3B8] animate-pulse">Checking prefix…</p>}
      {verified  && <p className="mt-1.5 font-dm text-xs text-[#22D3A1] font-semibold">✓ Valid {network} number</p>}
      {mismatch  && <p className="mt-1.5 font-dm text-xs text-[#EF4444]">⚠ This prefix doesn't match {network}</p>}
    </div>
  );
}

// AuthModal ───────────────────────────────────────────────────────────────────
function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const { login, register } = useAuth();
  const { showToast }       = useToast();
  const [tab,    setTab]    = useState(defaultTab);
  const [form,   setForm]   = useState({ fullName: '', email: '', phone: '', password: '' });
  const [busy,   setBusy]   = useState(false);

  useEffect(() => { setTab(defaultTab); }, [defaultTab, isOpen]);

  const handle = async () => {
    setBusy(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        showToast('Welcome back!', 'success');
        onClose();
      } else {
        if (!form.fullName || !form.email || !form.password) { showToast('Fill all required fields', 'error'); return; }
        await register(form);
        showToast('Account created!', 'success');
        onClose();
      }
    } catch (e) {
      showToast(e.message ?? 'Something went wrong', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(5,10,20,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] rounded-2xl border p-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-4 mb-6">
          {['login', 'register'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`font-syne font-bold text-lg capitalize transition-colors ${tab === t ? 'text-[#F0F6FF]' : 'text-[#64748B]'}`}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {tab === 'register' && (
            <input type="text" placeholder="Full Name" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-base" />
          )}
          <input type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base" />
          {tab === 'register' && (
            <input type="tel" placeholder="Phone (optional)" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="input-base" />
          )}
          <input type="password" placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-base" />
          <button onClick={handle} disabled={busy} className="w-full btn-primary py-3.5 disabled:opacity-50">
            {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// WalletWidget ─────────────────────────────────────────────────────────────────
function WalletWidget({ userId, userEmail, onBalanceChange }) {
  const { showToast }       = useToast();
  const [wallet,  setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmt, setTopUpAmt] = useState('');
  const [topping, setTopping]   = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const w = await fetchWallet(userId);
    setWallet(w);
    onBalanceChange?.(w?.balance ?? 0);
    setLoading(false);
  }, [userId, onBalanceChange]);

  useEffect(() => { load(); }, [load]);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmt);
    if (!amount || amount < 1) { showToast('Minimum top-up is GH₵1', 'warn'); return; }
    if (amount > 5000)         { showToast('Maximum top-up is GH₵5,000', 'warn'); return; }
    setTopping(true);
    try {
      const { reference } = await topUpWalletViaPaystack(userId, userEmail, amount);
      // Optimistically update UI — Activepieces webhook will confirm server-side
      showToast(`Top-up of ${ghs(amount)} initiated. Wallet will update shortly.`, 'success');
      setShowTopUp(false);
      setTopUpAmt('');
      // Poll for balance update (Activepieces webhook may take a few seconds)
      setTimeout(load, 3000);
      setTimeout(load, 7000);
    } catch (e) {
      if (e.message !== 'cancelled') showToast('Top-up failed', 'error');
    } finally {
      setTopping(false);
    }
  };

  if (loading) return <div className="h-10 w-32 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />;

  return (
    <div className="relative">
      <button
        onClick={() => setShowTopUp((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-dm text-sm font-semibold transition-all"
        style={{ background: 'rgba(34,211,161,0.1)', border: '1px solid rgba(34,211,161,0.25)', color: '#22D3A1' }}
      >
        <Wallet className="w-4 h-4" />
        {ghs(wallet?.balance ?? 0)}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTopUp ? 'rotate-180' : ''}`} />
      </button>

      {showTopUp && (
        <div className="absolute right-0 top-full mt-2 rounded-xl border p-4 w-64 z-50"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
          <p className="font-syne font-bold text-sm text-[#F0F6FF] mb-3">Top Up Wallet</p>
          <div className="flex gap-2 mb-2">
            {[5, 10, 20, 50].map((amt) => (
              <button key={amt} onClick={() => setTopUpAmt(String(amt))}
                className="flex-1 py-1.5 rounded-lg font-dm text-xs font-semibold transition-all"
                style={{
                  background: topUpAmt === String(amt) ? 'rgba(56,189,248,0.15)' : 'var(--input-bg)',
                  border: `1px solid ${topUpAmt === String(amt) ? '#38BDF8' : 'var(--border-subtle)'}`,
                  color: topUpAmt === String(amt) ? '#38BDF8' : '#94A3B8',
                }}>
                {amt}
              </button>
            ))}
          </div>
          <input type="number" placeholder="Custom amount" value={topUpAmt}
            onChange={(e) => setTopUpAmt(e.target.value)} className="input-base mb-3 text-sm" />
          <button onClick={handleTopUp} disabled={topping} className="w-full btn-primary py-2.5 text-sm disabled:opacity-50">
            {topping ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Pay ${topUpAmt ? ghs(topUpAmt) : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}

// Navigation ──────────────────────────────────────────────────────────────────
const navLinks = [
  { label: 'Home',          path: '/'             },
  { label: 'Marketplace',   path: '/marketplace'   },
  { label: 'Stores',        path: '/stores'        },
  { label: 'Store Builder', path: '/store-builder' },
];

function Navigation() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [showAuth,  setShowAuth]  = useState(false);
  const [authTab,   setAuthTab]   = useState('login');
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const openAuth = (tab) => { setAuthTab(tab); setShowAuth(true); };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ background: scrolled ? 'rgba(5,10,20,0.97)' : 'rgba(5,10,20,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 h-[70px] flex items-center justify-between">
          {/* Logo */}
   <div className="flex items-center">
  <img 
    src="https://i.imgur.com/wKOG6wP.png" 
    alt="Sci-fi Data Logo" 
    className="h-10 w-auto mr-2" 
  />
  <span className="text-xl font-bold">Sci-fi Data</span>
</div>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.path} to={l.path}
                className={`font-dm text-sm font-medium transition-colors ${location.pathname === l.path ? 'text-[#38BDF8]' : 'text-[#94A3B8] hover:text-[#F0F6FF]'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <WalletWidget userId={user.id} userEmail={user.email} />
                <button onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-dm text-sm font-semibold transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', color: '#94A3B8' }}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button onClick={logout} className="hidden sm:block font-dm text-sm text-[#64748B] hover:text-[#EF4444] transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('login')}  className="hidden sm:block font-dm text-sm font-medium text-[#94A3B8] hover:text-[#F0F6FF] transition-colors">Sign in</button>
                <button onClick={() => openAuth('register')} className="btn-primary px-5 py-2 text-sm">Get Started</button>
              </>
            )}
            <button onClick={() => setMenuOpen((v) => !v)} className="lg:hidden p-2 rounded-lg" style={{ color: '#94A3B8' }}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="px-6 py-4 space-y-1">
                {navLinks.map((l) => (
                  <Link key={l.path} to={l.path}
                    className="block py-2.5 font-dm text-sm font-medium text-[#94A3B8] hover:text-[#F0F6FF] transition-colors">
                    {l.label}
                  </Link>
                ))}
                <div className="pt-3 space-y-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  {isAuthenticated ? (
                    <>
                      <button onClick={() => navigate('/dashboard')} className="w-full btn-ghost py-2.5 text-sm">Dashboard</button>
                      <button onClick={logout} className="w-full font-dm text-sm text-[#EF4444]">Sign out</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => openAuth('login')}    className="w-full btn-ghost py-2.5 text-sm">Sign In</button>
                      <button onClick={() => openAuth('register')} className="w-full btn-primary py-2.5 text-sm">Get Started</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
    </>
  );
}

// Footer ──────────────────────────────────────────────────────────────────────
const footerLinks = {
  Platform: [{ label: 'Marketplace', href: '/marketplace' }, { label: 'Store Builder', href: '/store-builder' }, { label: 'Pricing', href: '#' }, { label: 'API Docs', href: '#' }],
  Company:  [{ label: 'About Us',    href: '#' }, { label: 'Blog',    href: '#' }, { label: 'Careers', href: '#' }, { label: 'Contact', href: '#' }],
  Support:  [{ label: 'Help Center', href: '#' }, { label: 'Terms',   href: '#' }, { label: 'Privacy', href: '#' }, { label: 'Report',  href: '#' }],
};
function Footer() {
  return (
    <footer className="border-t" style={{ background: '#0D1526', borderColor: 'var(--border-subtle)' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#38BDF8,#22D3A1)' }}>
                <span className="font-syne font-extrabold text-sm text-[#050A14]">DP</span>
              </div>
              <span className="font-syne font-extrabold text-lg text-gradient">DataPulse</span>
            </div>
            <p className="font-dm text-sm text-[#64748B] mb-5 leading-relaxed">Ghana's leading data bundle marketplace. Buy instantly, sell easily.</p>
          </div>
          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <h4 className="font-syne font-bold text-sm text-[#F0F6FF] mb-4">{cat}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => <li key={l.label}><Link to={l.href} className="font-dm text-sm text-[#64748B] hover:text-[#F0F6FF] transition-colors">{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="font-dm text-[13px] text-[#64748B]">© 2026 Sci-fi Data. All rights reserved.</p>
          <p className="font-dm text-[13px] text-[#64748B]">Powered by <span className="text-[#38BDF8]">Sci-Fi Tech</span></p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. PAGES
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.6 } };

// ── Home ─────────────────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [busy, setBusy]       = useState(true);

  useEffect(() => { fetchBundles(null, 8).then(setBundles).catch(console.error).finally(() => setBusy(false)); }, []);

  return (
    <div className="relative z-[1]">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 pt-[70px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-[800px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-dm text-xs font-semibold text-[#38BDF8] tracking-wider uppercase">Ghana's #1 Data Bundle Marketplace</span>
          </div>
          <h1 className="font-syne font-extrabold leading-[1.1] tracking-tight mb-4" style={{ fontSize: 'clamp(36px,5vw,64px)' }}>
            Buy Data. <br /><span className="text-gradient">Start Your Own Store.</span>
          </h1>
          <p className="font-dm text-lg text-[#94A3B8] max-w-[560px] mx-auto mb-8 leading-relaxed">
            The most trusted platform for MTN, Telecel & AT data bundles in Ghana. Buy with your wallet or pay directly. Create your store, set your prices, earn.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button onClick={() => navigate('/marketplace')} className="btn-primary px-8 py-4 text-base">Browse Bundles <ArrowRight className="w-4 h-4" /></button>
            <button onClick={() => navigate('/store-builder')} className="btn-ghost px-8 py-4 text-base">Start Selling <Store className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {['MTN','Telecel','AT'].map((n) => <NetworkBadge key={n} network={n} size="lg" />)}
          </div>
        </motion.div>
      </section>

      {/* Featured */}
      <section className="py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div {...fadeUp} className="flex items-center justify-between mb-8">
            <h2 className="font-syne font-bold text-2xl sm:text-3xl text-[#F0F6FF]">Featured Bundles</h2>
            <button onClick={() => navigate('/marketplace')} className="hidden sm:flex items-center gap-2 font-dm text-sm text-[#38BDF8] hover:underline">View all <ArrowRight className="w-4 h-4" /></button>
          </motion.div>
          {busy ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card-base h-64 animate-pulse" style={{ background: 'var(--surface)' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bundles.map((b) => <motion.div key={b.id} {...fadeUp}><BundleCard bundle={b} /></motion.div>)}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
        <div className="max-w-[1200px] mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-syne font-bold text-3xl text-[#F0F6FF] mb-3">What People Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.id} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-2xl border p-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-bold text-sm" style={{ background: networkColors[t.network].bg, color: networkColors[t.network].text }}>{t.author[0]}</div>
                  <div><p className="font-syne font-bold text-sm text-[#F0F6FF]">{t.author}</p><p className="font-dm text-xs text-[#64748B]">{t.role}</p></div>
                  <div className="ml-auto"><NetworkBadge network={t.network} size="sm" /></div>
                </div>
                <p className="font-dm text-sm text-[#94A3B8] leading-relaxed">"{t.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Marketplace ───────────────────────────────────────────────────────────────
const PILL_COLORS = {
  All:     { bg: 'rgba(99,102,241,0.1)',  border: '1px solid rgba(99,102,241,0.35)',  text: '#818CF8' },
  MTN:     { bg: 'rgba(245,158,11,0.1)',  border: '1px solid rgba(245,158,11,0.3)',   text: '#F59E0B' },
  Telecel: { bg: 'rgba(239,68,68,0.1)',   border: '1px solid rgba(239,68,68,0.3)',    text: '#EF4444' },
  AT:      { bg: 'rgba(56,189,248,0.1)',  border: '1px solid rgba(56,189,248,0.3)',   text: '#38BDF8' },
};

function Marketplace() {
  const [allBundles, setAll]    = useState([]);
  const [loading, setLoading]   = useState(true);
  const [network, setNetwork]   = useState('All');
  const [sortBy, setSortBy]     = useState('popular');
  const [showSort, setShowSort] = useState(false);

  useEffect(() => { fetchBundles().then(setAll).catch(console.error).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    let r = network === 'All' ? allBundles : allBundles.filter((b) => b.network === network);
    if (sortBy === 'price-low')  r = [...r].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') r = [...r].sort((a, b) => b.price - a.price);
    if (sortBy === 'size')       r = [...r].sort((a, b) => b.size_gb - a.size_gb);
    return r;
  }, [allBundles, network, sortBy]);

  return (
    <div className="relative z-[1] pt-[70px]">
      <div className="h-[200px] flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(135deg,rgba(5,10,20,0.95),rgba(13,21,38,0.9))' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-syne font-extrabold text-3xl sm:text-[40px] text-[#F0F6FF] mb-3">Data Bundle Marketplace</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-dm text-base text-[#94A3B8] text-center max-w-lg">Compare and buy from verified vendors. Pay with wallet or Paystack.</motion.p>
      </div>

      {/* Filter bar */}
      <div className="sticky top-[70px] z-20 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['All','MTN','Telecel','AT'].map((n) => {
              const active = network === n;
              return (
                <button key={n} onClick={() => setNetwork(n)}
                  className="shrink-0 px-4 py-1.5 rounded-full font-dm text-sm font-semibold transition-all"
                  style={active ? { background: PILL_COLORS[n].bg, border: PILL_COLORS[n].border, color: PILL_COLORS[n].text } : { color: '#64748B', border: '1px solid var(--border-subtle)' }}>
                  {n === 'All' ? 'All Networks' : n}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <button onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-dm text-sm text-[#94A3B8]"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-subtle)' }}>
              Sort <ChevronDown className="w-4 h-4" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-2 rounded-xl border overflow-hidden z-30 min-w-[170px]"
                style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
                {[['popular','Popular'],['price-low','Price ↑'],['price-high','Price ↓'],['size','Bundle Size']].map(([v, l]) => (
                  <button key={v} onClick={() => { setSortBy(v); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2.5 font-dm text-sm transition-all ${sortBy === v ? 'text-[#38BDF8] bg-[rgba(56,189,248,0.08)]' : 'text-[#94A3B8] hover:text-[#F0F6FF]'}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {loading && <div className="flex items-center justify-center py-20 gap-3"><Loader2 className="w-6 h-6 text-[#38BDF8] animate-spin" /><span className="font-dm text-[#94A3B8]">Loading…</span></div>}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((b) => <BundleCard key={b.id} bundle={b} />)}
          </div>
        )}
        {!loading && filtered.length === 0 && <div className="text-center py-20"><p className="font-dm text-lg text-[#64748B]">No bundles found.</p></div>}
      </div>
    </div>
  );
}

// ── BundleDetail (wallet pay + direct Paystack) ───────────────────────────────
function BundleDetail() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast }     = useToast();

  const [bundle, setBundle] = useState(null);
  const [store,  setStore]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone]   = useState('');
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setRef] = useState('');
  const [payMethod, setPayMethod] = useState('direct'); // 'wallet' | 'direct'
  const [walletBalance, setWalletBalance] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const b = await fetchBundleById(id);
      setBundle(b);
      if (b?.store) {
        setStore({
          id:          b.store.id,
          name:        b.store.name,
          slug:        b.store.slug,
          accentColor: b.store.accent_color ?? '#38BDF8',
          whatsapp:    b.store.whatsapp ?? null,
          logo:        b.store.logo_url ?? null,
        });
      }
      setLoading(false);
    })();
  }, [id]);

  // Fetch wallet balance when user is known
  useEffect(() => {
    if (user) fetchWallet(user.id).then((w) => setWalletBalance(w?.balance ?? 0));
  }, [user]);

  const handleBuy = async () => {
    if (!phone || phone.length < 9) { showToast('Enter a valid phone number', 'error'); return; }
    if (!isAuthenticated && payMethod === 'wallet') { setShowAuthModal(true); return; }

    setBuying(true);
    try {
      let ref;

      if (payMethod === 'wallet') {
        // ── WALLET PATH ───────────────────────────────────────────────────────
        if (walletBalance < bundle.price) {
          showToast(`Insufficient wallet balance. Top up at least ${ghs(bundle.price - walletBalance)} more.`, 'error');
          setBuying(false);
          return;
        }
        // Create order first (status = pending)
        const order = await createOrder({
          bundleId:          bundle.id,
          storeId:           bundle.storeId,
          customerPhone:     phone,
          amount:            bundle.price,
          paystackReference: makeRef(),  // internal wallet ref, not Paystack
          paymentMethod:     'wallet',
        });
        // Atomic DB deduction — throws if balance is insufficient (double-spend guard)
        await deductWallet(user.id, bundle.price, order.id);
        ref = order.paystackReference;
        // Update local wallet display
        setWalletBalance((prev) => prev - bundle.price);
        // Activepieces receives a webhook from our DB trigger and calls Datamart
      } else {
        // ── DIRECT PAYSTACK PATH ─────────────────────────────────────────────
        const result = await payDirectViaPaystack(bundle, phone, bundle.storeId, user?.email);
        ref = result.reference;
        // Create pending order — Activepieces webhook will verify & update to completed
        await createOrder({
          bundleId:          bundle.id,
          storeId:           bundle.storeId,
          customerPhone:     phone,
          amount:            bundle.price,
          paystackReference: ref,
          paymentMethod:     'paystack',
        });
      }

      setRef(ref);
      setSuccess(true);
      showToast('Payment confirmed! Data delivery in progress.', 'success');
    } catch (e) {
      if (e.message !== 'cancelled') showToast(e.message || 'Payment failed', 'error');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin" /></div>;
  if (!bundle) return <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="font-syne font-bold text-2xl text-[#F0F6FF] mb-4">Bundle Not Found</h1><button onClick={() => navigate('/marketplace')} className="btn-primary">Browse Bundles</button></div></div>;

  const hasSufficientBalance = walletBalance >= bundle.price;

  return (
    <div className="relative z-[1] pt-[70px]">
      <div className="max-w-[1200px] mx-auto px-6 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 font-dm text-sm text-[#94A3B8] hover:text-[#F0F6FF] transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
      </div>

      {success ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[500px] mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#22D3A1,#10B981)' }}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-syne font-extrabold text-3xl text-[#F0F6FF] mb-2">Payment Confirmed!</h1>
          <p className="font-dm text-[#94A3B8] mb-2 font-mono text-sm">Ref: {reference}</p>
          <p className="font-dm text-[#94A3B8] mb-8">Your {bundle.size} {bundle.network} data bundle will be sent to <span className="text-[#F0F6FF] font-semibold">{phone}</span> within minutes.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/marketplace')} className="btn-primary flex-1">Browse More</button>
            <button onClick={() => { setSuccess(false); setPhone(''); }} className="btn-ghost flex-1">Buy Again</button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
              <NetworkBadge network={bundle.network} size="lg" />
              <h1 className="font-syne font-extrabold text-3xl sm:text-4xl text-[#F0F6FF] mt-4 mb-2">{bundle.name}</h1>
              <p className="font-dm text-base text-[#94A3B8] mb-6">{bundle.size} · Valid for {bundle.validity}</p>
              {bundle.description && <p className="font-dm text-[15px] text-[#94A3B8] leading-relaxed mb-8">{bundle.description}</p>}
              {store && (
                <div className="rounded-xl border p-5 flex items-center gap-4" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: store.accentColor + '20' }}>
                    {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" /> : <Store className="w-6 h-6" style={{ color: store.accentColor }} />}
                  </div>
                  <div className="flex-1"><p className="font-syne font-bold text-sm text-[#F0F6FF]">{store.name}</p><div className="flex gap-0.5">{Array(5).fill(0).map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />)}</div></div>
                  <button onClick={() => navigate(`/store/${store.slug}`)} className="font-dm text-sm text-[#38BDF8] hover:underline">View Store</button>
                </div>
              )}
            </motion.div>

            {/* Right: purchase card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
              <div className="sticky top-[90px] rounded-[20px] border p-6 sm:p-8"
                style={{ background: 'var(--card-bg)', backdropFilter: 'blur(20px)', borderColor: 'var(--border-subtle)', boxShadow: '0 16px 50px rgba(0,0,0,0.4)' }}>
                <div className="h-[2px] w-full mb-6" style={{ background: 'linear-gradient(90deg,#38BDF8,#22D3A1)' }} />
                <p className="font-syne font-extrabold text-3xl text-[#22D3A1] mb-6">{ghs(bundle.price)}</p>

                {/* Payment method selector */}
                <div className="mb-5">
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" />,     sub: isAuthenticated ? ghs(walletBalance) : 'Sign in' },
                      { v: 'direct', label: 'Paystack', icon: <CreditCard className="w-4 h-4" />, sub: 'Card / MoMo' },
                    ].map(({ v, label, icon, sub }) => (
                      <button key={v} onClick={() => { if (v === 'wallet' && !isAuthenticated) setShowAuthModal(true); else setPayMethod(v); }}
                        className="rounded-xl p-3 flex flex-col items-start gap-1 transition-all border"
                        style={{
                          background: payMethod === v ? 'rgba(56,189,248,0.08)' : 'var(--input-bg)',
                          borderColor: payMethod === v ? '#38BDF8' : 'var(--border-subtle)',
                        }}>
                        <span style={{ color: payMethod === v ? '#38BDF8' : '#94A3B8' }}>{icon}</span>
                        <span className="font-syne font-bold text-xs text-[#F0F6FF]">{label}</span>
                        <span className="font-dm text-[11px]" style={{ color: v === 'wallet' && isAuthenticated && !hasSufficientBalance ? '#EF4444' : '#64748B' }}>{sub}</span>
                      </button>
                    ))}
                  </div>
                  {payMethod === 'wallet' && isAuthenticated && !hasSufficientBalance && (
                    <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                      <p className="font-dm text-xs text-[#EF4444]">Need {ghs(bundle.price - walletBalance)} more. Top up in the nav bar.</p>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-5">
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Recipient Number</label>
                  <PhoneInput value={phone} onChange={setPhone} network={bundle.network} disabled={buying} />
                </div>

                <button onClick={handleBuy} disabled={buying || (payMethod === 'wallet' && !hasSufficientBalance)}
                  className="w-full btn-primary py-4 text-base disabled:opacity-40">
                  {buying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : payMethod === 'wallet' ? `Pay with Wallet` : 'Pay with Paystack'}
                </button>

                <div className="mt-5 pt-5 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {[['Instant Delivery', Clock],['Secure Payment', Shield],['24/7 Support', Headphones]].map(([label, Icon]) => (
                    <div key={label} className="flex items-center gap-2.5 text-[#94A3B8]">
                      <Icon className="w-4 h-4 text-[#38BDF8]" />
                      <span className="font-dm text-xs font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />
    </div>
  );
}

// ── StoreView ─────────────────────────────────────────────────────────────────
function StoreView() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [store,   setStore]   = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const s = await fetchStoreBySlug(slug);
      if (!s) { setNotFound(true); setLoading(false); return; }
      setStore(s);
      setBundles(await fetchBundlesByStore(s.id));
      setLoading(false);
    })();
  }, [slug]);

  if (loading)   return <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin" /></div>;
  if (notFound)  return <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center"><div className="text-center"><Store className="w-16 h-16 text-[#64748B] mx-auto mb-4" /><h1 className="font-syne font-bold text-2xl text-[#F0F6FF] mb-4">Store Not Found</h1><button onClick={() => navigate('/stores')} className="btn-primary">Browse Stores</button></div></div>;

  return (
    <div className="relative z-[1] pt-[70px]">
      <div className="h-[220px] flex flex-col items-center justify-center px-6 relative"
        style={{ background: `linear-gradient(135deg,${store.accentColor}20,rgba(13,21,38,0.95))` }}>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-6 flex items-center gap-1.5 font-dm text-sm text-[#94A3B8] hover:text-[#F0F6FF]"><ArrowLeft className="w-4 h-4" /> Back</button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border-[3px]" style={{ background: store.accentColor + '20', borderColor: 'var(--border-subtle)' }}>
            {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover rounded-2xl" /> : <Store className="w-8 h-8" style={{ color: store.accentColor }} />}
          </div>
          <h1 className="font-syne font-bold text-2xl text-[#F0F6FF]">{store.name}</h1>
          <p className="font-dm text-sm text-[#94A3B8] mt-1 max-w-md">{store.description}</p>
          {store.whatsapp && (
            <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full font-dm text-sm font-semibold"
              style={{ background: 'rgba(34,211,161,0.1)', color: '#22D3A1' }}>
              <MessageCircle className="w-4 h-4" /> Contact on WhatsApp
            </a>
          )}
        </motion.div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <h2 className="font-syne font-bold text-xl text-[#F0F6FF] mb-6">Available Bundles ({bundles.length})</h2>
        {bundles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{bundles.map((b) => <BundleCard key={b.id} bundle={b} />)}</div>
        ) : (
          <div className="text-center py-16"><p className="font-dm text-[#94A3B8]">No bundles yet from this store.</p></div>
        )}
      </div>
    </div>
  );
}

// ── Stores ────────────────────────────────────────────────────────────────────
function Stores() {
  const navigate = useNavigate();
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStores().then(setStores).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <div className="relative z-[1] pt-[70px]">
      <div className="h-[200px] flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(135deg,rgba(5,10,20,0.95),rgba(13,21,38,0.9))' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-syne font-extrabold text-3xl sm:text-[40px] text-[#F0F6FF] mb-3">Browse Stores</motion.h1>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {loading && <div className="flex items-center justify-center py-20 gap-3"><Loader2 className="w-6 h-6 text-[#38BDF8] animate-spin" /></div>}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((s) => (
              <motion.div key={s.id} {...fadeUp} onClick={() => navigate(`/store/${s.slug}`)}
                className="rounded-2xl border p-6 cursor-pointer transition-all hover:-translate-y-1 group"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                <div className="h-20 rounded-xl mb-4 flex items-center justify-center overflow-hidden" style={{ background: s.accentColor + '15' }}>
                  {s.logo ? <img src={s.logo} alt={s.name} className="h-full w-full object-cover rounded-xl" /> : <Store className="w-10 h-10" style={{ color: s.accentColor }} />}
                </div>
                <h3 className="font-syne font-bold text-lg text-[#F0F6FF] mb-1 group-hover:text-[#38BDF8] transition-colors">{s.name}</h3>
                <p className="font-dm text-sm text-[#94A3B8] mb-4 line-clamp-2">{s.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#F59E0B]"><Star className="w-3.5 h-3.5 fill-[#F59E0B]" /><span className="font-dm text-xs font-medium">Verified</span></div>
                  <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#38BDF8] group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── StoreBuilder ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'account',    label: 'Account',   Icon: User    },
  { id: 'store-info', label: 'Store Info', Icon: Store   },
  { id: 'customize',  label: 'Customize',  Icon: Palette },
  { id: 'launch',     label: 'Launch',     Icon: Rocket  },
];

function StoreBuilder() {
  const navigate = useNavigate();
  const { isAuthenticated, user, register } = useAuth();
  const { showToast } = useToast();

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const logoRef = useRef(null);

  const [acc, setAcc] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [info, setInfo] = useState({ name: '', description: '', whatsapp: '', logoFile: null, logoPreview: null });
  const [accentColor, setAccent] = useState(ACCENT_COLORS[0].value);
  const [createdSlug, setCreatedSlug] = useState('');

  const computedSlug = toSlug(info.name);
  const displaySlug  = createdSlug || computedSlug;

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInfo((p) => ({ ...p, logoFile: file }));
    const reader = new FileReader();
    reader.onload = () => setInfo((p) => ({ ...p, logoPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const next = async () => {
    if (step === 0) {
      if (isAuthenticated) { setStep(1); return; }
      if (!acc.fullName || !acc.email || !acc.password) { showToast('Fill all required fields', 'error'); return; }
      setLoading(true);
      try { await register(acc); showToast('Account created!', 'success'); setStep(1); }
      catch (e) { showToast(e.message ?? 'Registration failed', 'error'); }
      finally { setLoading(false); }
      return;
    }
    if (step === 1) {
      if (!info.name.trim() || computedSlug.length < 3) { showToast('Enter a valid store name', 'error'); return; }
      setStep(2); return;
    }
    if (step === 2) {
      if (!user) { showToast('You must be logged in', 'error'); return; }
      setLoading(true);
      try {
        let slug = computedSlug;
        if (await isSlugTaken(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
        let logoUrl;
        if (info.logoFile) {
          try { logoUrl = await uploadStoreLogo(info.logoFile, `tmp-${Date.now()}`); } catch { /* non-fatal */ }
        }
        const store = await createStore({ ownerId: user.id, name: info.name.trim(), slug, description: info.description.trim(), whatsapp: info.whatsapp.replace(/\D/g, ''), accentColor, logoUrl });
        setCreatedSlug(store.slug);
        setStep(3);
        showToast('Store created!', 'success');
      } catch (e) { showToast(e.message ?? 'Failed to create store', 'error'); }
      finally { setLoading(false); }
    }
  };

  return (
    <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[600px]">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map(({ id, Icon }, i) => {
            const done = i < step; const active = i === step;
            return (
              <div key={id} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                  style={done ? { background: '#22D3A1' } : active ? { background: 'linear-gradient(135deg,#38BDF8,#22D3A1)' } : { border: '1px solid var(--border-subtle)' }}>
                  {done ? <Check className="w-4 h-4 text-[#050A14]" /> : <Icon className={`w-4 h-4 ${active ? 'text-[#050A14]' : 'text-[#64748B]'}`} />}
                </div>
                {i < STEPS.length - 1 && <div className="w-8 h-[2px] transition-all duration-300" style={{ background: i < step ? '#22D3A1' : 'var(--border-subtle)' }} />}
              </div>
            );
          })}
        </div>

        <div className="rounded-[20px] border p-8 sm:p-10" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
          <AnimatePresence mode="wait">

            {/* Step 0 — Account */}
            {step === 0 && (
              <motion.div key="acc" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-5">
                <div>
                  <h2 className="font-syne font-bold text-2xl text-[#F0F6FF]">{isAuthenticated ? `Welcome, ${user?.fullName}!` : 'Create Your Account'}</h2>
                  <p className="font-dm text-sm text-[#94A3B8] mt-1">{isAuthenticated ? "You're signed in. Click Next." : 'Already have an account?'}</p>
                </div>
                {!isAuthenticated && (
                  <>
                    {[['text','Full Name','fullName','John Doe'],['email','Email','email','you@example.com'],['tel','Phone','phone','054 000 0000'],['password','Password','password','At least 8 chars']].map(([type, label, key, ph]) => (
                      <div key={key}>
                        <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">{label}</label>
                        <input type={type} placeholder={ph} value={acc[key]}
                          onChange={(e) => setAcc({ ...acc, [key]: type === 'tel' ? e.target.value.replace(/\D/g,'').slice(0,10) : e.target.value })}
                          className="input-base" />
                      </div>
                    ))}
                    <p className="font-dm text-sm text-[#64748B] text-center">Already have an account?{' '}
                      <button onClick={() => setShowAuth(true)} className="text-[#38BDF8] hover:underline font-semibold">Sign in</button>
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 1 — Store Info */}
            {step === 1 && (
              <motion.div key="info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-5">
                <div><h2 className="font-syne font-bold text-2xl text-[#F0F6FF]">Store Details</h2></div>
                <div>
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Store Name *</label>
                  <input type="text" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder="Kwame's Data Hub" className="input-base" />
                  {info.name && <p className="mt-1.5 font-dm text-xs text-[#64748B] flex items-center gap-1"><Globe className="w-3 h-3" /> datapulse.gh/store/{computedSlug}</p>}
                </div>
                <div>
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Description</label>
                  <textarea value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} placeholder="What makes your store special?" rows={3} className="input-base resize-none" />
                </div>
                <div>
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">WhatsApp (with country code)</label>
                  <input type="tel" value={info.whatsapp} onChange={(e) => setInfo({ ...info, whatsapp: e.target.value.replace(/\D/g,'').slice(0,12) })} placeholder="233540000000" className="input-base" />
                </div>
                {/* Logo upload */}
                <div>
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Store Logo</label>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <div onClick={() => logoRef.current?.click()}
                    className="border-2 border-dashed rounded-xl h-[130px] flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[rgba(56,189,248,0.4)]"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--input-bg)' }}>
                    {info.logoPreview
                      ? <img src={info.logoPreview} alt="preview" className="h-20 w-20 object-contain rounded-xl" />
                      : <><Upload className="w-7 h-7 text-[#64748B] mb-2" /><p className="font-dm text-sm text-[#94A3B8]">Click to upload</p></>}
                  </div>
                  {info.logoFile && <p className="mt-1.5 font-dm text-xs text-[#22D3A1] flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {info.logoFile.name}</p>}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Customize */}
            {step === 2 && (
              <motion.div key="cust" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-6">
                <div><h2 className="font-syne font-bold text-2xl text-[#F0F6FF]">Customize Your Store</h2></div>
                <div className="grid grid-cols-3 gap-3">
                  {ACCENT_COLORS.map((c) => (
                    <button key={c.value} onClick={() => setAccent(c.value)}
                      className="rounded-xl p-3 flex items-center gap-2.5 transition-all border"
                      style={{ background: accentColor === c.value ? c.value + '18' : 'var(--input-bg)', borderColor: accentColor === c.value ? c.value : 'var(--border-subtle)' }}>
                      <div className="w-5 h-5 rounded-full shrink-0" style={{ background: c.value }} />
                      <span className="font-dm text-sm" style={{ color: accentColor === c.value ? c.value : '#94A3B8' }}>{c.name}</span>
                      {accentColor === c.value && <Check className="w-4 h-4 ml-auto" style={{ color: c.value }} />}
                    </button>
                  ))}
                </div>
                {/* Preview */}
                <div className="rounded-xl border p-5" style={{ background: accentColor + '10', borderColor: accentColor + '40' }}>
                  <p className="font-dm text-xs text-[#64748B] mb-3 uppercase tracking-wider font-bold">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accentColor + '25', border: `1px solid ${accentColor}40` }}>
                      <Store className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    <div>
                      <p className="font-syne font-bold text-sm text-[#F0F6FF]">{info.name || 'Your Store'}</p>
                      <p className="font-dm text-xs" style={{ color: accentColor }}>{displaySlug || 'your-store'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Launch */}
            {step === 3 && (
              <motion.div key="launch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg,#38BDF8,#22D3A1)' }}>
                  <Rocket className="w-10 h-10 text-[#050A14]" />
                </div>
                <div>
                  <h2 className="font-syne font-bold text-2xl text-[#F0F6FF]">Your Store is Live!</h2>
                  <p className="font-dm text-sm text-[#94A3B8] mt-1">Customers can now find and buy bundles from your store.</p>
                </div>
                <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-subtle)' }}>
                  <Globe className="w-5 h-5 text-[#38BDF8] shrink-0" />
                  <span className="font-dm text-sm text-[#F0F6FF] truncate">datapulse.gh/store/{displaySlug}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1 py-3">Go to Dashboard</button>
                  <button onClick={() => navigate(`/store/${displaySlug}`)} className="btn-ghost flex-1 py-3">View Store</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setStep((p) => Math.max(p - 1, 0))} disabled={step === 0}
                className="flex items-center gap-2 font-dm text-sm text-[#94A3B8] hover:text-[#F0F6FF] disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={next} disabled={loading} className="btn-primary px-6 py-2.5 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{step === 2 ? 'Launch Store' : 'Next'} <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab="login" />
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'overview',  label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'bundles',   label: 'Bundles',   Icon: Package          },
  { id: 'orders',    label: 'Orders',    Icon: ShoppingCart      },
  { id: 'customers', label: 'Customers', Icon: Users             },
  { id: 'earnings',  label: 'Earnings',  Icon: Wallet            },
  { id: 'settings',  label: 'Settings',  Icon: Settings          },
];

function Dashboard() {
  const navigate  = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tab,     setTab]    = useState('overview');
  const [store,   setStore]  = useState(null);
  const [stats,   setStats]  = useState(null);
  const [orders,  setOrders] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    (async () => {
      try {
        const s = await fetchStoreByOwnerId(user.id);
        if (!s) { navigate('/store-builder'); return; }
        setStore(s);
        const [st, or, bu] = await Promise.all([fetchStoreStats(s.id), fetchOrdersByStore(s.id, 20), fetchBundlesByStore(s.id)]);
        setStats(st); setOrders(or); setBundles(bu);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user, isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) return <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin" /></div>;

  const statCards = [
    { label: 'Total Sales',      value: ghs(stats?.totalSales ?? 0),       Icon: TrendingUp,  color: '#22D3A1' },
    { label: 'Orders Today',     value: stats?.ordersToday ?? 0,            Icon: ShoppingCart, color: '#38BDF8' },
    { label: 'Total Orders',     value: stats?.totalOrders ?? 0,            Icon: Package,     color: '#F59E0B' },
    { label: 'Unique Customers', value: stats?.uniqueCustomers ?? 0,        Icon: Users,       color: '#A78BFA' },
  ];

  return (
    <div className="relative z-[1] pt-[70px] min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-screen fixed left-0 top-0 pt-[70px] border-r z-10" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-bold text-sm overflow-hidden" style={{ background: store?.accentColor ?? 'linear-gradient(135deg,#38BDF8,#22D3A1)', color: '#050A14' }}>
              {store?.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" /> : user?.fullName?.[0] ?? 'S'}
            </div>
            <div className="min-w-0">
              <p className="font-syne font-bold text-sm text-[#F0F6FF] truncate">{store?.name ?? user?.fullName}</p>
              <p className="font-dm text-xs text-[#64748B]">Store Owner</p>
            </div>
          </div>
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-dm text-sm font-medium transition-all ${tab === id ? 'text-[#38BDF8]' : 'text-[#94A3B8] hover:text-[#F0F6FF]'}`}
                style={tab === id ? { background: 'rgba(56,189,248,0.08)' } : {}}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
          {store && <button onClick={() => navigate(`/store/${store.slug}`)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-dm text-sm font-medium text-[#94A3B8] hover:text-[#F0F6FF] transition-all mt-4">
            <ExternalLink className="w-4 h-4" /> View Store
          </button>}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-[260px] p-6 lg:p-8">
        {tab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-syne font-bold text-2xl text-[#F0F6FF]">Dashboard</h1>
              <p className="font-dm text-sm text-[#94A3B8] mt-1">Welcome back, {user?.fullName}!</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map(({ label, value, Icon, color }) => (
                <div key={label} className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5" style={{ color }} />
                    <span className="flex items-center gap-1 font-dm text-xs font-semibold text-[#22D3A1]"><ArrowUpRight className="w-3 h-3" /></span>
                  </div>
                  <p className="font-syne font-extrabold text-2xl text-[#F0F6FF]">{value}</p>
                  <p className="font-dm text-xs text-[#64748B] mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Orders table */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-syne font-bold text-lg text-[#F0F6FF]">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {['Reference','Customer','Bundle','Amount','Method','Status','Date'].map((h) => (
                        <th key={h} className="text-left px-5 py-3 font-dm text-xs font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && <tr><td colSpan={7} className="text-center py-10 font-dm text-sm text-[#64748B]">No orders yet.</td></tr>}
                    {orders.map((o) => {
                      const b = bundles.find((x) => x.id === o.bundleId);
                      return (
                        <tr key={o.id} className="transition-colors hover:bg-[var(--surface-hover)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td className="px-5 py-3.5 font-mono text-xs text-[#F0F6FF]">{o.paystackReference}</td>
                          <td className="px-5 py-3.5 font-dm text-sm text-[#94A3B8]">{o.customerPhone}</td>
                          <td className="px-5 py-3.5 font-dm text-sm text-[#F0F6FF]">{b?.name ?? '—'}</td>
                          <td className="px-5 py-3.5 font-dm text-sm font-semibold text-[#22D3A1]">{ghs(o.amount)}</td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex px-2.5 py-1 rounded-full font-dm text-xs font-semibold"
                              style={o.paymentMethod === 'wallet' ? { background: 'rgba(167,139,250,0.1)', color: '#A78BFA' } : { background: 'rgba(56,189,248,0.1)', color: '#38BDF8' }}>
                              {o.paymentMethod === 'wallet' ? 'Wallet' : 'Paystack'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex px-2.5 py-1 rounded-full font-dm text-xs font-semibold"
                              style={o.status === 'completed' ? { background: 'rgba(34,211,161,0.1)', color: '#22D3A1' } : o.status === 'pending' ? { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' } : { background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-dm text-sm text-[#64748B]">{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab !== 'overview' && (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="w-12 h-12 text-[#64748B] mb-4" />
            <h2 className="font-syne font-bold text-xl text-[#F0F6FF] mb-2">Coming Soon</h2>
            <p className="font-dm text-sm text-[#94A3B8]">This section is under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);

  const handle = async () => {
    setBusy(true);
    try { await login(form.email, form.password); navigate('/dashboard'); }
    catch (e) { showToast(e.message ?? 'Login failed', 'error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[420px] rounded-2xl border p-8" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
        <h1 className="font-syne font-bold text-2xl text-[#F0F6FF] mb-6">Sign In</h1>
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base" />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-base" />
          <button onClick={handle} disabled={busy} className="w-full btn-primary py-3.5 disabled:opacity-50">
            {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
          </button>
        </div>
        <p className="mt-4 font-dm text-sm text-center text-[#64748B]">
          No account? <button onClick={() => navigate('/store-builder')} className="text-[#38BDF8] hover:underline">Create one</button>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. APP SHELL
// ─────────────────────────────────────────────────────────────────────────────
const noFooter = ['/dashboard'];

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, transform: 'translateY(10px)' }}
      animate={{ opacity: 1, transform: 'translateY(0)'   }}
      exit={   { opacity: 0, transform: 'translateY(10px)' }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const location = useLocation();
  const showMesh   = location.pathname === '/';
  const showFooter = !noFooter.includes(location.pathname);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {showMesh && <GradientMesh />}
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"              element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/marketplace"   element={<PageWrapper><Marketplace /></PageWrapper>} />
          <Route path="/stores"        element={<PageWrapper><Stores /></PageWrapper>} />
          <Route path="/store-builder" element={<PageWrapper><StoreBuilder /></PageWrapper>} />
          <Route path="/store/:slug"   element={<PageWrapper><StoreView /></PageWrapper>} />
          <Route path="/bundle/:id"    element={<PageWrapper><BundleDetail /></PageWrapper>} />
          <Route path="/dashboard"     element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/login"         element={<PageWrapper><Login /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
