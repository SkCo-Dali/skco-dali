
import { useEffect, useRef, useCallback } from 'react';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
  user?: any; // User object passed from AuthProvider
  logout?: () => Promise<void>; // Logout function passed from AuthProvider
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning,
  user,
  logout
}: UseSessionTimeoutOptions = {}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);

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
    } else if (logout) {
      await logout();
    }
  }, [logout, onTimeout]);

  const handleWarning = useCallback(() => {
    // Solo mostrar advertencia si no se ha mostrado ya y no hay actividad reciente
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    const recentActivityThreshold = 30000; // 30 segundos
    
    if (!warningShownRef.current && timeSinceLastActivity > recentActivityThreshold) {
      console.log('⚠️ Advertencia: La sesión expirará pronto');
      warningShownRef.current = true;
      if (onWarning) {
        onWarning();
      }
    } else {
      console.log('⚠️ Advertencia cancelada por actividad reciente');
      // Si hay actividad reciente, reiniciar el timer automáticamente
      resetTimer();
    }
  }, [onWarning]);

  const resetTimer = useCallback(() => {
    if (!user) return;

    console.log(`⏰ Reiniciando timer de sesión: ${timeoutMinutes} minutos`);
    
    clearTimeouts();
    lastActivityRef.current = Date.now();
    warningShownRef.current = false; // Reset warning flag

    // Configurar timeout principal
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs);

    // Configurar advertencia
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
    if (warningMs > 0) {
      warningRef.current = setTimeout(handleWarning, warningMs);
    }
  }, [user, timeoutMinutes, warningMinutes, handleTimeout, handleWarning, clearTimeouts]);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Solo reiniciar el timer si ha pasado más de 30 segundos desde la última actividad
    // para evitar demasiadas reinicios, pero menos que antes para mejor respuesta
    if (timeSinceLastActivity > 30000) {
      console.log('🔄 Actividad detectada, reiniciando timer');
      lastActivityRef.current = now;
      
      // Si ya se había mostrado la advertencia, ocultarla automáticamente
      if (warningShownRef.current) {
        warningShownRef.current = false;
        console.log('✅ Ocultando advertencia por actividad');
      }
      
      resetTimer();
    } else {
      // Actualizar última actividad sin reiniciar timer para actividad muy frecuente
      lastActivityRef.current = now;
    }
  }, [resetTimer]);

  useEffect(() => {
    if (!user) {
      clearTimeouts();
      return;
    }

    // Inicializar timer
    resetTimer();

    // Eventos de actividad del usuario - más sensible a la interacción
    const events = [
      'mousedown', 
      'mousemove', 
      'keypress', 
      'keydown',
      'scroll', 
      'touchstart', 
      'touchmove',
      'click',
      'focus',
      'blur'
    ];
    
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
