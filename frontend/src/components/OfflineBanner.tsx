'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #e11d48, #be123c)',
        color: '#ffffff',
        padding: '0.6rem 1rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 99999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <WifiOff size={18} />
      <span>You are currently offline. Trail searches will use cached and offline mode.</span>
    </div>
  );
};
