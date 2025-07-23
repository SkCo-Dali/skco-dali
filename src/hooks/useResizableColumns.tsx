
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
  const isResizingRef = useRef(false); // Add ref to track resize state
  const columnsRef = useRef(columns); // Add ref to avoid stale closures

  // Update columns ref when columns change
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  // Actualizar columnas cuando cambien las iniciales - OPTIMIZED
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
    const column = columnsRef.current.find(col => col.key === columnKey);
    if (!column || isResizingRef.current) return;

    console.log('🔧 Starting column resize for:', columnKey);
    
    setIsResizing(true);
    setResizingColumn(columnKey);
    isResizingRef.current = true;
    resizeStartRef.current = { x: startX, width: column.width };

    // Use requestAnimationFrame to throttle updates
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current || !isResizingRef.current) return;

      // Cancel previous frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Schedule update for next frame
      animationFrameId = requestAnimationFrame(() => {
        if (!resizeStartRef.current) return;

        const deltaX = e.clientX - resizeStartRef.current.x;
        const currentColumn = columnsRef.current.find(col => col.key === columnKey);
        if (!currentColumn) return;

        const newWidth = Math.max(
          currentColumn.minWidth,
          Math.min(currentColumn.maxWidth, resizeStartRef.current.width + deltaX)
        );

        setColumns(prev => prev.map(col =>
          col.key === columnKey ? { ...col, width: newWidth } : col
        ));
      });
    };

    const handleMouseUp = () => {
      console.log('🔧 Ending column resize for:', columnKey);
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      setIsResizing(false);
      setResizingColumn(null);
      isResizingRef.current = false;
      resizeStartRef.current = null;
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []); // Remove columns dependency to prevent recreation

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
