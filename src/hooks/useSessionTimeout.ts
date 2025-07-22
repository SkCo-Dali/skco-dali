
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

  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Solo reiniciar el timer si ha pasado más de 1 minuto desde la última actividad
    // para evitar demasiadas reinicios
    if (timeSinceLastActivity > 60000) {
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    if (!user) {
      clearTimeouts();
      return;
    }

    // Inicializar timer
    resetTimer();

    // Eventos de actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimeouts();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
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
