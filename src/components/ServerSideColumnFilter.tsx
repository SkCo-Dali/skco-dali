import { useState, useEffect, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDistinctValues } from "@/hooks/useServerSideFilters";
import { LeadsApiFilters } from "@/types/paginatedLeadsTypes";

interface ServerSideColumnFilterProps {
  field: string;
  label: string;
  currentFilters: LeadsApiFilters;
  onFilterChange: (field: string, values: string[]) => void;
  onClearFilter?: (field: string) => void;
}

export function ServerSideColumnFilter({ 
  field, 
  label,
  currentFilters,
  onFilterChange, 
  onClearFilter 
}: ServerSideColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  
  // Usar el hook para obtener valores únicos con búsqueda
  const {
    values: uniqueValues,
    loading,
    error,
    searchTerm,
    setSearchTerm
  } = useDistinctValues(field, currentFilters);

  // Obtener valores actualmente seleccionados del filtro
  const currentSelectedValues = useMemo(() => {
    const filter = currentFilters[field];
    if (filter && filter.op === 'in' && filter.values) {
      return filter.values.map(v => String(v || ''));
    }
    return [];
  }, [currentFilters, field]);

  // Actualizar valores seleccionados cuando cambian los filtros externos
  useEffect(() => {
    setSelectedValues(currentSelectedValues);
  }, [currentSelectedValues]);

  // Los valores ya vienen filtrados del servidor, no necesitamos filtro local adicional
  const filteredValues = useMemo(() => {
    return uniqueValues.map(v => String(v || ''));
  }, [uniqueValues]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedValues([...filteredValues]);
    } else {
      setSelectedValues([]);
    }
  };

  const handleValueChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedValues(prev => [...prev, value]);
    } else {
      setSelectedValues(prev => prev.filter(v => v !== value));
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedValues([]);
    onFilterChange(field, []);
  };

  const handleCancel = () => {
    setSelectedValues(currentSelectedValues);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleApply = () => {
    onFilterChange(field, selectedValues);
    setIsOpen(false);
  };

  const isAllSelected = filteredValues.length > 0 && 
    filteredValues.every(value => selectedValues.includes(value));
  const isIndeterminate = filteredValues.some(value => selectedValues.includes(value)) && 
    !isAllSelected;

  const hasActiveFilters = currentSelectedValues.length > 0;

  return (
    <div className="flex items-center gap-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 hover:bg-gray-100 ${
              hasActiveFilters ? 'text-green-600' : 'text-gray-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Filter className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0 bg-white border shadow-lg z-50" 
          align="start"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="p-4" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="mb-4">
              <h3 className="font-medium text-sm">Filtrar por {label}</h3>
            </div>

            {/* Campo de búsqueda */}
            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Buscar valores..."
                value={searchTerm}
                onChange={(e) => {
                  e.stopPropagation();
                  setSearchTerm(e.target.value);
                }}
                className="pl-8 h-8 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Loading/Error states */}
            {loading && (
              <div className="text-center py-4 text-sm text-gray-500">
                Cargando valores...
              </div>
            )}

            {error && (
              <div className="text-center py-4 text-sm text-red-500">
                Error: {error}
              </div>
            )}

            {/* Lista de valores */}
            {!loading && !error && (
              <ScrollArea className="h-60">
                <div className="space-y-1">
                  {/* Select All */}
                  {filteredValues.length > 0 && (
                    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 border-b">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => {
                          handleSelectAll(checked as boolean);
                        }}
                        className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
                        {...(isIndeterminate ? { "data-state": "indeterminate" } : {})}
                      />
                      <label className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                        Seleccionar todos
                      </label>
                    </div>
                  )}

                  {/* Valores */}
                  {filteredValues.map((value) => (
                    <div key={value || 'null'} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                      <Checkbox
                        checked={selectedValues.includes(value || '')}
                        onCheckedChange={(checked) => {
                          handleValueChange(value || '', checked as boolean);
                        }}
                      />
                      <label className="text-sm text-gray-700 cursor-pointer flex-1 select-none">
                        {value || '(Vacío)'}
                      </label>
                    </div>
                  ))}

                  {filteredValues.length === 0 && !loading && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No se encontraron valores
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Botones de acción */}
            <div className="flex justify-between mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-600"
              >
                Limpiar
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="text-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={loading}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}