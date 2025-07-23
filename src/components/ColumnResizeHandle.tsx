
import React from 'react';
import { cn } from '@/lib/utils';

interface ColumnResizeHandleProps {
  onResizeStart: (startX: number) => void;
  isResizing: boolean;
}

export function ColumnResizeHandle({ onResizeStart, isResizing }: ColumnResizeHandleProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(e.clientX);
  };

  return (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors",
        "after:absolute after:right-0 after:top-0 after:h-full after:w-3 after:transform after:-translate-x-1",
        "after:content-[''] after:cursor-col-resize",
        isResizing && "bg-blue-500"
      )}
      onMouseDown={handleMouseDown}
      style={{ 
        zIndex: 10,
        right: '-2px' // Ajustar posición para mejor accesibilidad
      }}
    />
  );
}
