import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Wallet, Settings, TrendingUp, ArrowUpRight, Loader2, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchStoreByOwnerId, fetchStoreStats, fetchOrdersByStore, fetchBundlesByStore, createBundle } from '../api/dataPulseApi';
import { ghs } from '../utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tab, setTab] = useState('overview');
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async (s) => {
    const [st, or, bu] = await Promise.all([
      fetchStoreStats(s.id),
      fetchOrdersByStore(s.id, 20),
      fetchBundlesByStore(s.id)
    ]);
    setStats(st); setOrders(or); setBundles(bu);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    (async () => {
      try {
        const s = await fetchStoreByOwnerId(user.id);
        if (!s) { navigate('/store-builder'); return; }
        setStore(s);
        await loadData(s);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user, isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) return <div className="pt-[70px] min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin" /></div>;

  return (
    <div className="relative z-[1] pt-[70px] min-h-screen flex">
      <aside className="w-[260px] border-r border-[#1E293B] p-6 space-y-4">
        {[{id:'overview', label:'Dashboard'}, {id:'bundles', label:'Manage Bundles'}].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`w-full text-left p-3 rounded-lg ${tab === item.id ? 'bg-[#38BDF8]/10 text-[#38BDF8]' : 'text-[#94A3B8]'}`}>
            {item.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-8">
        {tab === 'overview' && <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>}
        
        {tab === 'bundles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Your Bundles</h2>
              <button onClick={() => setIsModalOpen(true)} className="bg-[#38BDF8] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <Plus size={16} /> Add Bundle
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bundles.map(b => (
                <div key={b.id} className="p-4 border border-[#1E293B] rounded-xl bg-[#0F172A]">
                  <h3 className="text-white font-bold">{b.name}</h3>
                  <p className="text-sm text-[#94A3B8]">{b.price} GHS | {b.size}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Bundle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <form className="bg-[#050A14] p-8 rounded-2xl w-full max-w-sm border border-[#1E293B]" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await createBundle({ 
              storeId: store.id, 
              name: formData.get('name'), 
              price: formData.get('price'), 
              sizeGb: formData.get('sizeGb'),
              network: 'MTN'
            });
            setIsModalOpen(false);
            loadData(store);
          }}>
            <div className="flex justify-between mb-4">
              <h3 className="text-white font-bold">New Bundle</h3>
              <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-white" /></button>
            </div>
            <input name="name" placeholder="Name" className="w-full mb-3 p-2 bg-[#0F172A] text-white border border-[#1E293B] rounded" required />
            <input name="price" type="number" placeholder="Price" className="w-full mb-3 p-2 bg-[#0F172A] text-white border border-[#1E293B] rounded" required />
            <input name="sizeGb" type="number" placeholder="Size (GB)" className="w-full mb-3 p-2 bg-[#0F172A] text-white border border-[#1E293B] rounded" required />
            <button className="w-full bg-[#38BDF8] text-black font-bold py-2 rounded">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}
