
import { useState, useMemo } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
  priority: number;
}

interface UseMultiSortProps<T> {
  items: T[];
  sortDescriptors: Array<{ columnKey: string; direction: 'asc' | 'desc' }>;
  getCellValue: (item: T, columnKey: string) => string | number | undefined;
}

export function useMultiSort<T>({ items, sortDescriptors, getCellValue }: UseMultiSortProps<T>): T[] {
  return useMemo(() => {
    if (sortDescriptors.length === 0) return items;

    return [...items].sort((a, b) => {
      for (const descriptor of sortDescriptors) {
        const aValue = getCellValue(a, descriptor.columnKey);
        const bValue = getCellValue(b, descriptor.columnKey);
        
        let comparison = 0;
        
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        if (comparison !== 0) {
          return descriptor.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [items, sortDescriptors, getCellValue]);
}
