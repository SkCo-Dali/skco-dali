
import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";

export function useColumnFilters(leads: Lead[]) {
  // Since we're removing column filters, this hook now just returns the original leads
  const columnFilters = {};
  
  const handleColumnFilterChange = (columnKey: string, selectedValues: string[]) => {
    // No-op since we're removing column filters
  };

  const clearColumnFilters = () => {
    // No-op since we're removing column filters
  };

  const filteredLeads = leads; // Just return the original leads

  const hasActiveFilters = false; // No active filters

  return {
    columnFilters,
    handleColumnFilterChange,
    clearColumnFilters,
    filteredLeads,
    hasActiveFilters
  };
}
