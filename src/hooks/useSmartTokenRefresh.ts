import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserActivity } from './useUserActivity';
import { useToast } from '@/hooks/use-toast';

const ACTIVE_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos cuando hay actividad
const IDLE_REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutos cuando está inactivo
const ACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutos para considerar "activo"
const WARNING_THRESHOLD = 2 * 60 * 1000; // Advertir 2 minutos antes de expirar
const MAX_RETRY_ATTEMPTS = 3;

export const useSmartTokenRefresh = () => {
  const { getAccessToken, logout, isAuthenticated, isInitialized } = useAuth();
  const { toast } = useToast();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastRefreshRef = useRef<number>(Date.now());
  const hasShownWarningRef = useRef<boolean>(false);
  const currentIntervalMsRef = useRef<number | null>(null);
  const startedRef = useRef<boolean>(false);

  const { isRecentlyActive } = useUserActivity({
    onActivity: () => {
      // Reset warning when user becomes active again
      hasShownWarningRef.current = false;
    },
    throttleMs: 30000, // Throttle activity detection to 30 seconds
    enableLogging: true
  });

  const showSessionWarning = useCallback(() => {
    if (hasShownWarningRef.current) return;
    
    hasShownWarningRef.current = true;
    toast({
      title: "⚠️ Sesión próxima a expirar",
      description: "Tu sesión expirará pronto. Guarda tu trabajo para evitar perder información.",
      duration: 10000,
      variant: "destructive"
    });
  }, [toast]);

  const refreshToken = useCallback(async (isManualRefresh = false) => {
    if (!isAuthenticated || !isInitialized) {
      return false;
    }

    try {
      console.log(`🔄 SmartTokenRefresh: ${isManualRefresh ? 'Renovación manual' : 'Renovación automática'} iniciada`);
      const tokens = await getAccessToken();
      
      if (tokens) {
        lastRefreshRef.current = Date.now();
        retryCountRef.current = 0;
        hasShownWarningRef.current = false;
        console.log('✅ SmartTokenRefresh: Token renovado exitosamente');
        return true;
      } else {
        throw new Error('No se pudo obtener el token');
      }
    } catch (error) {
      console.error('❌ SmartTokenRefresh: Error al renovar token:', error);
      retryCountRef.current += 1;

      if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
        console.error('❌ SmartTokenRefresh: Máximo número de reintentos alcanzado');
        
        toast({
          title: "Sesión expirada",
          description: "No se pudo renovar tu sesión. Por favor, guarda tu trabajo e inicia sesión nuevamente.",
          variant: "destructive",
          duration: 15000
        });

        // No hacer logout automático inmediatamente, dar tiempo al usuario
        setTimeout(() => {
          logout();
        }, 15000);
        
        return false;
      } else {
        console.log(`⚠️ SmartTokenRefresh: Intento ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS} fallido`);
        return false;
      }
    }
  }, [getAccessToken, logout, isAuthenticated, isInitialized, toast]);

  const scheduleNextRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const isUserActive = isRecentlyActive(ACTIVITY_THRESHOLD);
    const refreshInterval = isUserActive ? ACTIVE_REFRESH_INTERVAL : IDLE_REFRESH_INTERVAL;
    
    // Prevenir reprogramación si ya hay una con el mismo intervalo
    if (currentIntervalMsRef.current === refreshInterval) {
      return;
    }
    currentIntervalMsRef.current = refreshInterval;
    
    console.log(`⏰ SmartTokenRefresh: Programando próxima renovación en ${refreshInterval / 60000} minutos (usuario ${isUserActive ? 'activo' : 'inactivo'})`);
    
    intervalRef.current = setInterval(() => {
      refreshToken();
    }, refreshInterval);

    // Programar warning antes de la próxima renovación
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    warningTimeoutRef.current = setTimeout(() => {
      if (isRecentlyActive(ACTIVITY_THRESHOLD)) {
        showSessionWarning();
      }
    }, refreshInterval - WARNING_THRESHOLD);

  }, [isRecentlyActive, refreshToken, showSessionWarning]);

  const startSmartRefresh = useCallback(() => {
    if (startedRef.current) {
      console.log('⏸️ SmartTokenRefresh: Ya iniciado, saltando');
      return;
    }
    
    startedRef.current = true;
    console.log('🟢 SmartTokenRefresh: Iniciando sistema inteligente de renovación');
    
    // Ejecutar renovación inmediata
    refreshToken(true);
    
    // Programar próximas renovaciones
    scheduleNextRefresh();
  }, [refreshToken, scheduleNextRefresh]);

  const stopSmartRefresh = useCallback(() => {
    console.log('🔴 SmartTokenRefresh: Deteniendo sistema de renovación');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    
    retryCountRef.current = 0;
    hasShownWarningRef.current = false;
    currentIntervalMsRef.current = null;
    startedRef.current = false;
  }, []);

  // Controlar el ciclo de vida del refresh
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      startSmartRefresh();
    } else {
      stopSmartRefresh();
    }

    return () => {
      stopSmartRefresh();
    };
  }, [isAuthenticated, isInitialized]);

  return {
    refreshToken: () => refreshToken(true),
    lastRefresh: lastRefreshRef.current,
    getTimeSinceLastRefresh: () => Date.now() - lastRefreshRef.current
  };
};