import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatPhoneNumber } from '../utils/helpers';
import PhoneInput from '../components/PhoneInput';

export default function Login() {
  const [authType, setAuthType] = useState('email'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('input');

  return (
    <div className="relative z-[1] pt-[100px] min-h-screen flex flex-col items-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[420px] rounded-2xl border p-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}
      >
        <div className="text-center mb-8">
          <h2 className="font-syne font-bold text-2xl text-[#F0F6FF] mb-2">Welcome Back</h2>
          <p className="font-dm text-sm text-[#94A3B8]">Sign in to manage your store and bundles.</p>
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-subtle)' }}>
          {['email', 'phone'].map((type) => (
            <button 
              key={type} 
              onClick={() => { setAuthType(type); setStep('input'); setOtp(''); }}
              className={`flex-1 py-2.5 rounded-lg font-dm text-sm font-semibold capitalize transition-all ${
                authType === type ? 'text-[#050A14] bg-[#38BDF8] shadow-sm' : 'text-[#94A3B8] hover:text-[#F0F6FF]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {authType === 'email' ? (
          <EmailForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} />
        ) : (
          <PhoneForm phone={phone} setPhone={setPhone} otp={otp} setOtp={setOtp} step={step} setStep={setStep} />
        )}
      </motion.div>
    </div>
  );
}

function EmailForm({ email, setEmail, password, setPassword }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { showToast('Please fill in all fields', 'warn'); return; }
    setLoading(true);
    try {
      await login(email, password);
      showToast('Signed in successfully!', 'success');
    } catch (e) {
      showToast(e.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailLogin} className="space-y-4">
      <div>
        <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Email Address</label>
        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" required />
      </div>
      <div>
        <label className="block font-dm text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Password</label>
        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="input-base" required />
      </div>
      <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 disabled:opacity-50 mt-2">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
      </button>
    </form>
  );
}

function PhoneForm({ phone, setPhone, otp, setOtp, step, setStep }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const OTP_ENDPOINT = 'https://naneqdnezdtpksfwgyap.supabase.co/functions/v1/bright-endpoint';

  const handleSendOTP = async () => {
    if (!phone || phone.length < 9) { showToast('Enter a valid phone number', 'error'); return; }
    setLoading(true);
    try {
      const response = await fetch(OTP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone: formatPhoneNumber(phone) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP.');
      showToast('OTP sent to your phone!', 'success');
      setStep('verify');
    } catch (e) {
      showToast(e.message, 'error');
    } finally{ setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) { showToast('Enter the full 6-digit OTP', 'error'); return; }
    setLoading(true);
    try {
      const response = await fetch(OTP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone: formatPhoneNumber(phone), code: otp }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Invalid or expired OTP');
      showToast('Phone verified successfully!', 'success');
      navigate('/dashboard');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'input' ? (
        <>
          <PhoneInput value={phone} onChange={setPhone} disabled={loading} />
          <button onClick={handleSendOTP} disabled={loading} className="w-full btn-primary py-3.5 disabled:opacity-50 mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <p className="font-dm text-sm text-[#94A3B8] text-center mb-2">Code sent to <span className="text-[#F0F6FF] font-semibold">{phone}</span></p>
          <input type="text" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="input-base w-full text-center tracking-[0.5em] font-mono text-xl font-bold" />
          <button onClick={handleVerifyOTP} disabled={loading} className="w-full btn-primary py-3.5 disabled:opacity-50 mt-4">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify OTP'}
          </button>
          <button onClick={() => { setStep('input'); setOtp(''); }} disabled={loading} className="w-full font-dm text-sm text-[#64748B] hover:text-[#F0F6FF] transition-colors mt-2">Change Phone Number</button>
        </>
      )}
    </div>
  );
}
