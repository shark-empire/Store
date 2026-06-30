import { useState } from 'react';
import { phoneMatchesNetwork } from '../utils/helpers';

export default function PhoneInput({ value, onChange, network, disabled }) {
  const [verifying, setVerifying] = useState(false);
  const [verified,  setVerified]  = useState(false);
  const [mismatch,  setMismatch]  = useState(false);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setVerified(false); setMismatch(false);
    onChange(raw);
  };

  const handleBlur = async () => {
    if (value.length < 9) return;
    if (!network) return;
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 400));
    const ok = phoneMatchesNetwork(value, network);
    setVerified(ok); setMismatch(!ok);
    setVerifying(false);
  };

  return (
    <div>
      <div className="flex items-stretch rounded-[10px] overflow-hidden transition-all"
        style={{ border: `1px solid ${mismatch ? '#EF4444' : verified ? '#22D3A1' : 'var(--border-subtle)'}`, background: 'var(--input-bg)' }}>
        <div className="flex items-center gap-2 px-4 shrink-0" style={{ borderRight: '1px solid var(--border-subtle)' }}>
          <img src="https://flagcdn.com/w20/gh.png" alt="GH" className="w-5 rounded-sm" />
          <span className="font-dm text-sm font-semibold text-[#94A3B8]">+233</span>
        </div>
        <input type="tel" value={value} onChange={handleChange} onBlur={handleBlur}
          placeholder="54 000 0000" disabled={disabled}
          className="flex-1 bg-transparent px-4 py-3.5 font-dm text-[15px] text-[#F0F6FF] outline-none placeholder:text-[#64748B] disabled:opacity-50" />
      </div>
      {verifying && <p className="mt-1.5 font-dm text-xs text-[#94A3B8] animate-pulse">Checking prefix…</p>}
      {verified  && <p className="mt-1.5 font-dm text-xs text-[#22D3A1] font-semibold">✓ Valid {network} number</p>}
      {mismatch  && <p className="mt-1.5 font-dm text-xs text-[#EF4444]">⚠ This prefix doesn't match {network}</p>}
    </div>
  );
}
