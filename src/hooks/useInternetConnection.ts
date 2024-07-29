import { useEffect, useState } from 'react';

export const useInternetConnection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOnline = () => {
    setIsOnline(true);
  };

  const handleOffline = () => {
    setIsOnline(false);
  };

  return isOnline;
};
