
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SortDescriptor {
  columnKey: string;
  direction: 'asc' | 'desc';
}

interface MultiSortIndicatorProps {
  sortDescriptors: SortDescriptor[];
  columnKey: string;
}

export function MultiSortIndicator({ sortDescriptors, columnKey }: MultiSortIndicatorProps) {
  const sortDescriptor = sortDescriptors.find(d => d.columnKey === columnKey);
  
  if (!sortDescriptor) return null;

  const sortIndex = sortDescriptors.findIndex(d => d.columnKey === columnKey);

  return (
    <div className="flex items-center ml-1">
      {sortDescriptor.direction === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
      {sortDescriptors.length > 1 && (
        <span className="text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-1">
          {sortIndex + 1}
        </span>
      )}
    </div>
  );
}
