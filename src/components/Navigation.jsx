import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, X, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WalletWidget from './WalletWidget';
import AuthModal from './AuthModal';

const navLinks = [
  { label: 'Home',          path: '/'             },
  { label: 'Marketplace',   path: '/marketplace'   },
  { label: 'Stores',        path: '/stores'        },
  { label: 'Store Builder', path: '/store-builder' },
];

export default function Navigation() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [showAuth,  setShowAuth]  = useState(false);
  const [authTab,   setAuthTab]   = useState('login');
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const openAuth = (tab) => { setAuthTab(tab); setShowAuth(true); };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ background: scrolled ? 'rgba(5,10,20,0.97)' : 'rgba(5,10,20,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 h-[70px] flex items-center justify-between">
          <div className="flex items-center">
            <img src="https://i.imgur.com/wKOG6wP.png" alt="Sci-fi Data Logo" className="h-10 w-auto mr-2" />
            <span className="text-xl font-bold">Sci-fi Data</span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.path} to={l.path}
                className={`font-dm text-sm font-medium transition-colors ${location.pathname === l.path ? 'text-[#38BDF8]' : 'text-[#94A3B8] hover:text-[#F0F6FF]'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <WalletWidget userId={user.id} userEmail={user.email} />
                <button onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-dm text-sm font-semibold transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', color: '#94A3B8' }}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button onClick={logout} className="hidden sm:block font-dm text-sm text-[#64748B] hover:text-[#EF4444] transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('login')}  className="hidden sm:block font-dm text-sm font-medium text-[#94A3B8] hover:text-[#F0F6FF] transition-colors">Sign in</button>
                <button onClick={() => openAuth('register')} className="btn-primary px-5 py-2 text-sm">Get Started</button>
              </>
            )}
            <button onClick={() => setMenuOpen((v) => !v)} className="lg:hidden p-2 rounded-lg" style={{ color: '#94A3B8' }}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="px-6 py-4 space-y-1">
                {navLinks.map((l) => (
                  <Link key={l.path} to={l.path}
                    className="block py-2.5 font-dm text-sm font-medium text-[#94A3B8] hover:text-[#F0F6FF] transition-colors">
                    {l.label}
                  </Link>
                ))}
                <div className="pt-3 space-y-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  {isAuthenticated ? (
                    <>
                      <button onClick={() => navigate('/dashboard')} className="w-full btn-ghost py-2.5 text-sm">Dashboard</button>
                      <button onClick={logout} className="w-full font-dm text-sm text-[#EF4444]">Sign out</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => openAuth('login')}    className="w-full btn-ghost py-2.5 text-sm">Sign In</button>
                      <button onClick={() => openAuth('register')} className="w-full btn-primary py-2.5 text-sm">Get Started</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
    </>
  );
}
