
import React from 'react';

interface ColumnResizeHandleProps {
  columnKey: string;
  onResizeStart: (columnKey: string, startX: number) => void;
  isResizing: boolean;
}

export function ColumnResizeHandle({ columnKey, onResizeStart, isResizing }: ColumnResizeHandleProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(columnKey, e.clientX);
  };

  return (
    <div
      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-500 ${
        isResizing ? 'bg-blue-500' : ''
      }`}
      onMouseDown={handleMouseDown}
    />
  );
}
