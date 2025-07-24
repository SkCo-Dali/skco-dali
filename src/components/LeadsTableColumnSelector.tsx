
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Settings2, GripVertical, Search } from "lucide-react";

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

interface LeadsTableColumnSelectorProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  showTextLabel?: boolean;
}

// Función para guardar configuración en sessionStorage
const saveColumnConfig = (columns: ColumnConfig[]) => {
  try {
    sessionStorage.setItem('leads-table-columns', JSON.stringify(columns));
    console.log('✅ Column configuration saved:', columns.map(c => `${c.key}: ${c.visible}`));
  } catch (error) {
    console.warn('Error saving column configuration:', error);
  }
};

// Función para limpiar la configuración guardada (útil para resetear)
const clearColumnConfig = () => {
  try {
    sessionStorage.removeItem('leads-table-columns');
    console.log('🗑️ Column configuration cleared');
  } catch (error) {
    console.warn('Error clearing column configuration:', error);
  }
};

export function LeadsTableColumnSelector({ 
  columns, 
  onColumnsChange,
  showTextLabel = true
}: LeadsTableColumnSelectorProps) {
  const [open, setOpen] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Debug: Log columns cuando cambien
  React.useEffect(() => {
    console.log('🔍 LeadsTableColumnSelector received columns:', columns.length);
    console.log('🔍 Column keys:', columns.map(c => c.key));
    console.log('🔍 Dynamic columns:', columns.filter(c => c.key.startsWith('additional_')));
  }, [columns]);

  // Filtrar columnas basado en el término de búsqueda
  const filteredColumns = useMemo(() => {
    if (!searchTerm.trim()) {
      return columns;
    }
    
    return columns.filter(column => 
      column.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      column.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [columns, searchTerm]);

  const handleToggleColumn = (columnKey: string) => {
    // Prevent deselecting the name column as it's mandatory
    if (columnKey === 'name') {
      return;
    }
    
    const updatedColumns = columns.map(col => 
      col.key === columnKey 
        ? { ...col, visible: !col.visible }
        : col
    );
    
    // Guardar configuración en sessionStorage
    saveColumnConfig(updatedColumns);
    onColumnsChange(updatedColumns);
  };

  const handleToggleAll = (checked: boolean) => {
    const updatedColumns = columns.map(col => ({
      ...col,
      // Always keep name column visible even when unchecking all
      visible: col.key === 'name' ? true : checked
    }));
    
    // Guardar configuración en sessionStorage
    saveColumnConfig(updatedColumns);
    onColumnsChange(updatedColumns);
  };

  const handleReorderColumns = (draggedKey: string, targetKey: string) => {
    const draggedIndex = columns.findIndex(col => col.key === draggedKey);
    const targetIndex = columns.findIndex(col => col.key === targetKey);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newColumns = [...columns];
    const [draggedCol] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedCol);

    saveColumnConfig(newColumns);
    onColumnsChange(newColumns);
  };

  const handleDragStart = (e: React.DragEvent, columnKey: string) => {
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetKey) {
      handleReorderColumns(draggedColumn, targetKey);
    }
    setDraggedColumn(null);
  };

  // Función para resetear a la configuración por defecto
  const handleReset = () => {
    clearColumnConfig();
    // Recargar la página para aplicar la configuración por defecto
    window.location.reload();
  };

  const visibleCount = columns.filter(col => col.visible).length;
  const selectableColumns = columns.filter(col => col.key !== 'name');
  const allSelectableSelected = selectableColumns.every(col => col.visible);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          className="text-[#3f3f3f] bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300"
          style={{ 
            width: showTextLabel ? 'auto' : '32px',
            height: '32px'
          }}
        >
          <Settings2 className="h-4 w-4 text-[#00c83c]" />
          {showTextLabel && <span className="ml-1">Personaliza</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Seleccionar y reordenar columnas</h3>
            <span className="text-xs text-gray-500">
              {visibleCount} de {columns.length}
            </span>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar columnas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>
          
          <div className="text-xs text-gray-500 mb-2">
            💡 Arrastra para reordenar las columnas
          </div>
          
          <ScrollArea className="h-64 border-2 border-[#dedede] rounded-md">
            <div className="space-y-2 p-2">
              {filteredColumns.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">
                  No se encontraron columnas
                </div>
              ) : (
                filteredColumns.map((column) => (
                  <div 
                    key={column.key} 
                    className={`flex items-center space-x-2 p-2 rounded cursor-move hover:bg-gray-50 ${
                      draggedColumn === column.key ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column.key)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.key)}
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Checkbox
                      id={`column-${column.key}`}
                      checked={column.visible}
                      onCheckedChange={() => handleToggleColumn(column.key)}
                      disabled={column.key === 'name'}
                    />
                    <label 
                      htmlFor={`column-${column.key}`} 
                      className={`text-sm flex-1 ${
                        column.key === 'name' 
                          ? 'cursor-default text-gray-500' 
                          : 'cursor-pointer'
                      }`}
                    >
                      {column.label}
                      {column.key === 'name' && (
                        <span className="ml-1 text-xs text-gray-400">(obligatorio)</span>
                      )}
                      {column.key.startsWith('additional_') && (
                        <span className="ml-1 text-xs text-blue-500">(dinámico)</span>
                      )}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Show search results count */}
          {searchTerm && (
            <div className="text-xs text-gray-500 mt-2">
              Mostrando {filteredColumns.length} de {columns.length} columnas
            </div>
          )}

          {/* Toggle All Section */}
          <div className="flex items-center justify-between mt-4 pb-3 border-b border-gray-100">
            <span className="text-sm font-medium">Seleccionar todas</span>
            <Switch
              checked={allSelectableSelected}
              onCheckedChange={handleToggleAll}
            />
          </div>

          {/* Reset Button */}
          <div className="mt-3">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              Restablecer por defecto
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Exportar funciones utilitarias
export { saveColumnConfig, clearColumnConfig };
