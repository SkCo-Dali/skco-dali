
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Columns3Cog } from "lucide-react";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="text-[#3f3f3f] w-30 h-8 bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300">
          <Columns3Cog className="h-4 w-4 mr-2 text-[#00c83c]" />
          Personaliza
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {columns.map((column) => (
          <DropdownMenuItem key={column.key} className="cursor-pointer">
            <div className="flex items-center space-x-2 w-full">
              <Checkbox
                id={column.key}
                checked={column.visible}
                onCheckedChange={() => handleColumnToggle(column.key)}
              />
              <label
                htmlFor={column.key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {column.label}
              </label>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
