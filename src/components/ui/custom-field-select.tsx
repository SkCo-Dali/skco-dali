import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomFieldSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomFieldSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Seleccionar...",
  className,
  disabled = false
}: CustomFieldSelectProps) {
  const selectedOption = options.find(option => option.value === value);
  
  return (
    <div className={cn("space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5", className)}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="border-0 rounded-none px-0 py-0 m-0 bg-transparent h-auto min-h-[48px] focus:ring-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent relative">
          <div className="flex flex-col items-start w-full h-full justify-between py-1">
            <span className="text-sm text-gray-500 font-normal leading-tight">
              {label}
            </span>
            <span className="text-sm font-medium text-gray-900 leading-tight">
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-[#00c83c] absolute right-0 top-1/2 transform -translate-y-1/2 flex-shrink-0" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md z-50">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}