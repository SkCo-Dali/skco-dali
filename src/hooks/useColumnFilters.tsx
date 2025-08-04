
import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";
import { useTextFilters } from "@/hooks/useTextFilters";
import { TextFilterCondition } from "@/components/TextFilter";

export function useColumnFilters(leads: Lead[]) {
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const { textFilters, filteredLeads: textFilteredLeads, handleTextFilterChange, clearTextFilter } = useTextFilters(leads);

  const filteredLeads = useMemo(() => {
    // Primero aplicar filtros de texto
    let result = textFilteredLeads;
    
    // Luego aplicar filtros de columna (valores específicos)
    if (Object.keys(columnFilters).length === 0) return result;
    
    return result.filter(lead => {
      return Object.entries(columnFilters).every(([column, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        
        let leadValue: any;
        
        // Manejar columnas dinámicas de additionalInfo
        if (column.startsWith('additionalInfo.')) {
          const key = column.replace('additionalInfo.', '');
          leadValue = lead.additionalInfo?.[key] || '';
        } else {
          leadValue = lead[column as keyof Lead];
        }
        
        const stringValue = leadValue === null || leadValue === undefined ? "" : String(leadValue);
        
        return selectedValues.includes(stringValue);
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
    // También limpiar filtros de texto para esta columna
    clearTextFilter(column);
  };

  const clearAllColumnFilters = () => {
    setColumnFilters({});
  };

  const hasFiltersForColumn = (column: string) => {
    return (columnFilters[column] && columnFilters[column].length > 0) || 
           (textFilters[column] && textFilters[column].length > 0);
  };

  return {
    columnFilters,
    textFilters,
    filteredLeads,
    handleColumnFilterChange,
    handleTextFilterChange,
    clearColumnFilter,
    clearAllColumnFilters,
    hasFiltersForColumn
  };
}
