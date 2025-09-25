import { useEffect, useRef, useCallback } from 'react';

interface UserActivityOptions {
  onActivity?: () => void;
  throttleMs?: number;
  enableLogging?: boolean;
}

export const useUserActivity = (options: UserActivityOptions = {}) => {
  const {
    onActivity,
    throttleMs = 1000, // Por defecto, throttle de 1 segundo
    enableLogging = false
  } = options;

  const lastActivityRef = useRef<number>(Date.now());
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isThrottledRef = useRef<boolean>(false);

  const handleActivity = useCallback(() => {
    if (isThrottledRef.current) return;

    const now = Date.now();
    lastActivityRef.current = now;
    
    if (enableLogging) {
      console.log('🎯 Actividad del usuario detectada:', new Date(now).toLocaleTimeString());
    }

    onActivity?.();

    // Aplicar throttle
    isThrottledRef.current = true;
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }
    
    throttleTimeoutRef.current = setTimeout(() => {
      isThrottledRef.current = false;
    }, throttleMs);
  }, [onActivity, throttleMs, enableLogging]);

  const getTimeSinceLastActivity = useCallback(() => {
    return Date.now() - lastActivityRef.current;
  }, []);

  const isRecentlyActive = useCallback((thresholdMs: number = 60000) => {
    return getTimeSinceLastActivity() < thresholdMs;
  }, [getTimeSinceLastActivity]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'input'
    ];

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [handleActivity]);

  return {
    lastActivity: lastActivityRef.current,
    getTimeSinceLastActivity,
    isRecentlyActive
  };
};