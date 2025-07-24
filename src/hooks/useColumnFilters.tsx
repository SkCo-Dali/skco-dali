
import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";

export function useColumnFilters(leads: Lead[]) {
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});

  const filteredLeads = useMemo(() => {
    if (Object.keys(columnFilters).length === 0) return leads;
    
    return leads.filter(lead => {
      return Object.entries(columnFilters).every(([column, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        
        const leadValue = lead[column as keyof Lead];
        const stringValue = leadValue === null || leadValue === undefined ? "" : String(leadValue);
        
        return selectedValues.includes(stringValue);
      });
    });
  }, [leads, columnFilters]);

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
    filteredLeads,
    handleColumnFilterChange,
    clearColumnFilter,
    clearAllColumnFilters
  };
}
