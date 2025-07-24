
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterValue } from './FilterButton';

interface TextFilterProps {
  values: string[];
  currentFilter?: FilterValue;
  onFilterChange: (filter: FilterValue | null) => void;
  onClose: () => void;
}

const TEXT_OPERATORS = [
  { value: 'equals', label: 'Equals...' },
  { value: 'notEquals', label: 'Does Not Equal...' },
  { value: 'beginsWith', label: 'Begins With...' },
  { value: 'endsWith', label: 'Ends With...' },
  { value: 'contains', label: 'Contains...' },
  { value: 'notContains', label: 'Does Not Contain...' },
];

export function TextFilter({ values, currentFilter, onFilterChange, onClose }: TextFilterProps) {
  const [filterMode, setFilterMode] = useState<'values' | 'conditions'>('values');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    currentFilter?.values || []
  );
  const [operator, setOperator] = useState(currentFilter?.operator || 'equals');
  const [conditionValue, setConditionValue] = useState(currentFilter?.value || '');

  const filteredValues = values.filter(value => 
    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedValues([...filteredValues]);
    } else {
      setSelectedValues([]);
    }
  };

  const handleValueToggle = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedValues([...selectedValues, value]);
    } else {
      setSelectedValues(selectedValues.filter(v => v !== value));
    }
  };

  const applyFilter = () => {
    if (filterMode === 'values') {
      if (selectedValues.length === 0) {
        onFilterChange(null);
      } else {
        onFilterChange({
          type: 'text',
          operator: 'in',
          value: null,
          values: selectedValues
        });
      }
    } else {
      if (!conditionValue.trim()) {
        onFilterChange(null);
      } else {
        onFilterChange({
          type: 'text',
          operator,
          value: conditionValue.trim(),
        });
      }
    }
  };

  const clearFilter = () => {
    onFilterChange(null);
  };

  const allSelected = filteredValues.length > 0 && filteredValues.every(v => selectedValues.includes(v));
  const someSelected = filteredValues.some(v => selectedValues.includes(v));

  return (
    <div className="w-full">
      {/* Filter mode tabs */}
      <div className="p-3 border-b">
        <div className="flex space-x-2 text-xs">
          <Button
            variant={filterMode === 'values' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterMode('values')}
          >
            Values
          </Button>
          <Button
            variant={filterMode === 'conditions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterMode('conditions')}
          >
            Text Filters
          </Button>
        </div>
      </div>

      {filterMode === 'values' ? (
        <div className="p-3">
          {/* Search */}
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3 text-xs"
          />

          {/* Select All */}
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className={someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""}
              {...(someSelected && !allSelected ? { "data-state": "indeterminate" } : {})}
            />
            <label className="text-xs font-medium">(Select All)</label>
          </div>

          {/* Values list */}
          <ScrollArea className="h-40">
            <div className="space-y-1">
              {filteredValues.map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedValues.includes(value)}
                    onCheckedChange={(checked) => handleValueToggle(value, checked as boolean)}
                  />
                  <label className="text-xs">{value}</label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full text-xs border rounded px-2 py-1"
          >
            {TEXT_OPERATORS.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>

          <Input
            placeholder="Enter text..."
            value={conditionValue}
            onChange={(e) => setConditionValue(e.target.value)}
            className="text-xs"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="p-3 border-t flex justify-between">
        <Button variant="outline" size="sm" onClick={clearFilter}>
          Clear
        </Button>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={applyFilter}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
