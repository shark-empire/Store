import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold font-['Syne'] text-white">
          Sci-if Data
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link to="/marketplace" className="text-sm font-medium hover:text-cyan-400 transition-colors">Marketplace</Link>
          <Link to="/dashboard" className="text-sm font-medium hover:text-cyan-400 transition-colors">Dashboard</Link>
          <Link to="/login" className="btn-ghost px-4 py-2 text-sm">Login</Link>
        </div>
      </div>
    </nav>
  );
}
