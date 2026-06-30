import { Routes, Route } from 'react-router-dom';

// Import your existing pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import StoreBuilder from './pages/StoreBuilder';
import StoreView from './pages/StoreView';
import Stores from './pages/Stores';
import BundleDetail from './pages/BundleDetail';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/store-builder" element={<StoreBuilder />} />
        <Route path="/store-view/:id" element={<StoreView />} />
        <Route path="/bundle/:id" element={<BundleDetail />} />
      </Routes>
    </div>
  );
}

export default App;
