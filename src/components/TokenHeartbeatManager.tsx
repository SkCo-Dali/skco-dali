import { useSessionManager } from '@/hooks/useSessionManager';

/**
 * Componente interno para manejar las sesiones de la aplicación
 * Se debe usar dentro del AuthProvider para que tenga acceso al contexto de autenticación
 */
export const TokenHeartbeatManager = () => {
  useSessionManager();
  return null; // Este componente no renderiza nada
};