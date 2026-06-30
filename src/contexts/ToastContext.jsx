import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const toastColors = { success: '#22D3A1', error: '#EF4444', info: '#38BDF8', warn: '#F59E0B' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={   { opacity: 0, y: 20, scale: 0.95 }}
              style={{
                background: '#0D1526',
                border: `1px solid ${toastColors[t.type]}44`,
                borderLeft: `3px solid ${toastColors[t.type]}`,
                borderRadius: 10,
                padding: '12px 18px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                color: '#F0F6FF',
                maxWidth: 340,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
