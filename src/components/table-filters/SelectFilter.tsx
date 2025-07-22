
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterValue } from './FilterButton';

interface SelectFilterProps {
  values: any[];
  currentFilter?: FilterValue;
  onFilterChange: (filter: FilterValue | null) => void;
  onClose: () => void;
}

export function SelectFilter({ values, currentFilter, onFilterChange, onClose }: SelectFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<any[]>(
    currentFilter?.values || []
  );

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

  const handleValueToggle = (value: any, checked: boolean) => {
    if (checked) {
      setSelectedValues([...selectedValues, value]);
    } else {
      setSelectedValues(selectedValues.filter(v => v !== value));
    }
  };

  const applyFilter = () => {
    if (selectedValues.length === 0) {
      onFilterChange(null);
    } else {
      onFilterChange({
        type: 'select',
        operator: 'in',
        value: null,
        values: selectedValues
      });
    }
  };

  const clearFilter = () => {
    onFilterChange(null);
  };

  const allSelected = filteredValues.length > 0 && filteredValues.every(v => selectedValues.includes(v));
  const someSelected = filteredValues.some(v => selectedValues.includes(v));

  return (
    <div className="w-full">
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
            {filteredValues.map((value, index) => (
              <div key={index} className="flex items-center space-x-2">
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
