
import { useState, useMemo } from 'react';
import { FilterValue } from '@/components/table-filters/FilterButton';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, isBefore, isAfter, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears, addWeeks, addMonths, addYears } from 'date-fns';

export interface ColumnFilterConfig {
  [columnKey: string]: FilterValue;
}

export function useAdvancedFilters<T extends Record<string, any>>(
  data: T[],
  columnTypes: Record<string, 'text' | 'number' | 'date' | 'select'>
) {
  const [filters, setFilters] = useState<ColumnFilterConfig>({});

  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(filters).every(([columnKey, filter]) => {
        const value = item[columnKey];
        
        if (value === null || value === undefined) {
          return false;
        }

        return applyFilter(value, filter, columnTypes[columnKey]);
      });
    });
  }, [data, filters, columnTypes]);

  const setColumnFilter = (columnKey: string, filter: FilterValue | null) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (filter === null) {
        delete newFilters[columnKey];
      } else {
        newFilters[columnKey] = filter;
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return {
    filteredData,
    filters,
    setColumnFilter,
    clearAllFilters,
    hasActiveFilters
  };
}

function applyFilter(value: any, filter: FilterValue, columnType: string): boolean {
  const { operator, value: filterValue, values } = filter;

  // Handle multi-select filters
  if (operator === 'in' && values) {
    return values.includes(value);
  }

  // Handle text filters
  if (columnType === 'text') {
    const strValue = value.toString().toLowerCase();
    const strFilterValue = filterValue?.toString().toLowerCase() || '';

    switch (operator) {
      case 'equals':
        return strValue === strFilterValue;
      case 'notEquals':
        return strValue !== strFilterValue;
      case 'beginsWith':
        return strValue.startsWith(strFilterValue);
      case 'endsWith':
        return strValue.endsWith(strFilterValue);
      case 'contains':
        return strValue.includes(strFilterValue);
      case 'notContains':
        return !strValue.includes(strFilterValue);
      default:
        return true;
    }
  }

  // Handle number filters
  if (columnType === 'number') {
    const numValue = Number(value);
    const numFilterValue = Number(filterValue);

    switch (operator) {
      case 'equals':
        return numValue === numFilterValue;
      case 'notEquals':
        return numValue !== numFilterValue;
      case 'greaterThan':
        return numValue > numFilterValue;
      case 'greaterThanOrEqual':
        return numValue >= numFilterValue;
      case 'lessThan':
        return numValue < numFilterValue;
      case 'lessThanOrEqual':
        return numValue <= numFilterValue;
      case 'between':
        const [min, max] = filterValue as [number, number];
        return numValue >= Number(min) && numValue <= Number(max);
      case 'aboveAverage':
        return numValue > numFilterValue;
      case 'belowAverage':
        return numValue < numFilterValue;
      default:
        return true;
    }
  }

  // Handle date filters
  if (columnType === 'date') {
    try {
      const dateValue = new Date(value);
      const now = new Date();

      switch (operator) {
        case 'equals':
          return format(dateValue, 'yyyy-MM-dd') === format(new Date(filterValue), 'yyyy-MM-dd');
        case 'before':
          return isBefore(dateValue, new Date(filterValue));
        case 'after':
          return isAfter(dateValue, new Date(filterValue));
        case 'between':
          const [startDate, endDate] = filterValue as [string, string];
          return isWithinInterval(dateValue, {
            start: new Date(startDate),
            end: new Date(endDate)
          });
        case 'today':
          return isToday(dateValue);
        case 'yesterday':
          return isYesterday(dateValue);
        case 'thisWeek':
          return isThisWeek(dateValue);
        case 'lastWeek':
          const lastWeekStart = startOfWeek(subWeeks(now, 1));
          const lastWeekEnd = endOfWeek(subWeeks(now, 1));
          return isWithinInterval(dateValue, { start: lastWeekStart, end: lastWeekEnd });
        case 'thisMonth':
          return isThisMonth(dateValue);
        case 'lastMonth':
          const lastMonthStart = startOfMonth(subMonths(now, 1));
          const lastMonthEnd = endOfMonth(subMonths(now, 1));
          return isWithinInterval(dateValue, { start: lastMonthStart, end: lastMonthEnd });
        case 'thisYear':
          return isThisYear(dateValue);
        case 'lastYear':
          const lastYearStart = startOfYear(subYears(now, 1));
          const lastYearEnd = endOfYear(subYears(now, 1));
          return isWithinInterval(dateValue, { start: lastYearStart, end: lastYearEnd });
        case 'yearToDate':
          const yearStart = startOfYear(now);
          return isWithinInterval(dateValue, { start: yearStart, end: now });
        default:
          return true;
      }
    } catch (e) {
      return false;
    }
  }

  return true;
}
