
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning
}: UseSessionTimeoutOptions = {}) => {
  const { user, logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isActiveRef = useRef<boolean>(false);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(async () => {
    console.log('🕐 Sesión expirada por inactividad');
    if (onTimeout) {
      onTimeout();
    }
    await logout();
  }, [logout, onTimeout]);

  const handleWarning = useCallback(() => {
    console.log('⚠️ Advertencia: La sesión expirará pronto');
    if (onWarning) {
      onWarning();
    }
  }, [onWarning]);

  const resetTimer = useCallback(() => {
    if (!user) return;

    clearTimeouts();
    lastActivityRef.current = Date.now();

    // Configurar timeout principal
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs);

    // Configurar advertencia
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
    if (warningMs > 0) {
      warningRef.current = setTimeout(handleWarning, warningMs);
    }

    console.log(`⏰ Timer de sesión reiniciado: ${timeoutMinutes} minutos`);
  }, [user, timeoutMinutes, warningMinutes, handleTimeout, handleWarning, clearTimeouts]);

  // Optimized activity handler with more aggressive throttling
  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Solo reiniciar el timer si ha pasado más de 10 minutos desde la última actividad
    // para evitar demasiadas reinicios que causen re-renders
    if (timeSinceLastActivity > 600000) { // 10 minutos
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    if (!user) {
      clearTimeouts();
      isActiveRef.current = false;
      return;
    }

    // Solo inicializar una vez por sesión de usuario
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      resetTimer();

      // Usar un throttled event handler más agresivo
      let throttleTimer: NodeJS.Timeout | null = null;
      
      const throttledHandler = () => {
        if (throttleTimer) return;
        
        throttleTimer = setTimeout(() => {
          handleActivity();
          throttleTimer = null;
        }, 5000); // Throttle de 5 segundos en lugar de 1
      };

      // Solo usar eventos realmente significativos de actividad del usuario
      const events = ['keypress', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, throttledHandler, { passive: true });
      });

      // Cleanup function
      const cleanup = () => {
        clearTimeouts();
        if (throttleTimer) {
          clearTimeout(throttleTimer);
        }
        events.forEach(event => {
          document.removeEventListener(event, throttledHandler);
        });
        isActiveRef.current = false;
      };

      return cleanup;
    }
  }, [user, resetTimer, handleActivity, clearTimeouts]);

  return {
    resetTimer,
    getRemainingTime: () => {
      if (!timeoutRef.current) return 0;
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = (timeoutMinutes * 60 * 1000) - elapsed;
      return Math.max(0, remaining);
    }
  };
};
