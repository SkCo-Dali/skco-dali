
import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";

export function useColumnFilters(leads: Lead[]) {
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});

  const filteredLeads = useMemo(() => {
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
    setColumnFilters(prev => ({
      ...prev,
      [column]: selectedValues
    }));
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
