import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState(defaultTab);
  const [method, setMethod] = useState('email'); // Toggle for registration
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { setTab(defaultTab); }, [defaultTab, isOpen]);

  const handle = async () => {
    setBusy(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        showToast('Welcome back!', 'success');
        onClose();
      } else {
        // Validation logic
        if (!form.fullName || !form.password || (method === 'email' ? !form.email : !form.phone)) {
          showToast('Please fill all required fields', 'error');
          setBusy(false);
          return;
        }
        await register(form);
        showToast('Account created!', 'success');
        onClose();
      }
    } catch (e) {
      showToast(e.message ?? 'Something went wrong', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" 
         style={{ background: 'rgba(5,10,20,0.8)', backdropFilter: 'blur(8px)' }}
         onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] rounded-2xl border p-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}>
        
        <div className="flex gap-4 mb-6">
          {['login', 'register'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`font-syne font-bold text-lg capitalize transition-colors ${tab === t ? 'text-[#F0F6FF]' : 'text-[#64748B]'}`}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tab === 'register' && (
            <input type="text" placeholder="Full Name" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
              className="input-base text-slate-950" />
          )}

          {tab === 'register' && (
            <div className="flex gap-4 mb-2">
              <button onClick={() => setMethod('email')} className={`text-sm ${method === 'email' ? 'text-white' : 'text-slate-500'}`}>Use Email</button>
              <button onClick={() => setMethod('phone')} className={`text-sm ${method === 'phone' ? 'text-white' : 'text-slate-500'}`}>Use Phone</button>
            </div>
          )}

          {method === 'email' || tab === 'login' ? (
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              className="input-base text-slate-950" />
          ) : (
            <input type="tel" placeholder="Phone Number" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} 
              className="input-base text-slate-950" />
          )}

          <input type="password" placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            className="input-base text-slate-950" />

          <button onClick={handle} disabled={busy} className="w-full btn-primary py-3.5 disabled:opacity-50">
            {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
