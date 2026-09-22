import { useEffect, useRef } from 'react';

const useAutoRefresh = () => {
  const leaveTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Store the timestamp when the tab becomes inactive
        leaveTimeRef.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        if (leaveTimeRef.current && Date.now() - leaveTimeRef.current >= 180000) {
          window.location.reload(); // Reload after 3 minutes away
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

export default useAutoRefresh;
