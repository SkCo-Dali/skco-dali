
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Columns3Cog } from 'lucide-react';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface LeadsTableColumnSelectorProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export function LeadsTableColumnSelector({ columns, onColumnsChange }: LeadsTableColumnSelectorProps) {
  const handleColumnToggle = (columnKey: string, checked: boolean) => {
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, visible: checked } : col
    );
    onColumnsChange(updatedColumns);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="text-gray-700 rounded-sm w-30 h-10 bg-white border border-gray-300 flex items-center justify-between px-3">
  Personaliza
  <Columns3Cog className="h-4 w-4 text-primary" />
</Button>

      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-white border border-gray-300 shadow-lg z-[9999]" 
        align="end"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.key}
            checked={column.visible}
            onCheckedChange={(checked) => handleColumnToggle(column.key, checked)}
            className="cursor-pointer"
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
