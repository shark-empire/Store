import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Store, Star, Wallet, CreditCard, AlertTriangle, Clock, Shield, Headphones, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchBundleById, fetchWallet, createOrder, deductWallet, payDirectViaPaystack } from '../api/dataPulseApi';
import { ghs, makeRef } from '../utils/helpers';
import NetworkBadge from '../components/NetworkBadge';
import PhoneInput from '../components/PhoneInput';
import AuthModal from '../components/AuthModal';

export default function BundleDetail() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast }     = useToast();

  const [bundle, setBundle] = useState(null);
  const [store,  setStore]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone]   = useState('');
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setRef] = useState('');
  const [payMethod, setPayMethod] = useState('direct');
  const [walletBalance, setWalletBalance] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const b = await fetchBundleById(id);
      setBundle(b);
      if (b?.store) {
        setStore({
          id:          b.store.id,
          name:        b.store.name,
          slug:        b.store.slug,
          accentColor: b.store.accent_color ?? '#38BDF8',
          whatsapp:    b.store.whatsapp ?? null,
          logo:        b.store.logo_url ?? null,
        });
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (user) fetchWallet(user.id).then((w) => setWalletBalance(w?.balance ?? 0));
  }, [user]);

  const handleBuy = async () => {
    if (!phone || phone.length < 9) { showToast('Enter a valid phone number', 'error'); return; }
    if (!isAuthenticated && payMethod === 'wallet') { setShowAuthModal(true); return; }

    setBuying(true);
    try {
      let ref;

      if (payMethod === 'wallet') {
        if (walletBalance < bundle.price) {
          showToast(`Insufficient wallet balance. Top up at least ${ghs(bundle.price - walletBalance)} more.`, 'error');
          setBuying(false);
          return;
        }
        const order = await createOrder({
          bundleId:          bundle.id,
          storeId:           bundle.storeId,
          customerPhone:     phone,
          amount:            bundle.price,
          paystackReference: makeRef(),
          paymentMethod:     'wallet',
        });
        await deductWallet(user.id, bundle.price, order.id);
        ref = order.paystackReference;
        setWalletBalance((prev) => prev - bundle.price);
      } else {
        const result = await payDirectViaPaystack(bundle, phone, bundle.storeId, user?.email);
        ref = result.reference;
        await createOrder({
          bundleId:          bundle.id,
          storeId:           bundle.storeId,
          customerPhone:     phone,
          amount:            bundle.price,
          paystackReference: ref,
          paymentMethod:     'paystack',
        });
      }

      setRef(ref);
      setSuccess(true);
      showToast('Payment confirmed! Data delivery in progress.', 'success');
    } catch (e) {
      if (e.message !== 'cancelled') showToast(e.message || 'Payment failed', 'error');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin" /></div>;
  if (!bundle) return <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="font-syne font-bold text-2xl text-[#F0F6FF] mb-4">Bundle Not Found</h1><button onClick={() => navigate('/marketplace')} className="btn-primary">Browse Bundles</button></div></div>;

  const hasSufficientBalance = walletBalance >= bundle.price;

  return (
    <div className="relative z-[1] pt-[70px]">
      <div className="max-w-[1200px] mx-auto px-6 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 font-dm text-sm text-[#94A3B8] hover:text-[#F0F6FF] transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
      </div>

      {success ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[500px] mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#22D3A1,#10B981)' }}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-syne font-extrabold text-3xl text-[#F0F6FF] mb-2">Payment Confirmed!</h1>
          <p className="font-dm text-[#94A3B8] mb-2 font-mono text-sm">Ref: {reference}</p>
          <p className="font-dm text-[#94A3B8] mb-8">Your {bundle.size} {bundle.network} data bundle will be sent to <span className="text-[#F0F6FF] font-semibold">{phone}</span> within minutes.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/marketplace')} className="btn-primary flex-1">Browse More</button>
            <button onClick={() => { setSuccess(false); setPhone(''); }} className="btn-ghost flex-1">Buy Again</button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
              <NetworkBadge network={bundle.network} size="lg" />
              <h1 className="font-syne font-extrabold text-3xl sm:text-4xl text-[#F0F6FF] mt-4 mb-2">{bundle.name}</h1>
              <p className="font-dm text-base text-[#94A3B8] mb-6">{bundle.size} · Valid for {bundle.validity}</p>
              {bundle.description && <p className="font-dm text-[15px] text-[#94A3B8] leading-relaxed mb-8">{bundle.description}</p>}
              {store && (
                <div className="rounded-xl border p-5 flex items-center gap-4" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: store.accentColor + '20' }}>
                    {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" /> : <Store className="w-6 h-6" style={{ color: store.accentColor }} />}
                  </div>
                  <div className="flex-1"><p className="font-syne font-bold text-sm text-[#F0F6FF]">{store.name}</p><div className="flex gap-0.5">{Array(5).fill(0).map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />)}</div></div>
                  <button onClick={() => navigate(`/store/${store.slug}`)} className="font-dm text-sm text-[#38BDF8] hover:underline">View Store</button>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
              <div className="sticky top-[90px] rounded-[20px] border p-6 sm:p-8"
                style={{ background: 'var(--card-bg)', backdropFilter: 'blur(20px)', borderColor: 'var(--border-subtle)', boxShadow: '0 16px 50px rgba(0,0,0,0.4)' }}>
                <div className="h-[2px] w-full mb-6" style={{ background: 'linear-gradient(90deg,#38BDF8,#22D3A1)' }} />
                <p className="font-syne font-extrabold text-3xl text-[#22D3A1] mb-6">{ghs(bundle.price)}</p>

                <div className="mb-5">
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" />,     sub: isAuthenticated ? ghs(walletBalance) : 'Sign in' },
                      { v: 'direct', label: 'Paystack', icon: <CreditCard className="w-4 h-4" />, sub: 'Card / MoMo' },
                    ].map(({ v, label, icon, sub }) => (
                      <button key={v} onClick={() => { if (v === 'wallet' && !isAuthenticated) setShowAuthModal(true); else setPayMethod(v); }}
                        className="rounded-xl p-3 flex flex-col items-start gap-1 transition-all border"
                        style={{
                          background: payMethod === v ? 'rgba(56,189,248,0.08)' : 'var(--input-bg)',
                          borderColor: payMethod === v ? '#38BDF8' : 'var(--border-subtle)',
                        }}>
                        <span style={{ color: payMethod === v ? '#38BDF8' : '#94A3B8' }}>{icon}</span>
                        <span className="font-syne font-bold text-xs text-[#F0F6FF]">{label}</span>
                        <span className="font-dm text-[11px]" style={{ color: v === 'wallet' && isAuthenticated && !hasSufficientBalance ? '#EF4444' : '#64748B' }}>{sub}</span>
                      </button>
                    ))}
                  </div>
                  {payMethod === 'wallet' && isAuthenticated && !hasSufficientBalance && (
                    <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                      <p className="font-dm text-xs text-[#EF4444]">Need {ghs(bundle.price - walletBalance)} more. Top up in the nav bar.</p>
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Recipient Number</label>
                  <PhoneInput value={phone} onChange={setPhone} network={bundle.network} disabled={buying} />
                </div>

                <button onClick={handleBuy} disabled={buying || (payMethod === 'wallet' && !hasSufficientBalance)}
                  className="w-full btn-primary py-4 text-base disabled:opacity-40">
                  {buying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : payMethod === 'wallet' ? `Pay with Wallet` : 'Pay with Paystack'}
                </button>

                <div className="mt-5 pt-5 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {[['Instant Delivery', Clock],['Secure Payment', Shield],['24/7 Support', Headphones]].map(([label, Icon]) => (
                    <div key={label} className="flex items-center gap-2.5 text-[#94A3B8]">
                      <Icon className="w-4 h-4 text-[#38BDF8]" />
                      <span className="font-dm text-xs font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />
    </div>
  );
}
