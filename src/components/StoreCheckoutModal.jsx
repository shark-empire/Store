import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { payDirectViaPaystack, createOrder } from '../api/dataPulseApi';
import { useToast } from '../contexts/ToastContext';
import { ghs } from '../utils/helpers';

export default function StoreCheckoutModal({ bundle, storeId, onClose }) {
  const { showToast } = useToast();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const handlePay = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10 || !cleaned.startsWith('0')) {
      showToast('Enter a valid 10-digit phone number', 'error');
      return;
    }
    setBusy(true);
    try {
      const { reference } = await payDirectViaPaystack(bundle, cleaned, storeId);
      await createOrder({
        bundleId: bundle.id,
        storeId,
        customerPhone: cleaned,
        amount: bundle.price,
        paystackReference: reference,
        paymentMethod: 'paystack',
      });
      showToast('Payment successful! Your bundle is on its way.', 'success');
      onClose();
    } catch (e) {
      if (e.message !== 'cancelled') showToast(e.message || 'Payment failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,10,20,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px] rounded-2xl border p-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-syne font-bold text-lg text-[#F0F6FF]">Confirm Purchase</h3>
          <button onClick={onClose} className="text-[#64748B] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="font-syne font-bold text-[#F0F6FF]">{bundle.name}</p>
          <p className="text-sm text-[#94A3B8]">{bundle.size} · {bundle.validity}</p>
          <p className="font-syne font-extrabold text-xl text-[#22D3A1] mt-2">{ghs(bundle.price)}</p>
        </div>

        <label className="block text-sm text-[#94A3B8] mb-2">Phone number to receive data</label>
        <input type="tel" placeholder="024XXXXXXX" value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          className="input-base text-slate-950 mb-4" />

        <button onClick={handlePay} disabled={busy} className="w-full btn-primary py-3.5 disabled:opacity-50">
          {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
            <span className="flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" /> Pay with Paystack</span>
          )}
        </button>
      </motion.div>
    </div>
  );
}
