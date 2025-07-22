
import React, { useState, useMemo } from 'react';
import { FilterValue } from './FilterButton';
import { TextFilter } from './TextFilter';
import { NumberFilter } from './NumberFilter';
import { DateFilter } from './DateFilter';
import { SelectFilter } from './SelectFilter';
import { Button } from '@/components/ui/button';
import { ArrowUpAZ, ArrowDownZA } from 'lucide-react';

interface ColumnFilterProps {
  column: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
  };
  data: any[];
  currentFilter?: FilterValue;
  onFilterChange: (filter: FilterValue | null) => void;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
  onClose: () => void;
}

export function ColumnFilter({ column, data, currentFilter, onFilterChange, onSort, onClose }: ColumnFilterProps) {
  // Extract unique values for this column
  const columnValues = useMemo(() => {
    const values = data.map(item => item[column.key]).filter(val => val !== null && val !== undefined);
    return [...new Set(values)].sort();
  }, [data, column.key]);

  const handleSort = (direction: 'asc' | 'desc') => {
    if (onSort) {
      onSort(column.key, direction);
      onClose();
    }
  };

  const renderFilter = () => {
    switch (column.type) {
      case 'text':
        return (
          <TextFilter
            values={columnValues}
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            onClose={onClose}
          />
        );
      case 'number':
        return (
          <NumberFilter
            values={columnValues as number[]}
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            onClose={onClose}
          />
        );
      case 'date':
        return (
          <DateFilter
            values={columnValues}
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            onClose={onClose}
          />
        );
      case 'select':
        return (
          <SelectFilter
            values={columnValues}
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="p-3 border-b">
        <h3 className="font-medium text-sm">{column.label}</h3>
      </div>
      
      {/* Sort options */}
      {onSort && (
        <div className="p-3 border-b">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleSort('asc')}
            >
              <ArrowUpAZ className="mr-2 h-4 w-4" />
              Ordenar A a Z
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleSort('desc')}
            >
              <ArrowDownZA className="mr-2 h-4 w-4" />
              Ordenar Z a A
            </Button>
          </div>
        </div>
      )}
      
      {renderFilter()}
    </div>
  );
}
