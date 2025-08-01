
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/crm";

export interface TextFilterCondition {
  field: string;
  operator: string;
  value: string;
}

interface TextFilterProps {
  column: string;
  data: Lead[];
  onFilterChange: (column: string, conditions: TextFilterCondition[]) => void;
  currentConditions: TextFilterCondition[];
  onClose?: () => void;
}

const getOperatorsByColumnType = (column: string) => {
  const numericColumns = ['value', 'age', 'documentNumber'];
  const dateColumns = ['createdAt', 'updatedAt', 'lastInteraction'];
  
  if (numericColumns.includes(column)) {
    return [
      { value: 'equals', label: 'Es igual a' },
      { value: 'not_equals', label: 'No es igual a' },
      { value: 'greater_than', label: 'Mayor que' },
      { value: 'less_than', label: 'Menor que' },
      { value: 'greater_equal', label: 'Mayor o igual que' },
      { value: 'less_equal', label: 'Menor o igual que' },
      { value: 'between', label: 'Entre' }
    ];
  }
  
  if (dateColumns.includes(column)) {
    return [
      { value: 'equals', label: 'Es igual a' },
      { value: 'not_equals', label: 'No es igual a' },
      { value: 'after', label: 'Después de' },
      { value: 'before', label: 'Antes de' },
      { value: 'between', label: 'Entre' }
    ];
  }
  
  return [
    { value: 'equals', label: 'Es igual a' },
    { value: 'not_equals', label: 'No es igual a' },
    { value: 'contains', label: 'Contiene' },
    { value: 'not_contains', label: 'No contiene' },
    { value: 'starts_with', label: 'Comienza con' },
    { value: 'ends_with', label: 'Termina con' },
    { value: 'is_empty', label: 'Está vacío' },
    { value: 'is_not_empty', label: 'No está vacío' }
  ];
};

export function TextFilter({ column, data, onFilterChange, currentConditions, onClose }: TextFilterProps) {
  const [conditions, setConditions] = useState<TextFilterCondition[]>(
    currentConditions.length > 0 ? currentConditions : [{ field: column, operator: 'contains', value: '' }]
  );

  const operators = getOperatorsByColumnType(column);

  const handleConditionChange = (index: number, field: keyof TextFilterCondition, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const addCondition = () => {
    setConditions([...conditions, { field: column, operator: 'contains', value: '' }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      const newConditions = conditions.filter((_, i) => i !== index);
      setConditions(newConditions);
    }
  };

  const handleApply = () => {
    const validConditions = conditions.filter(cond => 
      cond.value.trim() !== '' || cond.operator === 'is_empty' || cond.operator === 'is_not_empty'
    );
    onFilterChange(column, validConditions);
    onClose?.();
  };

  const handleClear = () => {
    setConditions([{ field: column, operator: 'contains', value: '' }]);
    onFilterChange(column, []);
  };

  return (
    <div className="space-y-4">
      {conditions.map((condition, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center space-x-2">
            <Select
              value={condition.operator}
              onValueChange={(value) => handleConditionChange(index, 'operator', value)}
            >
              <SelectTrigger className="w-full">
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
            
            {conditions.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </Button>
            )}
          </div>
          
          {condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty' && (
            <Input
              placeholder="Valor"
              value={condition.value}
              onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
              type={getOperatorsByColumnType(column)[0] ? 'text' : 'text'}
            />
          )}
        </div>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={addCondition}
        className="w-full"
      >
        + Agregar condición
      </Button>
      
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={handleClear}>
          Limpiar
        </Button>
        <Button size="sm" onClick={handleApply} className="bg-green-500 hover:bg-green-600 text-white">
          Aplicar
        </Button>
      </div>
    </div>
  );
}
