
import { useState, useCallback, useRef, useEffect } from 'react';
import { ColumnConfig } from '@/components/LeadsTableColumnSelector';

export interface ResizableColumnConfig extends ColumnConfig {
  width: number;
  minWidth: number;
  maxWidth: number;
}

export function useResizableColumns(initialColumns: ColumnConfig[]) {
  const [columns, setColumns] = useState<ResizableColumnConfig[]>(() =>
    initialColumns.map(col => ({
      ...col,
      width: col.key === 'name' ? 350 : 250,
      minWidth: col.key === 'name' ? 200 : 150,
      maxWidth: 500
    }))
  );

  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  // Actualizar columnas cuando cambien las iniciales
  useEffect(() => {
    setColumns(prev => {
      const newColumns = initialColumns.map(col => {
        const existingCol = prev.find(c => c.key === col.key);
        return {
          ...col,
          width: existingCol?.width || (col.key === 'name' ? 350 : 250),
          minWidth: col.key === 'name' ? 200 : 150,
          maxWidth: 500
        };
      });
      return newColumns;
    });
  }, [initialColumns]);

  const handleResizeStart = useCallback((columnKey: string, startX: number) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column) return;

    setIsResizing(true);
    setResizingColumn(columnKey);
    resizeStartRef.current = { x: startX, width: column.width };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.x;
      const newWidth = Math.max(
        column.minWidth,
        Math.min(column.maxWidth, resizeStartRef.current.width + deltaX)
      );

      setColumns(prev => prev.map(col =>
        col.key === columnKey ? { ...col, width: newWidth } : col
      ));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevenir selección de texto durante el redimensionamiento
    e.preventDefault();
  }, [columns]);

  const updateColumnWidth = useCallback((columnKey: string, width: number) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, width } : col
    ));
  }, []);

  return {
    columns,
    setColumns,
    isResizing,
    resizingColumn,
    handleResizeStart,
    updateColumnWidth
  };
}
