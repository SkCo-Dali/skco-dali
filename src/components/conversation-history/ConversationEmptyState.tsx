
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';

interface ConversationEmptyStateProps {
  searchQuery: string;
  isLoading: boolean;
  onClearSearch: () => void;
}

export const ConversationEmptyState: React.FC<ConversationEmptyStateProps> = ({
  searchQuery,
  isLoading,
  onClearSearch
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="animate-spin h-12 w-12 border-3 border-green-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg font-medium">Cargando conversaciones...</p>
        <p className="text-sm">Por favor espera un momento</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <MessageSquare className="h-12 w-12 text-gray-400" />
      </div>
      {searchQuery ? (
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No se encontraron conversaciones</p>
          <p className="text-sm text-gray-400 mb-4">
            No hay resultados para "{searchQuery}"
          </p>
          <Button
            variant="outline"
            onClick={onClearSearch}
            className="text-sm"
          >
            Ver todas las conversaciones
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No hay conversaciones guardadas</p>
          <p className="text-sm text-gray-400">
            Inicia una nueva conversación para comenzar
          </p>
        </div>
      )}
    </div>
  );
};
