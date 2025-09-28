import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LeadsApiFilters, FilterOperator } from "@/types/paginatedLeadsTypes";

interface ServerSideTextFilterProps {
  field: string;
  label: string;
  currentFilters: LeadsApiFilters;
  onFilterChange: (field: string, op: string, value?: string, from?: string, to?: string) => void;
  onClose?: () => void;
}

// Determinar tipo de campo y operadores disponibles
const getFieldType = (field: string): 'text' | 'number' | 'date' => {
  const numericFields = ['Value', 'Age'];
  const dateFields = ['CreatedAt', 'UpdatedAt', 'NextFollowUp', 'LastGestorInteractionAt'];
  
  if (numericFields.includes(field)) return 'number';
  if (dateFields.includes(field)) return 'date';
  return 'text';
};

const getOperatorsByFieldType = (fieldType: 'text' | 'number' | 'date') => {
  if (fieldType === 'number') {
    return [
      { value: 'eq' as FilterOperator, label: 'Igual a' },
      { value: 'neq' as FilterOperator, label: 'No igual a' },
      { value: 'gt' as FilterOperator, label: 'Mayor que' },
      { value: 'gte' as FilterOperator, label: 'Mayor o igual que' },
      { value: 'lt' as FilterOperator, label: 'Menor que' },
      { value: 'lte' as FilterOperator, label: 'Menor o igual que' },
      { value: 'between' as FilterOperator, label: 'Entre' },
      { value: 'isnull' as FilterOperator, label: 'Está vacío' },
      { value: 'notnull' as FilterOperator, label: 'No está vacío' }
    ];
  }
  
  if (fieldType === 'date') {
    return [
      { value: 'eq' as FilterOperator, label: 'Igual a' },
      { value: 'neq' as FilterOperator, label: 'No igual a' },
      { value: 'gt' as FilterOperator, label: 'Después de' },
      { value: 'gte' as FilterOperator, label: 'Desde' },
      { value: 'lt' as FilterOperator, label: 'Antes de' },
      { value: 'lte' as FilterOperator, label: 'Hasta' },
      { value: 'between' as FilterOperator, label: 'Entre' },
      { value: 'isnull' as FilterOperator, label: 'Está vacío' },
      { value: 'notnull' as FilterOperator, label: 'No está vacío' }
    ];
  }
  
  return [
    { value: 'eq' as FilterOperator, label: 'Igual a' },
    { value: 'neq' as FilterOperator, label: 'No igual a' },
    { value: 'contains' as FilterOperator, label: 'Contiene' },
    { value: 'ncontains' as FilterOperator, label: 'No contiene' },
    { value: 'startswith' as FilterOperator, label: 'Comienza con' },
    { value: 'endswith' as FilterOperator, label: 'Termina con' },
    { value: 'isnull' as FilterOperator, label: 'Está vacío' },
    { value: 'notnull' as FilterOperator, label: 'No está vacío' }
  ];
};

export function ServerSideTextFilter({ 
  field, 
  label, 
  currentFilters, 
  onFilterChange, 
  onClose 
}: ServerSideTextFilterProps) {
  const fieldType = getFieldType(field);
  const operators = getOperatorsByFieldType(fieldType);
  
  // Obtener el filtro actual
  const currentFilter = currentFilters[field];
  
  const [operator, setOperator] = useState<FilterOperator>(currentFilter?.op || 'contains');
  const [value, setValue] = useState<string>(String(currentFilter?.value || ''));
  const [fromValue, setFromValue] = useState<string>(String(currentFilter?.from || ''));
  const [toValue, setToValue] = useState<string>(String(currentFilter?.to || ''));

  // Determinar si necesita entrada de valor
  const needsValue = !['isnull', 'notnull'].includes(operator);
  const needsRange = operator === 'between';

  // Determinar tipo de input
  const inputType = useMemo(() => {
    if (fieldType === 'number') return 'number';
    if (fieldType === 'date') return 'date';
    return 'text';
  }, [fieldType]);

  // Determinar placeholder
  const getPlaceholder = () => {
    if (fieldType === 'number') return 'Ingrese número';
    if (fieldType === 'date') return 'YYYY-MM-DD';
    return 'Ingrese texto';
  };

  const handleApply = () => {
    if (!needsValue) {
      // Para isnull/notnull
      onFilterChange(field, operator as string);
    } else if (needsRange) {
      // Para between
      if (fromValue && toValue) {
        onFilterChange(field, operator as string, undefined, fromValue, toValue);
      }
    } else {
      // Para otros operadores
      if (value) {
        onFilterChange(field, operator as string, value);
      }
    }
    onClose?.();
  };

  const handleClear = () => {
    setOperator('contains');
    setValue('');
    setFromValue('');
    setToValue('');
    onFilterChange(field, 'clear');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-sm mb-3">Filtro de {label}</h3>
        
        {/* Selector de operador */}
        <div className="space-y-2">
          <label className="text-xs text-gray-600">Condición</label>
          <Select value={operator} onValueChange={(value: FilterOperator) => setOperator(value)}>
            <SelectTrigger className="w-full h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg">
              {operators.map(op => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campos de valor */}
        {needsValue && !needsRange && (
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Valor</label>
            <Input
              type={inputType}
              placeholder={getPlaceholder()}
              value={value}
              onChange={(e) => setValue(String(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        )}

        {/* Campos de rango */}
        {needsRange && (
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Rango</label>
            <div className="flex space-x-2">
              <Input
                type={inputType}
                placeholder="Desde"
                value={fromValue}
                onChange={(e) => setFromValue(String(e.target.value))}
                className="h-8 text-sm flex-1"
              />
              <Input
                type={inputType}
                placeholder="Hasta"
                value={toValue}
                onChange={(e) => setToValue(String(e.target.value))}
                className="h-8 text-sm flex-1"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Botones de acción */}
      <div className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClear}
          className="text-gray-600"
        >
          Limpiar
        </Button>
        <Button 
          size="sm" 
          onClick={handleApply} 
          className="bg-green-500 hover:bg-green-600 text-white"
          disabled={needsValue && !needsRange && !value || needsRange && (!fromValue || !toValue)}
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
}