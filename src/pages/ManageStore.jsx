import { useState, useEffect } from 'react';
import { fetchStoreByOwnerId, fetchBundlesByStore, createBundle } from '../api/dataPulseApi';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Loader2 } from 'lucide-react';

export default function ManageStore() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const myStore = await fetchStoreByOwnerId(user.id);
      if (myStore) {
        setStore(myStore);
        const myBundles = await fetchBundlesByStore(myStore.id);
        setBundles(myBundles);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="pt-24 max-w-4xl mx-auto px-6">
      <h1 className="text-2xl font-bold text-white mb-6">Manage {store?.name}</h1>
      
      {/* List of current bundles */}
      <div className="grid gap-4 mb-8">
        {bundles.map(b => (
          <div key={b.id} className="p-4 border border-white/10 rounded-xl flex justify-between">
            <span className="text-white">{b.name} - {b.price} GHS</span>
            <span className="text-sm text-gray-400">{b.size}</span>
          </div>
        ))}
      </div>

      {/* Button to trigger "Add Package" form */}
      <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white">
        <Plus size={18} /> Add New Package
      </button>
    </div>
  );
}
