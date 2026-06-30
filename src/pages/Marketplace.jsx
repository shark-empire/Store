import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { fetchBundles } from '../api/dataPulseApi';
import BundleCard from '../components/BundleCard';

const PILL_COLORS = {
  All:     { bg: 'rgba(99,102,241,0.1)',  border: '1px solid rgba(99,102,241,0.35)',  text: '#818CF8' },
  MTN:     { bg: 'rgba(245,158,11,0.1)',  border: '1px solid rgba(245,158,11,0.3)',   text: '#F59E0B' },
  Telecel: { bg: 'rgba(239,68,68,0.1)',   border: '1px solid rgba(239,68,68,0.3)',    text: '#EF4444' },
  AT:      { bg: 'rgba(56,189,248,0.1)',  border: '1px solid rgba(56,189,248,0.3)',   text: '#38BDF8' },
};

export default function Marketplace() {
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
