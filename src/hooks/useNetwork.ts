"use client"
import { useEffect, useState } from 'react';

export function useNetwork() {
  const [isOnline, setNetwork] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setNetwork(true);
    const handleOffline = () => setNetwork(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
