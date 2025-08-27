import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionService, SessionData } from '@/services/sessionService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const HEARTBEAT_INTERVAL = 4 * 60 * 1000; // 4 minutos
const REFRESH_THRESHOLD = 60; // 60 segundos antes de expirar

export const useSessionManager = () => {
  const { getAccessToken, logout: authLogout, isAuthenticated, isInitialized } = useAuth();
  const { toast } = useToast();
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  /**
   * Almacena datos de sesión de forma segura
   */
  const storeSessionData = (data: SessionData) => {
    try {
      const sessionInfo = {
        sessionToken: data.sessionToken,
        refreshToken: data.refreshToken,
        sessionId: data.sessionId,
        expiresAt: data.expiresAt.toISOString()
      };
      
      // Usar sessionStorage para mayor seguridad
      sessionStorage.setItem('app_session_data', JSON.stringify(sessionInfo));
      setSessionData(data);
      setIsSessionActive(true);
    } catch (error) {
      console.error('Error almacenando datos de sesión:', error);
    }
  };

  /**
   * Recupera datos de sesión almacenados
   */
  const loadSessionData = (): SessionData | null => {
    try {
      const stored = sessionStorage.getItem('app_session_data');
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const expiresAt = new Date(parsed.expiresAt);
      
      // Verificar si la sesión no ha expirado
      if (expiresAt <= new Date()) {
        clearSessionData();
        return null;
      }

      return {
        sessionToken: parsed.sessionToken,
        refreshToken: parsed.refreshToken,
        sessionId: parsed.sessionId,
        expiresAt
      };
    } catch (error) {
      clearSessionData();
      return null;
    }
  };

  /**
   * Limpia datos de sesión
   */
  const clearSessionData = () => {
    try {
      sessionStorage.removeItem('app_session_data');
      setSessionData(null);
      setIsSessionActive(false);
    } catch (error) {
      console.error('Error limpiando datos de sesión:', error);
    }
  };

  /**
   * Inicia una nueva sesión
   */
  const startSession = useCallback(async () => {
    if (!isAuthenticated || !isInitialized) return;

    try {
      console.log('🟢 SessionManager: Iniciando nueva sesión');
      
      const tokens = await getAccessToken();
      if (!tokens?.accessToken) {
        throw new Error('No se pudo obtener token de acceso');
      }

      // Obtener información del navegador
      const userAgent = navigator.userAgent;
      
      const response = await SessionService.startSession(tokens.accessToken, undefined, userAgent);
      
      const sessionData: SessionData = {
        sessionToken: response.sessionToken,
        refreshToken: response.refreshToken,
        sessionId: response.sessionId,
        expiresAt: new Date(response.expiresAt)
      };

      storeSessionData(sessionData);
      startHeartbeat();
      
      console.log('✅ SessionManager: Sesión iniciada exitosamente');
      retryCountRef.current = 0;
      
    } catch (error) {
      console.error('❌ SessionManager: Error iniciando sesión:', error);
      throw error;
    }
  }, [getAccessToken, isAuthenticated, isInitialized]);

  /**
   * Ejecuta heartbeat para mantener la sesión viva
   */
  const performHeartbeat = useCallback(async () => {
    if (!sessionData?.sessionToken) return;

    try {
      console.log('💓 SessionManager: Ejecutando heartbeat');
      
      const response = await SessionService.heartbeat(sessionData.sessionToken);
      
      console.log(`💓 SessionManager: Heartbeat exitoso, expira en ${response.secondsToExpiry} segundos`);
      
      // Si está cerca de expirar, refrescar la sesión
      if (response.secondsToExpiry <= REFRESH_THRESHOLD) {
        console.log('🔄 SessionManager: Sesión cerca de expirar, refrescando...');
        await refreshSession();
      }
      
      retryCountRef.current = 0;
      
    } catch (error: any) {
      console.error('❌ SessionManager: Error en heartbeat:', error);
      
      if (error.message.includes('401')) {
        // Sesión expirada, intentar refresh
        console.log('🔄 SessionManager: Sesión expirada, intentando refresh...');
        try {
          await refreshSession();
        } catch (refreshError) {
          console.error('❌ SessionManager: Error en refresh, cerrando sesión');
          await handleSessionExpired();
        }
      } else {
        retryCountRef.current += 1;
        if (retryCountRef.current >= 3) {
          console.error('❌ SessionManager: Máximo reintentos alcanzado');
          await handleSessionExpired();
        }
      }
    }
  }, [sessionData]);

  /**
   * Refresca la sesión usando el refresh token
   */
  const refreshSession = useCallback(async () => {
    if (!sessionData?.refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    try {
      console.log('🔄 SessionManager: Refrescando sesión');
      
      const response = await SessionService.refreshSession(sessionData.refreshToken);
      
      const newSessionData: SessionData = {
        sessionToken: response.sessionToken,
        refreshToken: response.refreshToken,
        sessionId: response.sessionId,
        expiresAt: new Date(response.expiresAt)
      };

      storeSessionData(newSessionData);
      console.log('✅ SessionManager: Sesión refrescada exitosamente');
      
    } catch (error: any) {
      console.error('❌ SessionManager: Error refrescando sesión:', error);
      
      if (error.message.includes('404')) {
        // Refresh token no encontrado, iniciar nueva sesión
        console.log('🔄 SessionManager: Refresh token inválido, iniciando nueva sesión');
        await startSession();
      } else {
        throw error;
      }
    }
  }, [sessionData, startSession]);

  /**
   * Maneja la expiración de sesión
   */
  const handleSessionExpired = useCallback(async () => {
    console.log('⏰ SessionManager: Sesión expirada, cerrando sesión');
    
    toast({
      title: "Sesión expirada",
      description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      variant: "destructive",
    });

    await endSession();
    await authLogout();
  }, [toast, authLogout]);

  /**
   * Inicia el heartbeat automático
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    console.log('🟢 SessionManager: Iniciando heartbeat automático');
    
    // Ejecutar heartbeat inmediatamente
    performHeartbeat();
    
    // Programar heartbeats periódicos
    heartbeatIntervalRef.current = setInterval(performHeartbeat, HEARTBEAT_INTERVAL);
  }, [performHeartbeat]);

  /**
   * Detiene el heartbeat automático
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      console.log('🔴 SessionManager: Deteniendo heartbeat automático');
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    retryCountRef.current = 0;
  }, []);

  /**
   * Termina la sesión actual
   */
  const endSession = useCallback(async () => {
    if (sessionData?.sessionToken) {
      try {
        console.log('🔴 SessionManager: Cerrando sesión en el servidor');
        await SessionService.logout(sessionData.sessionToken);
      } catch (error) {
        console.warn('⚠️ SessionManager: Error cerrando sesión en servidor:', error);
      }
    }
    
    stopHeartbeat();
    clearSessionData();
  }, [sessionData, stopHeartbeat]);

  /**
   * Obtiene las sesiones activas del usuario
   */
  const getMySessions = useCallback(async () => {
    try {
      const tokens = await getAccessToken();
      if (!tokens?.accessToken) {
        throw new Error('No se pudo obtener token de acceso');
      }

      return await SessionService.getMySessions(tokens.accessToken);
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      throw error;
    }
  }, [getAccessToken]);

  // Effect para inicializar sesión cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      // Intentar cargar sesión existente
      const existingSession = loadSessionData();
      
      if (existingSession) {
        setSessionData(existingSession);
        setIsSessionActive(true);
        startHeartbeat();
        console.log('🔄 SessionManager: Sesión existente cargada');
      } else {
        // Iniciar nueva sesión
        startSession().catch(error => {
          console.error('Error iniciando sesión automátically:', error);
        });
      }
    } else {
      stopHeartbeat();
      clearSessionData();
    }

    // Cleanup al desmontar
    return () => {
      stopHeartbeat();
    };
  }, [isAuthenticated, isInitialized]);

  return {
    sessionData,
    isSessionActive,
    startSession,
    endSession,
    refreshSession,
    getMySessions,
    performHeartbeat
  };
};