import { useState, useEffect } from 'react';
import { fetchStoreByOwnerId, fetchBundlesByStore, createBundle } from '../api/dataPulseApi';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Loader2, X } from 'lucide-react';

export default function ManageStore() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => { loadData(); }, [user]);

  if (loading) return <Loader2 className="animate-spin mx-auto mt-20" />;

  return (
    <div className="pt-24 max-w-4xl mx-auto px-6">
      <h1 className="text-2xl font-bold text-white mb-6">Manage {store?.name}</h1>
      
      <div className="grid gap-4 mb-8">
        {bundles.map(b => (
          <div key={b.id} className="p-4 border border-white/10 rounded-xl flex justify-between bg-[#050A14]">
            <span className="text-white">{b.name} - {b.price} GHS</span>
            <span className="text-sm text-gray-400">{b.sizeGb} GB</span>
          </div>
        ))}
      </div>

      <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white">
        <Plus size={18} /> Add New Package
      </button>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
         <form className="bg-[#050A14] border border-white/10 p-6 rounded-2xl w-full max-w-sm space-y-4" onSubmit={async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await createBundle({
    storeId: store.id,
    name: formData.get('name'),
    price: formData.get('price'),
    sizeGb: formData.get('sizeGb'),
    network: formData.get('network') // Capture the network selection
  });
  setIsModalOpen(false);
  loadData();
}}>
  <div className="flex justify-between items-center">
    <h3 className="text-lg font-bold text-white">Add Package</h3>
    <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-gray-400" /></button>
  </div>
  
  <input name="name" placeholder="Bundle Name" className="w-full p-3 bg-black border border-white/10 rounded-lg text-white" required />
  
  {/* Added Network Dropdown */}
  <select name="network" className="w-full p-3 bg-black border border-white/10 rounded-lg text-white" required>
    <option value="MTN">MTN</option>
    <option value="Telecel">Telecel</option>
    <option value="AT">AT</option>
  </select>
  
  <input name="price" type="number" placeholder="Price (GHS)" className="w-full p-3 bg-black border border-white/10 rounded-lg text-white" required />
  <input name="sizeGb" type="number" placeholder="Size (GB)" className="w-full p-3 bg-black border border-white/10 rounded-lg text-white" required />
  
  <button type="submit" className="w-full py-3 bg-blue-600 rounded-lg text-white font-bold">Save Package</button>
</form>

        </div>
      )}
    </div>
  );
}
