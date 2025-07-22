
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterValue } from './FilterButton';

interface NumberFilterProps {
  values: number[];
  currentFilter?: FilterValue;
  onFilterChange: (filter: FilterValue | null) => void;
  onClose: () => void;
}

const NUMBER_OPERATORS = [
  { value: 'equals', label: 'Equals...' },
  { value: 'notEquals', label: 'Does Not Equal...' },
  { value: 'greaterThan', label: 'Greater Than...' },
  { value: 'greaterThanOrEqual', label: 'Greater Than Or Equal To...' },
  { value: 'lessThan', label: 'Less Than...' },
  { value: 'lessThanOrEqual', label: 'Less Than Or Equal To...' },
  { value: 'between', label: 'Between...' },
  { value: 'top10', label: 'Top 10...' },
  { value: 'aboveAverage', label: 'Above Average' },
  { value: 'belowAverage', label: 'Below Average' },
];

export function NumberFilter({ values, currentFilter, onFilterChange, onClose }: NumberFilterProps) {
  const [filterMode, setFilterMode] = useState<'values' | 'conditions'>('values');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<number[]>(
    currentFilter?.values || []
  );
  const [operator, setOperator] = useState(currentFilter?.operator || 'equals');
  const [conditionValue, setConditionValue] = useState(currentFilter?.value || '');
  const [conditionValue2, setConditionValue2] = useState('');

  const sortedValues = [...values].sort((a, b) => a - b);
  const filteredValues = sortedValues.filter(value => 
    value.toString().includes(searchTerm)
  );

  const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedValues([...filteredValues]);
    } else {
      setSelectedValues([]);
    }
  };

  const handleValueToggle = (value: number, checked: boolean) => {
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
          type: 'number',
          operator: 'in',
          value: null,
          values: selectedValues
        });
      }
    } else {
      let filterValue: any = conditionValue;
      
      if (operator === 'between') {
        filterValue = [conditionValue, conditionValue2];
      } else if (operator === 'aboveAverage') {
        filterValue = average;
      } else if (operator === 'belowAverage') {
        filterValue = average;
      }

      if (!filterValue && operator !== 'aboveAverage' && operator !== 'belowAverage') {
        onFilterChange(null);
      } else {
        onFilterChange({
          type: 'number',
          operator,
          value: filterValue,
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
      {/* Sort options */}
      <div className="p-3 border-b space-y-1">
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
          Sort Smallest to Largest
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
          Sort Largest to Smallest
        </Button>
      </div>

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
            Number Filters
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
                  <label className="text-xs">{value.toLocaleString()}</label>
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
            {NUMBER_OPERATORS.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>

          {operator === 'between' ? (
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="From..."
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                className="text-xs"
              />
              <Input
                type="number"
                placeholder="To..."
                value={conditionValue2}
                onChange={(e) => setConditionValue2(e.target.value)}
                className="text-xs"
              />
            </div>
          ) : operator !== 'aboveAverage' && operator !== 'belowAverage' ? (
            <Input
              type="number"
              placeholder="Enter number..."
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
              className="text-xs"
            />
          ) : (
            <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
              Average: {average.toFixed(2)}
            </div>
          )}
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
