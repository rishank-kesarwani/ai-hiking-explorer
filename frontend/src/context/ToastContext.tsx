'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 9999,
          maxWidth: '380px',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: '#0f172a',
              border: `1px solid ${
                toast.type === 'success'
                  ? 'rgba(16, 185, 129, 0.4)'
                  : toast.type === 'error'
                  ? 'rgba(244, 63, 94, 0.4)'
                  : 'rgba(56, 189, 248, 0.4)'
              }`,
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#f8fafc',
              fontSize: '0.9rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
            {toast.type === 'error' && <AlertCircle size={18} color="#f43f5e" />}
            {toast.type === 'info' && <Info size={18} color="#38bdf8" />}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
