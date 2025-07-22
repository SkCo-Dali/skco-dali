
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Filter } from 'lucide-react';
import { ColumnFilter } from './ColumnFilter';

export interface FilterValue {
  type: 'text' | 'number' | 'date' | 'select';
  operator: string;
  value: any;
  values?: any[]; // For multi-select filters
}

interface FilterButtonProps {
  column: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
  };
  data: any[];
  currentFilter?: FilterValue;
  onFilterChange: (filter: FilterValue | null) => void;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
}

export function FilterButton({ column, data, currentFilter, onFilterChange, onSort }: FilterButtonProps) {
  const [open, setOpen] = useState(false);
  const hasFilter = currentFilter !== null && currentFilter !== undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost" 
          size="sm"
          className={`h-6 w-6 p-0 hover:bg-gray-100 ${hasFilter ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <ColumnFilter
          column={column}
          data={data}
          currentFilter={currentFilter}
          onFilterChange={(filter) => {
            onFilterChange(filter);
            setOpen(false);
          }}
          onSort={onSort}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
