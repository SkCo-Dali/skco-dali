
import { useState, useEffect, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lead } from "@/types/crm";

interface ColumnFilterProps {
  column: string;
  data: Lead[];
  onFilterChange: (column: string, selectedValues: string[]) => void;
  currentFilters: string[];
}

export function ColumnFilter({ column, data, onFilterChange, currentFilters }: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(currentFilters);

  // Obtener valores únicos para la columna
  const uniqueValues = useMemo(() => {
    const values = data.map(lead => {
      const value = lead[column as keyof Lead];
      if (value === null || value === undefined) return "";
      return String(value);
    }).filter(Boolean);
    
    return Array.from(new Set(values)).sort();
  }, [data, column]);

  // Filtrar valores basado en la búsqueda
  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    return uniqueValues.filter(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueValues, searchTerm]);

  // Actualizar selectedValues cuando cambien los filtros externos
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

  const isAllSelected = filteredValues.length > 0 && 
    filteredValues.every(value => selectedValues.includes(value));
  const isIndeterminate = filteredValues.some(value => selectedValues.includes(value)) && 
    !isAllSelected;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 hover:bg-gray-100 ${
            currentFilters.length > 0 ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white border shadow-lg" align="start">
        <div className="p-4">
          {/* Header con tabs */}
          <div className="flex mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md">
                Values
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600">
                Text Filters
              </button>
            </div>
          </div>

          {/* Campo de búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de valores */}
          <div className="max-h-60 overflow-y-auto">
            {/* Select All */}
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
                {...(isIndeterminate ? { "data-state": "indeterminate" } : {})}
              />
              <label className="text-sm font-medium text-gray-700">
                (Select All)
              </label>
            </div>

            {/* Valores filtrados */}
            {filteredValues.map((value) => (
              <div key={value} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                <Checkbox
                  checked={selectedValues.includes(value)}
                  onCheckedChange={(checked) => handleValueChange(value, checked as boolean)}
                />
                <label className="text-sm text-gray-700 cursor-pointer flex-1">
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
              onClick={handleClear}
              className="text-gray-600"
            >
              Clear
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-gray-600"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
