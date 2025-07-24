
import React, { useState, useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Lead } from '@/types/crm';

interface ColumnFilterProps {
  columnKey: string;
  leads: Lead[];
  onFilterChange: (columnKey: string, selectedValues: string[]) => void;
  activeFilters: string[];
}

export function ColumnFilter({ columnKey, leads, onFilterChange, activeFilters }: ColumnFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Obtener valores únicos para la columna
  const uniqueValues = useMemo(() => {
    const values = leads.map(lead => {
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
  }, [leads, columnKey]);

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
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border shadow-lg" align="start">
        <div className="space-y-4">
          {/* Header con tabs */}
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              className="bg-[#00c83c] text-white text-xs px-3 py-1 rounded-full"
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
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
              />
              <label className="text-sm font-medium cursor-pointer" onClick={() => handleSelectAll(!isAllSelected)}>
                (Select All)
              </label>
            </div>

            {/* Valores individuales */}
            {filteredValues.map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  checked={activeFilters.includes(value)}
                  onCheckedChange={(checked) => handleValueToggle(value, checked as boolean)}
                />
                <label 
                  className="text-sm cursor-pointer flex-1 truncate" 
                  onClick={() => handleValueToggle(value, !activeFilters.includes(value))}
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
              onClick={handleClear}
              className="text-gray-600"
            >
              Clear
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-600"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
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
