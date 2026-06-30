import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Store } from 'lucide-react';
import { fetchBundles } from '../api/dataPulseApi';
import { TESTIMONIALS, networkColors } from '../utils/constants';
import NetworkBadge from '../components/NetworkBadge';
import BundleCard from '../components/BundleCard';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.6 } };

export default function Home() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [busy, setBusy]       = useState(true);

  useEffect(() => { fetchBundles(null, 8).then(setBundles).catch(console.error).finally(() => setBusy(false)); }, []);

  return (
    <div className="relative z-[1]">
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
