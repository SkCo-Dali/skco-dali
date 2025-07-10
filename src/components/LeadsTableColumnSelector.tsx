
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Columns3Cog } from "lucide-react";

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

interface LeadsTableColumnSelectorProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  className?: string;
}

export function LeadsTableColumnSelector({ columns, onColumnsChange, className }: LeadsTableColumnSelectorProps) {
  const handleColumnToggle = (columnKey: string) => {
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updatedColumns);
  };

  const handleSelectAll = () => {
    const allVisible = columns.every(col => col.visible);
    const updatedColumns = columns.map(col => ({
      ...col,
      visible: !allVisible
    }));
    onColumnsChange(updatedColumns);
  };

  const allColumnsVisible = columns.every(col => col.visible);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="text-[#3f3f3f] w-30 h-8 bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300">
          <Columns3Cog className="h-4 w-4 mr-0 text-[#00c83c] justify-items-end" />
          Personaliza
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-4">
          {/* Header */}
          <h3 className="text-sm font-medium text-gray-900 mb-4">Personaliza las columnas</h3>
          
          {/* Column list with scroll */}
          <ScrollArea className="h-48 mb-4">
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={column.key}
                      checked={column.visible}
                      onCheckedChange={() => handleColumnToggle(column.key)}
                      className="h-4 w-4 border-gray-300 data-[state=checked]:bg-[#00c83c] data-[state=checked]:border-[#00c83c]"
                    />
                    <label
                      htmlFor={column.key}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {column.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Show all columns toggle */}
          <div className="flex items-center justify-between py-3 border-t border-gray-200">
            <span className="text-sm text-gray-700">Mostrar todas las columnas</span>
            <Switch
              checked={allColumnsVisible}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-[#00c83c]"
            />
          </div> 
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
