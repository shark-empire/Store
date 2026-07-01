import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ManageStore from './pages/ManageStore';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import StoreBuilder from './pages/StoreBuilder';
import StoreView from './pages/StoreView'; // This is your isolated storefront
import Stores from './pages/Stores';
import BundleDetail from './pages/BundleDetail';

function App() {
  return (
    <Routes>
      {/* ISOLATED STORE ROUTES: No Navigation, No main layout */}
      <Route path="/store/:slug" element={<StoreView />} />

      {/* PLATFORM ROUTES: Includes Navigation and main layout */}
      <Route path="/*" element={
        <div className="min-h-screen">
          <Navigation />
          <main className="pt-[70px]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/store-builder" element={<StoreBuilder />} />
              <Route path="/bundle/:id" element={<BundleDetail />} />
              <Route path="/manage-store" element={<ManageStore />} />
            </Routes>
          </main>
        </div>
      } />
    </Routes>
  );
}

export default App;
