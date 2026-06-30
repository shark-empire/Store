import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';

import { ToastProvider } from './contexts/ToastContext'; 

import './index.css';
import { AuthProvider } from './contexts/AuthContext'; // 1. Import your provider
import eruda from 'eruda'; // 2. Import eruda

eruda.init(); // 3. Initialize eruda

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider> {/* 4. Wrap App with the Provider */}
<ToastProvider>
        <App />
</ToastProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
