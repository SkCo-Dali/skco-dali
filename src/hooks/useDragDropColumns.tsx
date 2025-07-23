
import { useState, useCallback, useRef, useEffect } from 'react';
import { ColumnConfig } from '@/components/LeadsTableColumnSelector';

export function useDragDropColumns(initialColumns: ColumnConfig[]) {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  
  // Use refs to prevent stale closures and excessive re-renders
  const columnsRef = useRef(initialColumns);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update columns ref when columns change
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  // Update columns when initialColumns change - STABLE
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const handleDragStart = useCallback((columnKey: string) => {
    console.log('🎯 Starting drag for column:', columnKey);
    setDraggedColumn(columnKey);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    
    if (columnKey !== draggedColumn) {
      // Throttle drag over events to reduce excessive state updates
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      
      dragTimeoutRef.current = setTimeout(() => {
        setDragOverColumn(columnKey);
      }, 50); // Throttle to 50ms
    }
  }, [draggedColumn]);

  const handleDragLeave = useCallback(() => {
    // Clear timeout if user drags away quickly
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    // Use a small delay to prevent flickering
    setTimeout(() => {
      setDragOverColumn(null);
    }, 10);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumnKey: string) => {
    e.preventDefault();
    
    console.log('🎯 Dropping column:', draggedColumn, 'onto:', targetColumnKey);
    
    // Clear any pending timeouts
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    if (!draggedColumn || draggedColumn === targetColumnKey) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const currentColumns = columnsRef.current;
    const draggedIndex = currentColumns.findIndex(col => col.key === draggedColumn);
    const targetIndex = currentColumns.findIndex(col => col.key === targetColumnKey);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const newColumns = [...currentColumns];
    const [draggedCol] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedCol);

    setColumns(newColumns);
    setDraggedColumn(null);
    setDragOverColumn(null);
    
    console.log('🎯 Column reorder completed');
  }, [draggedColumn]);

  const handleDragEnd = useCallback(() => {
    console.log('🎯 Drag ended');
    
    // Clear any pending timeouts
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  return {
    columns,
    setColumns,
    draggedColumn,
    dragOverColumn,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  };
}
