import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Star, ArrowRight, Loader2 } from 'lucide-react';
import { fetchStores } from '../api/dataPulseApi';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.6 } };

export default function Stores() {
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
