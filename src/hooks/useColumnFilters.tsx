
import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";

export function useColumnFilters(leads: Lead[]) {
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});

  const handleColumnFilterChange = (columnKey: string, selectedValues: string[]) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: selectedValues
    }));
  };

  const clearColumnFilters = () => {
    setColumnFilters({});
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Verificar cada filtro de columna
      for (const [columnKey, filterValues] of Object.entries(columnFilters)) {
        if (filterValues.length === 0) continue; // Si no hay filtros activos, continuar

        let leadValue = '';
        switch (columnKey) {
          case 'name':
            leadValue = lead.name;
            break;
          case 'email':
            leadValue = lead.email || '';
            break;
          case 'phone':
            leadValue = lead.phone || '';
            break;
          case 'campaign':
            leadValue = lead.campaign || '';
            break;
          case 'stage':
            leadValue = lead.stage;
            break;
          case 'assignedTo':
            leadValue = lead.assignedTo || '';
            break;
          case 'source':
            leadValue = lead.source;
            break;
          case 'priority':
            leadValue = lead.priority;
            break;
          case 'product':
            leadValue = lead.product || '';
            break;
          case 'company':
            leadValue = lead.company || '';
            break;
          case 'documentType':
            leadValue = lead.documentType || '';
            break;
          case 'documentNumber':
            leadValue = lead.documentNumber?.toString() || '';
            break;
          case 'age':
            leadValue = lead.age?.toString() || '';
            break;
          case 'gender':
            leadValue = lead.gender || '';
            break;
          case 'preferredContactChannel':
            leadValue = lead.preferredContactChannel || '';
            break;
          default:
            continue;
        }

        leadValue = leadValue.toString().trim();
        
        // Si el valor del lead no está en los filtros seleccionados, excluir este lead
        if (!filterValues.includes(leadValue)) {
          return false;
        }
      }
      
      return true;
    });
  }, [leads, columnFilters]);

  const hasActiveFilters = Object.values(columnFilters).some(filters => filters.length > 0);

  return {
    columnFilters,
    handleColumnFilterChange,
    clearColumnFilters,
    filteredLeads,
    hasActiveFilters
  };
}
