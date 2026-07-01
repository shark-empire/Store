import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, MessageCircle, Loader2 } from 'lucide-react';
import { fetchStoreBySlug, fetchBundlesByStore } from '../api/dataPulseApi';
import BundleCard from '../components/BundleCard';
import StoreCheckoutModal from '../components/StoreCheckoutModal';

export default function StoreView() {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);

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

  if (loading) return <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin" /></div>;

  if (notFound) return (
    <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Store className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
        <h1 className="font-syne font-bold text-2xl text-[#F0F6FF] mb-4">Store Not Found</h1>
        <p className="text-[#94A3B8] text-sm">This store link may be incorrect or no longer active.</p>
      </div>
    </div>
  );

  return (
    <div className="relative z-[1] pt-[70px]">
      <div className="h-[220px] flex flex-col items-center justify-center px-6 relative"
        style={{ background: `linear-gradient(135deg,${store.accentColor}20,rgba(13,21,38,0.95))` }}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundles.map((b) => <BundleCard key={b.id} bundle={b} onBuyClick={setSelectedBundle} />)}
          </div>
        ) : (
          <div className="text-center py-16"><p className="font-dm text-[#94A3B8]">No bundles yet from this store.</p></div>
        )}
      </div>

      {selectedBundle && (
        <StoreCheckoutModal bundle={selectedBundle} storeId={store.id} onClose={() => setSelectedBundle(null)} />
      )}
    </div>
  );
}
