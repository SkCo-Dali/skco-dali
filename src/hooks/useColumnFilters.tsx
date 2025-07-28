
import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";
import { useTextFilters } from "@/hooks/useTextFilters";
import { getDynamicColumnValue } from "@/utils/dynamicColumnsUtils";

export function useColumnFilters(leads: Lead[]) {
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const { textFilters, filteredLeads: textFilteredLeads, handleTextFilterChange } = useTextFilters(leads);

  const filteredLeads = useMemo(() => {
    // Primero aplicar filtros de texto
    let result = textFilteredLeads;
    
    // Luego aplicar filtros de columna (valores específicos)
    if (Object.keys(columnFilters).length === 0) return result;
    
    return result.filter(lead => {
      return Object.entries(columnFilters).every(([column, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        
        let leadValue: string;
        
        // Verificar si es una columna dinámica
        if (column.startsWith('additionalInfo.')) {
          leadValue = getDynamicColumnValue(lead, column);
        } else {
          const rawValue = lead[column as keyof Lead];
          leadValue = rawValue === null || rawValue === undefined ? "" : String(rawValue);
        }
        
        return selectedValues.includes(leadValue);
      });
    });
  }, [textFilteredLeads, columnFilters]);

  const handleColumnFilterChange = (column: string, selectedValues: string[]) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      
      if (selectedValues.length === 0) {
        delete newFilters[column];
      } else {
        newFilters[column] = selectedValues;
      }
      
      return newFilters;
    });
  };

  const clearColumnFilter = (column: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  const clearAllColumnFilters = () => {
    setColumnFilters({});
  };

  return {
    columnFilters,
    textFilters,
    filteredLeads,
    handleColumnFilterChange,
    handleTextFilterChange,
    clearColumnFilter,
    clearAllColumnFilters
  };
}
