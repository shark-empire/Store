import { useState, useEffect, useCallback } from 'react';
import { Wallet, ChevronDown, Loader2 } from 'lucide-react';
import { fetchWallet, topUpWalletViaPaystack } from '../api/dataPulseApi';
import { useToast } from '../contexts/ToastContext';
import { ghs } from '../utils/helpers';

export default function WalletWidget({ userId, userEmail, onBalanceChange }) {
  const { showToast }       = useToast();
  const [wallet,  setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmt, setTopUpAmt] = useState('');
  const [topping, setTopping]   = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const w = await fetchWallet(userId);
    setWallet(w);
    onBalanceChange?.(w?.balance ?? 0);
    setLoading(false);
  }, [userId, onBalanceChange]);

  useEffect(() => { load(); }, [load]);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmt);
    if (!amount || amount < 1) { showToast('Minimum top-up is GH₵1', 'warn'); return; }
    if (amount > 5000)         { showToast('Maximum top-up is GH₵5,000', 'warn'); return; }
    setTopping(true);
    try {
      await topUpWalletViaPaystack(userId, userEmail, amount);
      showToast(`Top-up of ${ghs(amount)} initiated. Wallet will update shortly.`, 'success');
      setShowTopUp(false);
      setTopUpAmt('');
      setTimeout(load, 3000);
      setTimeout(load, 7000);
    } catch (e) {
      if (e.message !== 'cancelled') showToast('Top-up failed', 'error');
    } finally {
      setTopping(false);
    }
  };

  if (loading) return <div className="h-10 w-32 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />;

  return (
    <div className="relative">
      <button
        onClick={() => setShowTopUp((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-dm text-sm font-semibold transition-all"
        style={{ background: 'rgba(34,211,161,0.1)', border: '1px solid rgba(34,211,161,0.25)', color: '#22D3A1' }}
      >
        <Wallet className="w-4 h-4" />
        {ghs(wallet?.balance ?? 0)}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTopUp ? 'rotate-180' : ''}`} />
      </button>

      {showTopUp && (
        <div className="absolute right-0 top-full mt-2 rounded-xl border p-4 w-64 z-50"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
          <p className="font-syne font-bold text-sm text-[#F0F6FF] mb-3">Top Up Wallet</p>
          <div className="flex gap-2 mb-2">
            {[5, 10, 20, 50].map((amt) => (
              <button key={amt} onClick={() => setTopUpAmt(String(amt))}
                className="flex-1 py-1.5 rounded-lg font-dm text-xs font-semibold transition-all"
                style={{
                  background: topUpAmt === String(amt) ? 'rgba(56,189,248,0.15)' : 'var(--input-bg)',
                  border: `1px solid ${topUpAmt === String(amt) ? '#38BDF8' : 'var(--border-subtle)'}`,
                  color: topUpAmt === String(amt) ? '#38BDF8' : '#94A3B8',
                }}>
                {amt}
              </button>
            ))}
          </div>
          <input type="number" placeholder="Custom amount" value={topUpAmt}
            onChange={(e) => setTopUpAmt(e.target.value)} className="input-base mb-3 text-sm" />
          <button onClick={handleTopUp} disabled={topping} className="w-full btn-primary py-2.5 text-sm disabled:opacity-50">
            {topping ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Pay ${topUpAmt ? ghs(topUpAmt) : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
