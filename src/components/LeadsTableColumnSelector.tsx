
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
import { Settings2, Search, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead, LeadDefaultProperties } from "@/types/crm";

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  isDynamic?: boolean;
}

interface LeadsTableColumnSelectorProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  showTextLabel?: boolean;
  leads?: Lead[];
}

// Función para obtener las claves dinámicas de additionalInfo
const getDynamicAdditionalInfoKeys = (leads: Lead[]): string[] => {
  const keys = new Set<string>();
  
  leads.forEach(lead => {
      Object.keys(lead).forEach(key => {
        if (LeadDefaultProperties.includes(key)) return;
        keys.add(key);
      });
  });
  
  return Array.from(keys).sort();
};

// Función para generar columnas dinámicas
const generateDynamicColumns = (leads: Lead[]): ColumnConfig[] => {
  const dynamicKeys = getDynamicAdditionalInfoKeys(leads);
  
  return dynamicKeys.map(key => ({
    key: `${key}`,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    visible: false,
    sortable: true,
    isDynamic: true
  }));
};

// Función para guardar configuración en sessionStorage
const saveColumnConfig = (columns: ColumnConfig[]) => {
  try {
    sessionStorage.setItem('leads-table-columns-v2', JSON.stringify(columns));
    console.log('✅ Column configuration saved:', columns.map(c => `${c.key}: ${c.visible}`));
  } catch (error) {
    console.warn('Error saving column configuration:', error);
  }
};

// Función para limpiar la configuración guardada (útil para resetear)
const clearColumnConfig = () => {
  try {
    sessionStorage.removeItem('leads-table-columns-v2');
    console.log('🗑️ Column configuration cleared');
  } catch (error) {
    console.warn('Error clearing column configuration:', error);
  }
};

// Componente para cada elemento sortable
interface SortableColumnItemProps {
  column: ColumnConfig;
  onToggle: (columnKey: string) => void;
}

function SortableColumnItem({ column, onToggle }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 p-2 rounded ${
        isDragging ? 'bg-green-50' : 'hover:bg-gray-50'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <Checkbox
        id={`column-${column.key}`}
        checked={column.visible}
        onCheckedChange={() => onToggle(column.key)}
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
        {column.isDynamic && (
          <span className="ml-1 text-xs text-blue-500">(info adicional)</span>
        )}
      </label>
    </div>
  );
}

export function LeadsTableColumnSelector({ 
  columns, 
  onColumnsChange,
  showTextLabel = true,
  leads = []
}: LeadsTableColumnSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generar columnas dinámicas y combinar con las existentes
  const allColumns = useMemo(() => {
    const dynamicColumns = generateDynamicColumns(leads);
    const staticColumns = columns;//.filter(col => !col.isDynamic);
    
    // Combinar columnas estáticas con dinámicas, evitando duplicados
    const combinedColumns = [...staticColumns];
    
    dynamicColumns.forEach(dynamicCol => {
      const existingIndex = combinedColumns.findIndex(col => col.key === dynamicCol.key);
      if (existingIndex === -1) {
        combinedColumns.push(dynamicCol);
      } else {
        // Actualizar columna existente manteniendo la visibilidad
        combinedColumns[existingIndex] = {
          ...dynamicCol,
          visible: combinedColumns[existingIndex].visible
        };
      }
    });
    
    return combinedColumns;
  }, [columns, leads]);

  // Filtrar columnas basado en el término de búsqueda
  const filteredColumns = useMemo(() => {
    if (!searchTerm) return allColumns;
    return allColumns.filter(column => 
      column.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allColumns, searchTerm]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = allColumns.findIndex(col => col.key === active.id);
      const newIndex = allColumns.findIndex(col => col.key === over.id);
      
      const newColumns = arrayMove(allColumns, oldIndex, newIndex);
      saveColumnConfig(newColumns);
      onColumnsChange(newColumns);
    }
  };

  const handleToggleColumn = (columnKey: string) => {
    // Prevent deselecting the name column as it's mandatory
    if (columnKey === 'name') {
      return;
    }
    
    const updatedColumns = allColumns.map(col => 
      col.key === columnKey 
        ? { ...col, visible: !col.visible }
        : col
    );
    
    // Guardar configuración en sessionStorage
    saveColumnConfig(updatedColumns);
    onColumnsChange(updatedColumns);
  };

  const handleToggleAll = (checked: boolean) => {
    const updatedColumns = allColumns.map(col => ({
      ...col,
      // Always keep name column visible even when unchecking all
      visible: col.key === 'name' ? true : checked
    }));
    
    // Guardar configuración en sessionStorage
    saveColumnConfig(updatedColumns);
    onColumnsChange(updatedColumns);
  };

  // Función para resetear a la configuración por defecto
  const handleReset = () => {
    clearColumnConfig();
    // Recargar la página para aplicar la configuración por defecto
    window.location.reload();
  };

  const visibleCount = allColumns.filter(col => col.visible).length;
  const selectableColumns = allColumns.filter(col => col.key !== 'name');
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
          <Settings2 className="h-4 w-4 text-[#00C73D]" />
          {showTextLabel && <span className="ml-1">Personaliza</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Seleccionar y reordenar columnas</h3>
            <span className="text-xs text-gray-500">
              {visibleCount} de {allColumns.length}
            </span>
          </div>
          
          {/* Buscador */}
          <div className="relative mb-3">
            <Input
              placeholder="Buscar columnas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-[#00C73D] rounded-xl focus:border-[#00C73D] focus:ring-[#00C73D]"
            />
          </div>

          {/* Mensaje informativo */}
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            <GripVertical className="h-3 w-3" />
            <span>Arrastra para reordenar las columnas</span>
          </div>
          
          <ScrollArea className="h-64 border-2 border-[#dedede] rounded-md">
            <div className="p-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredColumns.map(col => col.key)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredColumns.map((column) => (
                    <SortableColumnItem
                      key={column.key}
                      column={column}
                      onToggle={handleToggleColumn}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </ScrollArea>

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
