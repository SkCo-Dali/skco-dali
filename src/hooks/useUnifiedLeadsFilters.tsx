import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";
import { TextFilterCondition } from "@/components/TextFilter";

export function useUnifiedLeadsFilters(leads: Lead[]) {
  // Estado para filtros generales
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState<string | string[]>("all");
  const [filterPriority, setFilterPriority] = useState<string | string[]>("all");
  const [filterAssignedTo, setFilterAssignedTo] = useState<string | string[]>("all");
  const [filterSource, setFilterSource] = useState<string | string[]>("all");
  const [filterCampaign, setFilterCampaign] = useState<string | string[]>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterValueMin, setFilterValueMin] = useState("");
  const [filterValueMax, setFilterValueMax] = useState("");
  const [filterDuplicates, setFilterDuplicates] = useState<string>("all");
  const [sortBy, setSortBy] = useState("updated");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Estado para filtros por columna
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [textFilters, setTextFilters] = useState<Record<string, TextFilterCondition[]>>({});

  // Identificar leads duplicados por email, teléfono o número de documento
  const duplicateIdentifiers = useMemo(() => {
    const emailCounts = leads.reduce((acc, lead) => {
      if (lead.email) {
        acc[lead.email.toLowerCase()] = (acc[lead.email.toLowerCase()] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const phoneCounts = leads.reduce((acc, lead) => {
      if (lead.phone) {
        const normalizedPhone = lead.phone.replace(/[\s\-\(\)]/g, '');
        acc[normalizedPhone] = (acc[normalizedPhone] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const documentCounts = leads.reduce((acc, lead) => {
      if (lead.documentNumber) {
        acc[lead.documentNumber.toString()] = (acc[lead.documentNumber.toString()] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const duplicateEmails = Object.keys(emailCounts).filter(email => emailCounts[email] > 1);
    const duplicatePhones = Object.keys(phoneCounts).filter(phone => phoneCounts[phone] > 1);
    const duplicateDocuments = Object.keys(documentCounts).filter(doc => documentCounts[doc] > 1);

    return {
      emails: duplicateEmails,
      phones: duplicatePhones,
      documents: duplicateDocuments
    };
  }, [leads]);

  // Función para aplicar filtros de texto en columnas específicas
  const applyTextFilter = (lead: Lead, column: string, conditions: TextFilterCondition[]) => {
    if (conditions.length === 0) return true;

    return conditions.some(condition => {
      let leadValue: any;
      
      // Manejar columnas dinámicas de additionalInfo
      if (column.startsWith('additionalInfo.')) {
        const key = column.replace('additionalInfo.', '');
        leadValue = lead.additionalInfo?.[key] || '';
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

  // Aplicar todos los filtros en un solo paso
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Búsqueda por texto en nombre, email, teléfono, número de documento o campaña
      const searchRegex = new RegExp(searchTerm, "i");
      const matchesSearch = !searchTerm || 
        searchRegex.test(lead.name) || 
        searchRegex.test(lead.email) || 
        searchRegex.test(lead.phone || "") ||
        searchRegex.test(lead.documentNumber?.toString() || "") ||
        searchRegex.test(lead.campaign || "");

      // Función helper para verificar filtros múltiples
      const matchesMultiFilter = (filterValue: string | string[], leadValue: string) => {
        if (filterValue === "all") return true;
        if (Array.isArray(filterValue)) {
          return filterValue.length === 0 || filterValue.includes(leadValue);
        }
        return filterValue === leadValue;
      };

      // Filtros generales
      const matchesGeneralFilters = 
        matchesMultiFilter(filterStage, lead.stage) &&
        matchesMultiFilter(filterPriority, lead.priority) &&
        matchesMultiFilter(filterAssignedTo, lead.assignedTo) &&
        matchesMultiFilter(filterSource, lead.source) &&
        matchesMultiFilter(filterCampaign, lead.campaign || "");

      // Filtros de fecha
      const dateFromFilter = !filterDateFrom || new Date(lead.createdAt) >= new Date(filterDateFrom);
      const dateToFilter = !filterDateTo || new Date(lead.createdAt) <= new Date(filterDateTo);
      
      // Filtros de valor
      const valueMinFilter = !filterValueMin || lead.value >= parseInt(filterValueMin);
      const valueMaxFilter = !filterValueMax || lead.value <= parseInt(filterValueMax);

      // Filtro de duplicados
      const duplicatesFilter = () => {
        if (filterDuplicates === "all") return true;
        
        const isDuplicate = 
          (lead.email && duplicateIdentifiers.emails.includes(lead.email.toLowerCase())) ||
          (lead.phone && duplicateIdentifiers.phones.includes(lead.phone.replace(/[\s\-\(\)]/g, ''))) ||
          (lead.documentNumber && duplicateIdentifiers.documents.includes(lead.documentNumber.toString()));

        if (filterDuplicates === "duplicates") {
          return isDuplicate;
        }
        if (filterDuplicates === "unique") {
          return !isDuplicate;
        }
        return true;
      };

      // Filtros por columna específica
      const matchesColumnFilters = Object.entries(columnFilters).every(([column, selectedValues]) => {
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

      // Filtros de texto por columna
      const matchesTextFilters = Object.entries(textFilters).every(([column, conditions]) => {
        if (conditions.length === 0) return true;
        return applyTextFilter(lead, column, conditions);
      });

      return (
        matchesSearch &&
        matchesGeneralFilters &&
        dateFromFilter &&
        dateToFilter &&
        valueMinFilter &&
        valueMaxFilter &&
        duplicatesFilter() &&
        matchesColumnFilters &&
        matchesTextFilters
      );
    });
  }, [
    leads, 
    searchTerm, 
    filterStage, 
    filterPriority, 
    filterAssignedTo, 
    filterSource, 
    filterCampaign, 
    filterDateFrom, 
    filterDateTo, 
    filterValueMin, 
    filterValueMax, 
    filterDuplicates, 
    duplicateIdentifiers,
    columnFilters,
    textFilters
  ]);

  // Aplicar ordenamiento
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let result = 0;
      
      switch (sortBy) {
        case "name":
          result = a.name.localeCompare(b.name);
          break;
        case "value":
          result = b.value - a.value;
          break;
        case "created":
          result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "updated":
        default:
          result = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? result : -result;
    });
  }, [filteredLeads, sortBy, sortDirection]);

  // Funciones para manejar filtros por columna
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

  const clearColumnFilter = (column: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
    setTextFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterStage("all");
    setFilterPriority("all");
    setFilterAssignedTo("all");
    setFilterSource("all");
    setFilterCampaign("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterValueMin("");
    setFilterValueMax("");
    setFilterDuplicates("all");
    setColumnFilters({});
    setTextFilters({});
  };

  const hasFiltersForColumn = (column: string) => {
    return (columnFilters[column] && columnFilters[column].length > 0) || 
           (textFilters[column] && textFilters[column].length > 0);
  };

  // Obtener opciones únicas para los filtros
  const uniqueStages = useMemo(() => 
    Array.from(new Set(leads.map(lead => lead.stage))).filter(Boolean),
    [leads]
  );

  const uniqueSources = useMemo(() => 
    Array.from(new Set(leads.map(lead => lead.source))).filter(Boolean),
    [leads]
  );

  const uniqueCampaigns = useMemo(() => 
    Array.from(new Set(leads.map(lead => lead.campaign))).filter(Boolean),
    [leads]
  );

  const uniqueAssignedTo = useMemo(() => 
    Array.from(new Set(leads.map(lead => lead.assignedTo))).filter(Boolean),
    [leads]
  );

  // Contar leads duplicados
  const duplicateCount = useMemo(() => {
    if (filterDuplicates === "all") return 0;
    
    return leads.filter(lead => 
      (lead.email && duplicateIdentifiers.emails.includes(lead.email.toLowerCase())) ||
      (lead.phone && duplicateIdentifiers.phones.includes(lead.phone.replace(/[\s\-\(\)]/g, ''))) ||
      (lead.documentNumber && duplicateIdentifiers.documents.includes(lead.documentNumber.toString()))
    ).length;
  }, [leads, duplicateIdentifiers, filterDuplicates]);

  return {
    // Filtros generales
    searchTerm,
    setSearchTerm,
    filterStage,
    setFilterStage,
    filterPriority,
    setFilterPriority,
    filterAssignedTo,
    setFilterAssignedTo,
    filterSource,
    setFilterSource,
    filterCampaign,
    setFilterCampaign,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    filterValueMin,
    setFilterValueMin,
    filterValueMax,
    setFilterValueMax,
    filterDuplicates,
    setFilterDuplicates,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    
    // Filtros por columna
    columnFilters,
    textFilters,
    handleColumnFilterChange,
    handleTextFilterChange,
    clearColumnFilter,
    hasFiltersForColumn,
    
    // Resultados
    filteredLeads: sortedLeads,
    clearFilters: clearAllFilters,
    
    // Opciones para dropdowns
    uniqueStages,
    uniqueSources,
    uniqueCampaigns,
    uniqueAssignedTo,
    duplicateCount,
  };
}