
import { useCallback } from 'react';

// Definición de las propiedades que puede recibir el hook
interface UseBannerActionProps {
  onSendMessage?: (message: string) => void;  // Función opcional para enviar mensajes
}

/**
 * Hook personalizado useBannerAction
 * 
 * Este hook maneja las acciones que se ejecutan cuando el usuario hace click
 * en un banner o elemento que debe enviar un mensaje automático al chat.
 * 
 * Es útil para:
 * - Respuestas rápidas predefinidas
 * - Plantillas de mensajes
 * - Acciones automáticas desde la interfaz
 * 
 * @param onSendMessage - Función opcional que se ejecutará al hacer click en el banner
 * @returns Objeto con la función handleBannerClick
 */
export const useBannerAction = ({ onSendMessage }: UseBannerActionProps = {}) => {
  /**
   * Función para manejar el click en un banner
   * 
   * useCallback se usa para optimizar el rendimiento:
   * - Evita que la función se recree en cada render
   * - Solo se recrea si onSendMessage cambia
   * - Importante para evitar re-renders innecesarios de componentes hijos
   */
  const handleBannerClick = useCallback((automaticReply: string) => {
    // Log para debugging - útil para verificar que la acción se ejecutó
    console.log('Banner action triggered:', automaticReply);
    
    // Si se proporcionó una función para enviar mensajes, ejecutarla
    if (onSendMessage) {
      onSendMessage(automaticReply);
    }
  }, [onSendMessage]);  // Dependencia: solo se recrea si onSendMessage cambia

  // Retornar la función para que pueda ser usada por el componente
  return { handleBannerClick };
};
