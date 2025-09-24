import { useSmartTokenRefresh } from '@/hooks/useSmartTokenRefresh';

/**
 * Componente que reemplaza al TokenHeartbeatManager con un sistema más inteligente
 * basado en la actividad del usuario
 */
export const SmartSessionManager = () => {
  useSmartTokenRefresh();
  return null; // Este componente no renderiza nada
};