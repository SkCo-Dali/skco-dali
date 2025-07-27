import React, { useState } from "react";
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
import { Settings2 } from "lucide-react";

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

export const initialColumnsConfig: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: true, sortable: true },
  { key: 'company', label: 'Empresa', visible: true, sortable: true },
  { key: 'product', label: 'Producto', visible: true, sortable: true },
  { key: 'status', label: 'Estado', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true, sortable: true },
  { key: 'priority', label: 'Prioridad', visible: true, sortable: true },
  { key: 'stage', label: 'Etapa', visible: true, sortable: true },
  { key: 'campaign', label: 'Campaña', visible: false, sortable: true },
  { key: 'portfolio', label: 'Portafolio', visible: false, sortable: true },
  { key: 'nextFollowUp', label: 'Próximo seguimiento', visible: false, sortable: true },
];

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

  const handleToggleColumn = (columnKey: string) => {
    if (columnKey === 'name') {
      return;
    }
    
    const updatedColumns = columns.map(col => 
      col.key === columnKey 
        ? { ...col, visible: !col.visible }
        : col
    );
    
    saveColumnConfig(updatedColumns);
    onColumnsChange(updatedColumns);
  };

  const handleToggleAll = (checked: boolean) => {
    const updatedColumns = columns.map(col => ({
      ...col,
      visible: col.key === 'name' ? true : checked
    }));
    
    saveColumnConfig(updatedColumns);
    onColumnsChange(updatedColumns);
  };

  const handleReset = () => {
    clearColumnConfig();
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
            <h3 className="font-medium text-sm">Seleccionar columnas</h3>
            <span className="text-xs text-gray-500">
              {visibleCount} de {columns.length}
            </span>
          </div>
          
          <ScrollArea className="h-64 border-2 border-[#dedede] rounded-md">
            <div className="space-y-2 p-2">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
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
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between mt-4 pb-3 border-b border-gray-100">
            <span className="text-sm font-medium">Seleccionar todas</span>
            <Switch
              checked={allSelectableSelected}
              onCheckedChange={handleToggleAll}
            />
          </div>

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

export { saveColumnConfig, clearColumnConfig };
