import { Link } from 'react-router-dom';

const footerLinks = {
  Platform: [{ label: 'Marketplace', href: '/marketplace' }, { label: 'Store Builder', href: '/store-builder' }, { label: 'Pricing', href: '#' }, { label: 'API Docs', href: '#' }],
  Company:  [{ label: 'About Us',    href: '#' }, { label: 'Blog',    href: '#' }, { label: 'Careers', href: '#' }, { label: 'Contact', href: '#' }],
  Support:  [{ label: 'Help Center', href: '#' }, { label: 'Terms',   href: '#' }, { label: 'Privacy', href: '#' }, { label: 'Report',  href: '#' }],
};

export default function Footer() {
  return (
    <footer className="border-t" style={{ background: '#0D1526', borderColor: 'var(--border-subtle)' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#38BDF8,#22D3A1)' }}>
                <span className="font-syne font-extrabold text-sm text-[#050A14]">DP</span>
              </div>
              <span className="font-syne font-extrabold text-lg text-gradient">DataPulse</span>
            </div>
            <p className="font-dm text-sm text-[#64748B] mb-5 leading-relaxed">Ghana's leading data bundle marketplace. Buy instantly, sell easily.</p>
          </div>
          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <h4 className="font-syne font-bold text-sm text-[#F0F6FF] mb-4">{cat}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => <li key={l.label}><Link to={l.href} className="font-dm text-sm text-[#64748B] hover:text-[#F0F6FF] transition-colors">{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="font-dm text-[13px] text-[#64748B]">© 2026 Sci-fi Data. All rights reserved.</p>
          <p className="font-dm text-[13px] text-[#64748B]">Powered by <span className="text-[#38BDF8]">Sci-Fi Tech</span></p>
        </div>
      </div>
    </footer>
  );
}
