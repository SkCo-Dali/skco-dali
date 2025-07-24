
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterValue } from './FilterButton';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateFilterProps {
  values: string[];
  currentFilter?: FilterValue;
  onFilterChange: (filter: FilterValue | null) => void;
  onClose: () => void;
}

const DATE_OPERATORS = [
  { value: 'equals', label: 'Equals...' },
  { value: 'before', label: 'Before...' },
  { value: 'after', label: 'After...' },
  { value: 'between', label: 'Between...' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'nextWeek', label: 'Next Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'nextMonth', label: 'Next Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
  { value: 'lastQuarter', label: 'Last Quarter' },
  { value: 'nextQuarter', label: 'Next Quarter' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'nextYear', label: 'Next Year' },
  { value: 'yearToDate', label: 'Year to Date' },
];

export function DateFilter({ values, currentFilter, onFilterChange, onClose }: DateFilterProps) {
  const [filterMode, setFilterMode] = useState<'values' | 'conditions'>('values');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    currentFilter?.values || []
  );
  const [operator, setOperator] = useState(currentFilter?.operator || 'equals');
  const [conditionValue, setConditionValue] = useState(currentFilter?.value || '');
  const [conditionValue2, setConditionValue2] = useState('');

  // Group dates by year and month for tree structure
  const groupedDates = React.useMemo(() => {
    const groups: Record<string, Record<string, string[]>> = {};
    
    values.forEach(dateString => {
      try {
        const date = new Date(dateString);
        const year = date.getFullYear().toString();
        const month = format(date, 'MMMM', { locale: es });
        
        if (!groups[year]) groups[year] = {};
        if (!groups[year][month]) groups[year][month] = [];
        
        groups[year][month].push(dateString);
      } catch (e) {
        // Invalid date, skip
      }
    });
    
    return groups;
  }, [values]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedValues([...values]);
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
          type: 'date',
          operator: 'in',
          value: null,
          values: selectedValues
        });
      }
    } else {
      let filterValue: any = conditionValue;
      
      if (operator === 'between') {
        filterValue = [conditionValue, conditionValue2];
      }

      if (!filterValue && !['today', 'yesterday', 'thisWeek', 'lastWeek', 'nextWeek', 'thisMonth', 'lastMonth', 'nextMonth', 'thisQuarter', 'lastQuarter', 'nextQuarter', 'thisYear', 'lastYear', 'nextYear', 'yearToDate'].includes(operator)) {
        onFilterChange(null);
      } else {
        onFilterChange({
          type: 'date',
          operator,
          value: filterValue,
        });
      }
    }
  };

  const clearFilter = () => {
    onFilterChange(null);
  };

  const allSelected = values.length > 0 && values.every(v => selectedValues.includes(v));
  const someSelected = values.some(v => selectedValues.includes(v));

  return (
    <div className="w-full">
      {/* Sort options */}
      <div className="p-3 border-b space-y-1">
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
          Sort Oldest to Newest
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
          Sort Newest to Oldest
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
            Date Filters
          </Button>
        </div>
      </div>

      {filterMode === 'values' ? (
        <div className="p-3">
          {/* Search */}
          <Input
            placeholder="Search (All)"
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

          {/* Grouped dates */}
          <ScrollArea className="h-40">
            <div className="space-y-1">
              {Object.entries(groupedDates).map(([year, months]) => (
                <div key={year}>
                  <div className="font-medium text-xs py-1">{year}</div>
                  {Object.entries(months).map(([month, dates]) => (
                    <div key={`${year}-${month}`} className="ml-2">
                      <div className="font-medium text-xs py-1">{month}</div>
                      {dates.map((dateString) => (
                        <div key={dateString} className="flex items-center space-x-2 ml-2">
                          <Checkbox
                            checked={selectedValues.includes(dateString)}
                            onCheckedChange={(checked) => handleValueToggle(dateString, checked as boolean)}
                          />
                          <label className="text-xs">
                            {format(new Date(dateString), 'dd', { locale: es })}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
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
            {DATE_OPERATORS.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>

          {operator === 'between' ? (
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="From..."
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                className="text-xs"
              />
              <Input
                type="date"
                placeholder="To..."
                value={conditionValue2}
                onChange={(e) => setConditionValue2(e.target.value)}
                className="text-xs"
              />
            </div>
          ) : !['today', 'yesterday', 'thisWeek', 'lastWeek', 'nextWeek', 'thisMonth', 'lastMonth', 'nextMonth', 'thisQuarter', 'lastQuarter', 'nextQuarter', 'thisYear', 'lastYear', 'nextYear', 'yearToDate'].includes(operator) ? (
            <Input
              type="date"
              placeholder="Select date..."
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
              className="text-xs"
            />
          ) : null}
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
