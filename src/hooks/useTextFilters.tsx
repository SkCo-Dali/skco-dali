
import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";
import { TextFilterCondition } from "@/components/TextFilter";

export function useTextFilters(leads: Lead[]) {
  const [textFilters, setTextFilters] = useState<Record<string, TextFilterCondition[]>>({});

  const applyTextFilter = (lead: Lead, column: string, conditions: TextFilterCondition[]) => {
    if (conditions.length === 0) return true;

    return conditions.some(condition => {
      let leadValue: any;
      
      // Handle dynamic additionalInfo columns
      if (column.startsWith('additionalInfo.')) {
        const key = column.replace('additionalInfo.', '');
        leadValue = lead.additionalInfo?.[key];
      } else {
        leadValue = lead[column as keyof Lead];
      }
      
      const stringValue = leadValue === null || leadValue === undefined ? "" : String(leadValue);
      const filterValue = condition.value.toLowerCase();
      const leadValueLower = stringValue.toLowerCase();

      switch (condition.operator) {
        case 'equals':
          return leadValueLower === filterValue;
        case 'not_equals':
          return leadValueLower !== filterValue;
        case 'contains':
          return leadValueLower.includes(filterValue);
        case 'not_contains':
          return !leadValueLower.includes(filterValue);
        case 'starts_with':
          return leadValueLower.startsWith(filterValue);
        case 'ends_with':
          return leadValueLower.endsWith(filterValue);
        case 'is_empty':
          return stringValue === '';
        case 'is_not_empty':
          return stringValue !== '';
        case 'greater_than':
          return Number(leadValue) > Number(condition.value);
        case 'less_than':
          return Number(leadValue) < Number(condition.value);
        case 'greater_equal':
          return Number(leadValue) >= Number(condition.value);
        case 'less_equal':
          return Number(leadValue) <= Number(condition.value);
        case 'after':
          return new Date(stringValue) > new Date(condition.value);
        case 'before':
          return new Date(stringValue) < new Date(condition.value);
        default:
          return true;
      }
    });
  };

  const filteredLeads = useMemo(() => {
    if (Object.keys(textFilters).length === 0) return leads;
    
    return leads.filter(lead => {
      return Object.entries(textFilters).every(([column, conditions]) => {
        if (conditions.length === 0) return true;
        return applyTextFilter(lead, column, conditions);
      });
    });
  }, [leads, textFilters]);

  const handleTextFilterChange = (column: string, conditions: TextFilterCondition[]) => {
    setTextFilters(prev => {
      const newFilters = { ...prev };
      
      if (conditions.length === 0) {
        delete newFilters[column];
      } else {
        newFilters[column] = conditions;
      }
      
      return newFilters;
    });
  };

  const clearTextFilter = (column: string) => {
    setTextFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  const clearAllTextFilters = () => {
    setTextFilters({});
  };

  return {
    textFilters,
    filteredLeads,
    handleTextFilterChange,
    clearTextFilter,
    clearAllTextFilters
  };
}
