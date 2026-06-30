import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Wallet, Settings, ExternalLink, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchStoreByOwnerId, fetchStoreStats, fetchOrdersByStore, fetchBundlesByStore } from '../api/dataPulseApi';
import { ghs } from '../utils/helpers';

const SIDEBAR_ITEMS = [
  { id: 'overview',  label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'bundles',   label: 'Bundles',   Icon: Package          },
  { id: 'orders',    label: 'Orders',    Icon: ShoppingCart      },
  { id: 'customers', label: 'Customers', Icon: Users             },
  { id: 'earnings',  label: 'Earnings',  Icon: Wallet            },
  { id: 'settings',  label: 'Settings',  Icon: Settings          },
];

export default function Dashboard() {
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
        const [st, or, bu] = await Promise.all([
          fetchStoreStats(s.id), 
          fetchOrdersByStore(s.id, 20), 
          fetchBundlesByStore(s.id)
        ]);
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
