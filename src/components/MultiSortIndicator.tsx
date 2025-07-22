
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SortConfig } from '@/hooks/useMultiSort';

interface MultiSortIndicatorProps {
  sortConfig: SortConfig | undefined;
  totalSorts: number;
}

export function MultiSortIndicator({ sortConfig, totalSorts }: MultiSortIndicatorProps) {
  if (!sortConfig) return null;

  return (
    <div className="flex items-center ml-1">
      {sortConfig.direction === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
      {totalSorts > 1 && (
        <span className="text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-1">
          {sortConfig.priority}
        </span>
      )}
    </div>
  );
}
