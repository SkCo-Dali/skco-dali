import React from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface ConversationSearchBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredCount: number;
  totalCount: number;
  isLoading: boolean;
}

export const ConversationSearchBar: React.FC<ConversationSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  filteredCount,
  totalCount,
  isLoading,
}) => {
  return (
    <div className="p-4 pb-4 border-b bg-white flex-shrink-0">
      <div className="relative">
        <Input
          placeholder="Buscar conversaciones por título o contenido..."
          value={searchQuery}
          onChange={onSearchChange}
          className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-green-400 focus:ring-green-400"
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>

      {/* Estadísticas */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            {filteredCount} de {totalCount} conversaciones
          </span>
          {isLoading && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
              <span className="text-xs">Cargando...</span>
            </div>
          )}
        </div>

        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>)}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpiar búsqueda
          </Button>
        )}
      </div>
    </div>
  );
};
