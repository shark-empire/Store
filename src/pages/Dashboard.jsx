import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchStoreByOwnerId } from '../api/dataPulseApi';
import ManageStore from './ManageStore'; // Import the page component

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tab, setTab] = useState('overview');
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    (async () => {
      const s = await fetchStoreByOwnerId(user.id);
      if (s) setStore(s);
      setLoading(false);
    })();
  }, [user, isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) return <div className="pt-[70px] min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

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
        {tab === 'bundles' && store && <ManageStore storeId={store.id} />}
      </main>
    </div>
  );
}
