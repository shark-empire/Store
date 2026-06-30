import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Store, Palette, Rocket, Check, Upload, ImageIcon, Globe, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { isSlugTaken, uploadStoreLogo, createStore } from '../api/dataPulseApi';
import { ACCENT_COLORS } from '../utils/constants';
import { toSlug } from '../utils/helpers';
import AuthModal from '../components/AuthModal';

const STEPS = [
  { id: 'account',    label: 'Account',   Icon: User    },
  { id: 'store-info', label: 'Store Info', Icon: Store   },
  { id: 'customize',  label: 'Customize',  Icon: Palette },
  { id: 'launch',     label: 'Launch',     Icon: Rocket  },
];

export default function StoreBuilder() {
  const navigate = useNavigate();
  const { isAuthenticated, user, register } = useAuth();
  const { showToast } = useToast();

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const logoRef = useRef(null);

  const [acc, setAcc] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [info, setInfo] = useState({ name: '', description: '', whatsapp: '', logoFile: null, logoPreview: null });
  const [accentColor, setAccent] = useState(ACCENT_COLORS[0].value);
  const [createdSlug, setCreatedSlug] = useState('');

  const computedSlug = toSlug(info.name);
  const displaySlug  = createdSlug || computedSlug;

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInfo((p) => ({ ...p, logoFile: file }));
    const reader = new FileReader();
    reader.onload = () => setInfo((p) => ({ ...p, logoPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const next = async () => {
    if (step === 0) {
      if (isAuthenticated) { setStep(1); return; }
      if (!acc.fullName || !acc.email || !acc.password) { showToast('Fill all required fields', 'error'); return; }
      setLoading(true);
      try { await register(acc); showToast('Account created!', 'success'); setStep(1); }
      catch (e) { showToast(e.message ?? 'Registration failed', 'error'); }
      finally { setLoading(false); }
      return;
    }
    if (step === 1) {
      if (!info.name.trim() || computedSlug.length < 3) { showToast('Enter a valid store name', 'error'); return; }
      setStep(2); return;
    }
    if (step === 2) {
      if (!user) { showToast('You must be logged in', 'error'); return; }
      setLoading(true);
      try {
        let slug = computedSlug;
        if (await isSlugTaken(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
        let logoUrl;
        if (info.logoFile) {
          try { logoUrl = await uploadStoreLogo(info.logoFile, `tmp-${Date.now()}`); } catch { /* fail-silent */ }
        }
        const store = await createStore({ ownerId: user.id, name: info.name.trim(), slug, description: info.description.trim(), whatsapp: info.whatsapp.replace(/\D/g, ''), accentColor, logoUrl });
        setCreatedSlug(store.slug);
        setStep(3);
        showToast('Store created!', 'success');
      } catch (e) { showToast(e.message ?? 'Failed to create store', 'error'); }
      finally { setLoading(false); }
    }
  };

  return (
    <div className="relative z-[1] pt-[70px] min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[600px]">
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map(({ id, Icon }, i) => {
            const done = i < step; const active = i === step;
            return (
              <div key={id} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                  style={done ? { background: '#22D3A1' } : active ? { background: 'linear-gradient(135deg,#38BDF8,#22D3A1)' } : { border: '1px solid var(--border-subtle)' }}>
                  {done ? <Check className="w-4 h-4 text-[#050A14]" /> : <Icon className={`w-4 h-4 ${active ? 'text-[#050A14]' : 'text-[#64748B]'}`} />}
                </div>
                {i < STEPS.length - 1 && <div className="w-8 h-[2px] transition-all duration-300" style={{ background: i < step ? '#22D3A1' : 'var(--border-subtle)' }} />}
              </div>
            );
          })}
        </div>

        <div className="rounded-[20px] border p-8 sm:p-10" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="acc" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-5">
                <div>
                  <h2 className="font-syne font-bold text-2xl text-[#F0F6FF]">{isAuthenticated ? `Welcome, ${user?.fullName}!` : 'Create Your Account'}</h2>
                  <p className="font-dm text-sm text-[#94A3B8] mt-1">{isAuthenticated ? "You're signed in. Click Next." : 'Already have an account?'}</p>
                </div>
                {!isAuthenticated && (
                  <>
                    {[['text','Full Name','fullName','John Doe'],['email','Email','email','you@example.com'],['tel','Phone','phone','054 000 0000'],['password','Password','password','At least 8 chars']].map(([type, label, key, ph]) => (
                      <div key={key}>
                        <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">{label}</label>
                        <input type={type} placeholder={ph} value={acc[key]}
                          onChange={(e) => setAcc({ ...acc, [key]: type === 'tel' ? e.target.value.replace(/\D/g,'').slice(0,10) : e.target.value })}
                          className="input-base" />
                      </div>
                    ))}
                    <p className="font-dm text-sm text-[#64748B] text-center">Already have an account?{' '}
                      <button onClick={() => setShowAuth(true)} className="text-[#38BDF8] hover:underline font-semibold">Sign in</button>
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-5">
                <div><h2 className="font-syne font-bold text-2xl text-[#F0F6FF]">Store Details</h2></div>
                <div>
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Store Name *</label>
                  <input type="text" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder="Kwame's Data Hub" className="input-base" />
                  {info.name && <p className="mt-1.5 font-dm text-xs text-[#64748B] flex items-center gap-1"><Globe className="w-3 h-3" /> datapulse.gh/store/{computedSlug}</p>}
                </div>
                <div>
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Description</label>
                  <textarea value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} placeholder="What makes your store special?" rows={3} className="input-base resize-none" />
                </div>
                <div>
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">WhatsApp (with country code)</label>
                  <input type="tel" value={info.whatsapp} onChange={(e) => setInfo({ ...info, whatsapp: e.target.value.replace(/\D/g,'').slice(0,12) })} placeholder="233540000000" className="input-base" />
                </div>
                <div>
                  <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Store Logo</label>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <div onClick={() => logoRef.current?.click()}
                    className="border-2 border-dashed rounded-xl h-[130px] flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[rgba(56,189,248,0.4)]"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--input-bg)' }}>
                    {info.logoPreview
                      ? <img src={info.logoPreview} alt="preview" className="h-20 w-20 object-contain rounded-xl" />
                      : <><Upload className="w-7 h-7 text-[#64748B] mb-2" /><p className="font-dm text-sm text-[#94A3B8]">Click to upload</p></>}
                  </div>
                  {info.logoFile && <p className="mt-1.5 font-dm text-xs text-[#22D3A1] flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {info.logoFile.name}</p>}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="cust" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-6">
                <div><h2 className="font-syne font-bold text-2xl text-[#F0F6FF]">Customize Your Store</h2></div>
                <div className="grid grid-cols-3 gap-3">
                  {ACCENT_COLORS.map((c) => (
                    <button key={c.value} onClick={() => setAccent(c.value)}
                      className="rounded-xl p-3 flex items-center gap-2.5 transition-all border"
                      style={{ background: accentColor === c.value ? c.value + '18' : 'var(--input-bg)', borderColor: accentColor === c.value ? c.value : 'var(--border-subtle)' }}>
                      <div className="w-5 h-5 rounded-full shrink-0" style={{ background: c.value }} />
                      <span className="font-dm text-sm" style={{ color: accentColor === c.value ? c.value : '#94A3B8' }}>{c.name}</span>
                      {accentColor === c.value && <Check className="w-4 h-4 ml-auto" style={{ color: c.value }} />}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border p-5" style={{ background: accentColor + '10', borderColor: accentColor + '40' }}>
                  <p className="font-dm text-xs text-[#64748B] mb-3 uppercase tracking-wider font-bold">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accentColor + '25', border: `1px solid ${accentColor}40` }}>
                      <Store className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    <div>
                      <p className="font-syne font-bold text-sm text-[#F0F6FF]">{info.name || 'Your Store'}</p>
                      <p className="font-dm text-xs" style={{ color: accentColor }}>{displaySlug || 'your-store'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="launch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg,#38BDF8,#22D3A1)' }}>
                  <Rocket className="w-10 h-10 text-[#050A14]" />
                </div>
                <div>
                  <h2 className="font-syne font-bold text-2xl text-[#F0F6FF]">Your Store is Live!</h2>
                  <p className="font-dm text-sm text-[#94A3B8] mt-1">Customers can now find and buy bundles from your store.</p>
                </div>
                <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-subtle)' }}>
                  <Globe className="w-5 h-5 text-[#38BDF8] shrink-0" />
                  <span className="font-dm text-sm text-[#F0F6FF] truncate">datapulse.gh/store/{displaySlug}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1 py-3">Go to Dashboard</button>
                  <button onClick={() => navigate(`/store/${displaySlug}`)} className="btn-ghost flex-1 py-3">View Store</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setStep((p) => Math.max(p - 1, 0))} disabled={step === 0}
                className="flex items-center gap-2 font-dm text-sm text-[#94A3B8] hover:text-[#F0F6FF] disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={next} disabled={loading} className="btn-primary px-6 py-2.5 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{step === 2 ? 'Launch Store' : 'Next'} <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab="login" />
    </div>
  );
}
