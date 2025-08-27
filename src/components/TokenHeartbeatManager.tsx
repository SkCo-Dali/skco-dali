import { useTokenHeartbeat } from '@/hooks/useTokenHeartbeat';

/**
 * Componente interno para manejar la renovación automática de tokens
 * Se debe usar dentro del AuthProvider para que tenga acceso al contexto de autenticación
 */
export const TokenHeartbeatManager = () => {
  useTokenHeartbeat();
  return null; // Este componente no renderiza nada
};