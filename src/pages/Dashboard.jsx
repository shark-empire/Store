import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import WalletWidget from '../components/WalletWidget';

import {
  LayoutDashboard, Package, ShoppingBag, Wallet, Loader2, RefreshCw,
  Copy, ExternalLink, TrendingUp, Clock, CheckCircle2, XCircle,
  AlertCircle, Store as StoreIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchStoreByOwnerId, fetchOrdersByStore } from '../api/dataPulseApi';
import ManageStore from './ManageStore';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  completed: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
  failed:    { label: 'Failed',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  icon: XCircle },
  refunded:  { label: 'Refunded',  color: '#94A3B8', bg: 'rgba(148,163,184,0.1)',icon: AlertCircle },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: c.color, background: c.bg }}>
      <Icon className="w-3.5 h-3.5" />{c.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#94A3B8]">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${accent}1A` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white font-syne">{value}</p>
    </div>
  );
}

function OrdersTable({ orders, loading }) {
  if (loading && orders.length === 0) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#38BDF8]" /></div>;
  }
  if (orders.length === 0) {
    return <p className="text-sm text-[#64748B] text-center py-10">No orders yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#64748B] border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <th className="pb-3 font-medium">Order</th>
            <th className="pb-3 font-medium">Customer</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
         {orders.map(o => (
  <tr key={o.id} className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
    <td className="py-3 text-[#F0F6FF] font-mono text-xs">{o.paystackReference?.slice(0, 12) || o.id.slice(0, 8)}</td>
    <td className="py-3 text-[#94A3B8]">{o.customerPhone || '—'}</td>
    <td className="py-3 text-[#F0F6FF]">GHS {o.amount.toFixed(2)}</td>
    <td className="py-3"><StatusBadge status={o.status} /></td>
    <td className="py-3 text-[#64748B]">{new Date(o.createdAt).toLocaleDateString()}</td>
  </tr>
))}

        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('overview');
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadOrders = useCallback(async (storeId) => {
    if (!storeId) return;
    setOrdersLoading(true);
    try {
      setOrders(await fetchOrdersByStoreId(storeId) || []);
    } catch {
      showToast('Could not refresh orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    (async () => {
      const s = await fetchStoreByOwnerId(user.id);
      if (s) { setStore(s); await loadOrders(s.id); }
      setLoading(false);
    })();
  }, [user, isAuthenticated, authLoading, navigate, loadOrders]);

  const copyStoreLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/store/${store.slug}`);
    showToast('Store link copied', 'success');
  };

  if (authLoading || loading) {
    return <div className="pt-[70px] min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#38BDF8]" /></div>;
  }

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (Number(o.amount) || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'bundles', label: 'Manage Bundles', icon: Package },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="relative z-[1] pt-[70px] min-h-screen flex">
      <aside className="w-[260px] border-r p-6 space-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
        {store && (
          <div className="mb-6 p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-2 mb-1">
              <StoreIcon className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-sm font-bold text-white truncate">{store.name}</span>
            </div>
            <button onClick={copyStoreLink} className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#38BDF8] transition-colors mt-2">
              <Copy className="w-3 h-3" />Copy store link
            </button>
          </div>
        )}
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 text-left p-3 rounded-lg transition-colors ${
                tab === item.id ? 'bg-[#38BDF8]/10 text-[#38BDF8]' : 'text-[#94A3B8] hover:bg-white/5'
              }`}>
              <Icon className="w-4 h-4" />{item.label}
            </button>
          );
        })}
      </aside>

      <main className="flex-1 p-8">
        {(tab === 'overview' || tab === 'orders') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white font-syne">
                {tab === 'overview' ? 'Dashboard Overview' : 'Orders'}
              </h1>
              <button onClick={() => loadOrders(store?.id)} disabled={ordersLoading}
                className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white px-3 py-2 rounded-lg border transition-colors"
                style={{ borderColor: 'var(--border-subtle)' }}>
                <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />Refresh status
              </button>
            </div>

            {tab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={TrendingUp} label="Total Revenue" value={`GHS ${totalRevenue.toFixed(2)}`} accent="#38BDF8" />
                <StatCard icon={CheckCircle2} label="Completed Orders" value={completedCount} accent="#10B981" />
                <StatCard icon={Clock} label="Pending Orders" value={pendingCount} accent="#F59E0B" />
              </div>
            )}

            <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">{tab === 'overview' ? 'Recent Orders' : 'All Orders'}</h2>
                {store && (
                  <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-[#38BDF8]">
                    View store <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <OrdersTable orders={tab === 'overview' ? orders.slice(0, 5) : orders} loading={ordersLoading} />
            </div>
          </div>
        )}

        {tab === 'bundles' && store && <ManageStore storeId={store.id} />}
       {tab === 'wallet' && (
  <div className="max-w-md">
    <h1 className="text-2xl font-bold text-white font-syne mb-4">Wallet</h1>
    <WalletWidget />
  </div>
)}

      </main>
    </div>
  );
}
