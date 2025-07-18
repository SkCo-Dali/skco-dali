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

interface LeadsTableColumnSelectorProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  showTextLabel?: boolean;
}

export function LeadsTableColumnSelector({ 
  columns, 
  onColumnsChange,
  showTextLabel = true
}: LeadsTableColumnSelectorProps) {
  const [open, setOpen] = useState(false);

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
    onColumnsChange(updatedColumns);
  };

  const handleToggleAll = (checked: boolean) => {
    const updatedColumns = columns.map(col => ({
      ...col,
      // Always keep name column visible even when unchecking all
      visible: col.key === 'name' ? true : checked
    }));
    onColumnsChange(updatedColumns);
  };

  const visibleCount = columns.filter(col => col.visible).length;
  const selectableColumns = columns.filter(col => col.key !== 'name');
  const allSelectableSelected = selectableColumns.every(col => col.visible);
  const noneSelectableSelected = selectableColumns.every(col => !col.visible);

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

          {/* Toggle All Section */}
          <div className="flex items-center justify-between mt-4 pb-3 border-b border-gray-100">
            <span className="text-sm font-medium">Seleccionar todas</span>
            <Switch
              checked={allSelectableSelected}
              onCheckedChange={handleToggleAll}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
