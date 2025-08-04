
import { useState, useEffect, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lead } from "@/types/crm";
import { TextFilter, TextFilterCondition } from "@/components/TextFilter";

interface ColumnFilterProps {
  column: string;
  data: Lead[];
  onFilterChange: (column: string, selectedValues: string[]) => void;
  onTextFilterChange: (column: string, conditions: TextFilterCondition[]) => void;
  onSortChange: (column: string, direction: 'asc' | 'desc') => void;
  onClearFilter?: (column: string) => void;
  currentFilters: string[];
  currentTextFilters: TextFilterCondition[];
}

export function ColumnFilter({ 
  column, 
  data, 
  onFilterChange, 
  onTextFilterChange,
  onSortChange,
  onClearFilter,
  currentFilters,
  currentTextFilters 
}: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'values' | 'text'>('values');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(currentFilters);

  const uniqueValues = useMemo(() => {
    const values = data.map(lead => {
      const value = lead[column as keyof Lead];
      if (value === null || value === undefined) return "";
      return String(value);
    }).filter(Boolean);
    
    return Array.from(new Set(values)).sort();
  }, [data, column]);

  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    return uniqueValues.filter(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueValues, searchTerm]);

  useEffect(() => {
    setSelectedValues(currentFilters);
  }, [currentFilters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedValues(filteredValues);
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
  };

  const handleCancel = () => {
    setSelectedValues(currentFilters);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleApply = () => {
    onFilterChange(column, selectedValues);
    setIsOpen(false);
  };

  const handleTextFilterApply = () => {
    setIsOpen(false);
  };

  const handleClearColumnFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClearFilter) {
      onClearFilter(column);
    }
  };

  const isAllSelected = filteredValues.length > 0 && 
    filteredValues.every(value => selectedValues.includes(value));
  const isIndeterminate = filteredValues.some(value => selectedValues.includes(value)) && 
    !isAllSelected;

  const hasActiveFilters = currentFilters.length > 0 || currentTextFilters.length > 0;

  return (
    <div className="flex items-center space-x-1">
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
            {/* Header con tabs */}
            <div className="flex mb-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('values');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'values' 
                      ? 'text-white bg-green-500' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Values
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('text');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'text' 
                      ? 'text-white bg-green-500' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Text Filters
                </button>
              </div>
            </div>

            {/* Contenido del tab activo */}
            {activeTab === 'values' ? (
              <>
                {/* Campo de búsqueda */}
                <div className="relative mb-4">
                  <Input
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSearchTerm(e.target.value);
                    }}
                    className="pl-10"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Lista de valores */}
                <div className="max-h-60 overflow-y-auto">
                  {/* Select All */}
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => {
                        handleSelectAll(checked as boolean);
                      }}
                      className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
                      {...(isIndeterminate ? { "data-state": "indeterminate" } : {})}
                    />
                    <label 
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAll(!isAllSelected);
                      }}
                    >
                      (Select All)
                    </label>
                  </div>

                  {/* Valores filtrados */}
                  {filteredValues.map((value) => (
                    <div key={value} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                      <Checkbox
                        checked={selectedValues.includes(value)}
                        onCheckedChange={(checked) => {
                          handleValueChange(value, checked as boolean);
                        }}
                      />
                      <label 
                        className="text-sm text-gray-700 cursor-pointer flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValueChange(value, !selectedValues.includes(value));
                        }}
                      >
                        {value}
                      </label>
                    </div>
                  ))}
                </div>

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
                    Clear
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
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply();
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div onClick={(e) => e.stopPropagation()}>
                <TextFilter
                  column={column}
                  data={data}
                  onFilterChange={onTextFilterChange}
                  currentConditions={currentTextFilters}
                  onClose={handleTextFilterApply}
                />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Botón X para limpiar filtros - solo se muestra si hay filtros activos */}
      {hasActiveFilters && onClearFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearColumnFilter}
          className="h-6 w-6 p-0 hover:bg-gray-100 text-red-500"
          title={`Limpiar filtros de ${column}`}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
