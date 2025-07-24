
import React, { useState, useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Lead } from '@/types/crm';

interface ColumnFilterProps {
  columnKey: string;
  allLeads: Lead[];
  onFilterChange: (columnKey: string, selectedValues: string[]) => void;
  activeFilters: string[];
}

export function ColumnFilter({ columnKey, allLeads, onFilterChange, activeFilters }: ColumnFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Extraer valores únicos de la columna
  const uniqueValues = useMemo(() => {
    const values = allLeads.map(lead => {
      switch (columnKey) {
        case 'name':
          return lead.name;
        case 'email':
          return lead.email || '';
        case 'phone':
          return lead.phone || '';
        case 'campaign':
          return lead.campaign || '';
        case 'stage':
          return lead.stage;
        case 'assignedTo':
          return lead.assignedTo || '';
        case 'source':
          return lead.source;
        case 'priority':
          return lead.priority;
        case 'product':
          return lead.product || '';
        case 'company':
          return lead.company || '';
        case 'documentType':
          return lead.documentType || '';
        case 'documentNumber':
          return lead.documentNumber?.toString() || '';
        case 'age':
          return lead.age?.toString() || '';
        case 'gender':
          return lead.gender || '';
        case 'preferredContactChannel':
          return lead.preferredContactChannel || '';
        default:
          return '';
      }
    })
    .filter(value => value.toString().trim() !== '')
    .map(value => value.toString().trim());

    return Array.from(new Set(values)).sort();
  }, [allLeads, columnKey]);

  // Filtrar valores por término de búsqueda
  const filteredValues = useMemo(() => {
    if (!searchTerm.trim()) {
      return uniqueValues;
    }
    return uniqueValues.filter(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueValues, searchTerm]);

  // Manejar selección individual
  const handleValueToggle = (value: string, checked: boolean) => {
    const newFilters = checked
      ? [...activeFilters, value]
      : activeFilters.filter(f => f !== value);
    
    onFilterChange(columnKey, newFilters);
  };

  // Manejar selección masiva
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Agregar todos los valores filtrados a los filtros activos
      const newFilters = [...new Set([...activeFilters, ...filteredValues])];
      onFilterChange(columnKey, newFilters);
    } else {
      // Remover todos los valores filtrados de los filtros activos
      const valuesToRemove = new Set(filteredValues);
      const newFilters = activeFilters.filter(filter => !valuesToRemove.has(filter));
      onFilterChange(columnKey, newFilters);
    }
  };

  // Limpiar todos los filtros y búsqueda
  const handleClear = () => {
    setSearchTerm('');
    onFilterChange(columnKey, []);
  };

  // Estado del checkbox "Select All"
  const selectedFilteredValues = filteredValues.filter(value => activeFilters.includes(value));
  const isAllSelected = filteredValues.length > 0 && selectedFilteredValues.length === filteredValues.length;
  const isIndeterminate = selectedFilteredValues.length > 0 && selectedFilteredValues.length < filteredValues.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-4 w-4 p-0 ml-1 hover:bg-gray-100 ${
            activeFilters.length > 0 ? 'text-[#00c83c]' : 'text-gray-400'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border shadow-lg z-50" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              className="bg-[#00c83c] text-white text-xs px-3 py-1 rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              Values
            </Button>
            <span className="text-gray-500 text-sm">Text Filters</span>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                e.stopPropagation();
                setSearchTerm(e.target.value);
              }}
              className="pl-10 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Lista de valores */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {/* Select All */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isIndeterminate ? "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground" : ""}
                {...(isIndeterminate ? { "data-state": "indeterminate" } : {})}
                onClick={(e) => e.stopPropagation()}
              />
              <label 
                className="text-sm font-medium cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll(!isAllSelected);
                }}
              >
                (Select All)
              </label>
            </div>

            {/* Valores individuales */}
            {filteredValues.map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  checked={activeFilters.includes(value)}
                  onCheckedChange={(checked) => handleValueToggle(value, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
                <label 
                  className="text-sm cursor-pointer flex-1 truncate" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleValueToggle(value, !activeFilters.includes(value));
                  }}
                  title={value}
                >
                  {value}
                </label>
              </div>
            ))}

            {/* Mensaje cuando no hay resultados */}
            {filteredValues.length === 0 && searchTerm.trim() && (
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">No se encontraron resultados</p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between pt-2 border-t">
            <Button
              variant="ghost"
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
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-gray-600"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="bg-[#00c83c] text-white hover:bg-[#00b835]"
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
