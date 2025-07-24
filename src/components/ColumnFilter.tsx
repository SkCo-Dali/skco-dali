
import React, { useState, useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Lead } from '@/types/crm';

interface ColumnFilterProps {
  columnKey: string;
  allLeads: Lead[]; // Cambiar a allLeads para usar todos los leads disponibles
  onFilterChange: (columnKey: string, selectedValues: string[]) => void;
  activeFilters: string[];
}

export function ColumnFilter({ columnKey, allLeads, onFilterChange, activeFilters }: ColumnFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Obtener valores únicos para la columna usando TODOS los leads
  const uniqueValues = useMemo(() => {
    const values = allLeads.map(lead => {
      let value = '';
      switch (columnKey) {
        case 'name':
          value = lead.name;
          break;
        case 'email':
          value = lead.email || '';
          break;
        case 'phone':
          value = lead.phone || '';
          break;
        case 'campaign':
          value = lead.campaign || '';
          break;
        case 'stage':
          value = lead.stage;
          break;
        case 'assignedTo':
          value = lead.assignedTo || '';
          break;
        case 'source':
          value = lead.source;
          break;
        case 'priority':
          value = lead.priority;
          break;
        case 'product':
          value = lead.product || '';
          break;
        case 'company':
          value = lead.company || '';
          break;
        case 'documentType':
          value = lead.documentType || '';
          break;
        case 'documentNumber':
          value = lead.documentNumber?.toString() || '';
          break;
        case 'age':
          value = lead.age?.toString() || '';
          break;
        case 'gender':
          value = lead.gender || '';
          break;
        case 'preferredContactChannel':
          value = lead.preferredContactChannel || '';
          break;
        default:
          value = '';
      }
      return value.toString().trim();
    }).filter(Boolean);

    return Array.from(new Set(values)).sort();
  }, [allLeads, columnKey]);

  // Filtrar valores por búsqueda
  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    return uniqueValues.filter(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueValues, searchTerm]);

  const handleValueToggle = (value: string, checked: boolean) => {
    let newFilters;
    if (checked) {
      newFilters = [...activeFilters, value];
    } else {
      newFilters = activeFilters.filter(f => f !== value);
    }
    onFilterChange(columnKey, newFilters);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onFilterChange(columnKey, [...filteredValues]);
    } else {
      onFilterChange(columnKey, []);
    }
  };

  const handleClear = () => {
    onFilterChange(columnKey, []);
  };

  const isAllSelected = filteredValues.length > 0 && filteredValues.every(value => activeFilters.includes(value));
  const isIndeterminate = filteredValues.some(value => activeFilters.includes(value)) && !isAllSelected;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-4 w-4 p-0 ml-1 hover:bg-gray-100 ${activeFilters.length > 0 ? 'text-[#00c83c]' : 'text-gray-400'}`}
          onClick={(e) => {
            e.stopPropagation(); // Evitar propagación del evento
          }}
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border shadow-lg z-50" align="start">
        <div className="space-y-4">
          {/* Header con tabs */}
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
                onCheckedChange={(checked) => {
                  handleSelectAll(checked as boolean);
                }}
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
