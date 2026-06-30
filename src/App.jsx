import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

import GradientMesh from './components/GradientMesh';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import BundleDetail from './pages/BundleDetail';
import Stores from './pages/Stores';
import StoreView from './pages/StoreView';
import StoreBuilder from './pages/StoreBuilder';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#050A14] text-[#F0F6FF] relative overflow-x-hidden selection:bg-[#38BDF8]/30 selection:text-[#38BDF8]">
          <GradientMesh />
          <Navigation />
          
          <div className="pb-20">
            <Routes>
              <Route path="/"              element={<Home />} />
              <Route path="/marketplace"   element={<Marketplace />} />
              <Route path="/bundle/:id"    element={<BundleDetail />} />
              <Route path="/stores"        element={<Stores />} />
              <Route path="/store/:slug"   element={<StoreView />} />
              <Route path="/store-builder" element={<StoreBuilder />} />
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/login"         element={<Login />} />
            </Routes>
          </div>
          
          <Footer />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
