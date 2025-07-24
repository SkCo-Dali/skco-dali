
import { useState, useMemo } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export function useMultiSort<T extends Record<string, any>>(data: T[]) {
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);

  const handleSort = (columnKey: string, isMultiSort: boolean = false) => {
    setSortConfigs(prev => {
      const existingIndex = prev.findIndex(config => config.key === columnKey);
      
      if (!isMultiSort) {
        // Single sort - replace all with new sort
        if (existingIndex >= 0) {
          const existingConfig = prev[existingIndex];
          return [{
            key: columnKey,
            direction: existingConfig.direction === 'asc' ? 'desc' : 'asc',
            priority: 1
          }];
        } else {
          return [{
            key: columnKey,
            direction: 'asc',
            priority: 1
          }];
        }
      } else {
        // Multi sort - add/modify/remove
        if (existingIndex >= 0) {
          const existingConfig = prev[existingIndex];
          if (existingConfig.direction === 'desc') {
            // Remove this sort
            return prev.filter(config => config.key !== columnKey)
              .map((config, index) => ({ ...config, priority: index + 1 }));
          } else {
            // Change direction
            return prev.map(config => 
              config.key === columnKey 
                ? { ...config, direction: 'desc' as const }
                : config
            );
          }
        } else {
          // Add new sort
          return [...prev, {
            key: columnKey,
            direction: 'asc' as const,
            priority: prev.length + 1
          }];
        }
      }
    });
  };

  const sortedData = useMemo(() => {
    if (sortConfigs.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const config of sortConfigs.sort((x, y) => x.priority - y.priority)) {
        const aValue = a[config.key];
        const bValue = b[config.key];
        
        let comparison = 0;
        
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        if (comparison !== 0) {
          return config.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [data, sortConfigs]);

  const clearSort = () => setSortConfigs([]);

  const getSortConfig = (columnKey: string) => 
    sortConfigs.find(config => config.key === columnKey);

  return {
    sortedData,
    sortConfigs,
    handleSort,
    clearSort,
    getSortConfig
  };
}
