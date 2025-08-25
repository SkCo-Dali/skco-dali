import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TOKEN_REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutos en milisegundos
const MAX_RETRY_ATTEMPTS = 3;

export const useTokenHeartbeat = () => {
  const { getAccessToken, logout, isAuthenticated, isInitialized } = useAuth();
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const refreshToken = async () => {
    if (!isAuthenticated || !isInitialized) {
      return;
    }

    try {
      console.log('🔄 TokenHeartbeat: Iniciando renovación automática de token');
      const tokens = await getAccessToken();
      
      if (tokens) {
        console.log('✅ TokenHeartbeat: Token renovado exitosamente');
        retryCountRef.current = 0; // Reset retry count on success
      } else {
        throw new Error('No se pudo obtener el token');
      }
    } catch (error) {
      console.error('❌ TokenHeartbeat: Error al renovar token:', error);
      retryCountRef.current += 1;

      if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
        console.error('❌ TokenHeartbeat: Máximo número de reintentos alcanzado, cerrando sesión');
        
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });

        // Logout automático después de múltiples fallos
        await logout();
      } else {
        console.log(`⚠️ TokenHeartbeat: Intento ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS} fallido, reintentando...`);
      }
    }
  };

  const startHeartbeat = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    console.log('🟢 TokenHeartbeat: Iniciando heartbeat de renovación de tokens cada 45 minutos');
    
    // Ejecutar inmediatamente una renovación para validar el token actual
    refreshToken();
    
    // Programar renovaciones periódicas
    intervalRef.current = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
  };

  const stopHeartbeat = () => {
    if (intervalRef.current) {
      console.log('🔴 TokenHeartbeat: Deteniendo heartbeat de renovación de tokens');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    retryCountRef.current = 0;
  };

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }

    // Cleanup on unmount
    return () => {
      stopHeartbeat();
    };
  }, [isAuthenticated, isInitialized]);

  return {
    refreshToken,
    startHeartbeat,
    stopHeartbeat
  };
};