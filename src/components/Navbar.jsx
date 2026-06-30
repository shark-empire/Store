import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Make sure to install: npm install lucide-react

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo and Name */}
        <Link to="/" className="flex items-center gap-2">
          <img src="https://i.imgur.com/wKOG6wP.png" alt="Logo" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold font-['Syne'] text-white">SCI-FI DATA</span>
        </Link>

        {/* Menu Toggle Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Content */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-black/90 border-b border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <Link to="src/pages/marketplace" onClick={() => setIsOpen(false)} className="text-white hover:text-cyan-400 py-2">Marketplace</Link>
          <Link to="src/pages/dashboard" onClick={() => setIsOpen(false)} className="text-white hover:text-cyan-400 py-2">Dashboard</Link>
          <Link to="src/pages/login" onClick={() => setIsOpen(false)} className="text-white hover:text-cyan-400 py-2">Login</Link>
        </div>
      )}
    </nav>
  );
}
