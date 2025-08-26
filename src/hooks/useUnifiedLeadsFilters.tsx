import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";
import { TextFilterCondition } from "@/components/TextFilter";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
         startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, subWeeks, 
         subMonths, subQuarters, subYears, addDays, addWeeks, addMonths, addQuarters, 
         addYears, isWithinInterval, isSameDay, isAfter, isBefore } from "date-fns";

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

  // Función para aplicar filtros de fecha por rangos
  const applyDateRangeFilter = (lead: Lead, column: string, selectedRanges: string[]) => {
    if (selectedRanges.length === 0) return true;

    // Map lastInteraction column to updatedAt field
    const dateField = column === 'lastInteraction' ? 'updatedAt' : column;
    const dateValue = lead[dateField as keyof Lead] as string;
    if (!dateValue) return false;

    try {
      const leadDate = new Date(dateValue);
      if (isNaN(leadDate.getTime())) return false; // Check for invalid date
      
      const now = new Date();

      return selectedRanges.some(rangeId => {
        // Handle custom date conditions
        if (rangeId.startsWith('custom:')) {
          const conditionStr = rangeId.replace('custom:', '');
          try {
            const condition = JSON.parse(conditionStr);
            const startDate = condition.startDate ? new Date(condition.startDate) : null;
            const endDate = condition.endDate ? new Date(condition.endDate) : null;

            switch (condition.operator) {
              case 'equals':
                return startDate && isSameDay(leadDate, startDate);
              case 'after':
                return startDate && isAfter(leadDate, startDate);
              case 'before':
                return startDate && isBefore(leadDate, startDate);
              case 'between':
                return startDate && endDate && 
                       isWithinInterval(leadDate, { start: startDate, end: endDate });
              default:
                return false;
            }
          } catch {
            return false;
          }
        }

        // Handle specific date selections
        if (rangeId.includes('-')) {
          const [year, month, day] = rangeId.split('-');
          const monthIndex = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
             'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
            .indexOf(month);
          if (monthIndex === -1) return false;
          
          const targetDate = new Date(parseInt(year), monthIndex, parseInt(day));
          return isSameDay(leadDate, targetDate);
        }

         // Handle predefined ranges - Make sure dates are valid
        // Debug the dates being processed
        console.log(`Processing range: ${rangeId} for lead date: ${dateValue} (parsed: ${leadDate.toISOString()})`);
        
        let start: Date, end: Date;
        
        try {
          switch (rangeId) {
            case 'today':
              start = startOfDay(now);
              end = endOfDay(now);
              break;
            case 'yesterday':
              const yesterday = subDays(now, 1);
              start = startOfDay(yesterday);
              end = endOfDay(yesterday);
              break;
            case 'this-week':
              start = startOfWeek(now, { weekStartsOn: 1 });
              end = endOfWeek(now, { weekStartsOn: 1 });
              break;
            case 'last-week':
              const lastWeek = subWeeks(now, 1);
              start = startOfWeek(lastWeek, { weekStartsOn: 1 });
              end = endOfWeek(lastWeek, { weekStartsOn: 1 });
              break;
            case 'next-week':
              const nextWeek = addWeeks(now, 1);
              start = startOfWeek(nextWeek, { weekStartsOn: 1 });
              end = endOfWeek(nextWeek, { weekStartsOn: 1 });
              break;
            case 'this-month':
              start = startOfMonth(now);
              end = endOfMonth(now);
              break;
            case 'last-month':
              const lastMonth = subMonths(now, 1);
              start = startOfMonth(lastMonth);
              end = endOfMonth(lastMonth);
              break;
            case 'next-month':
              const nextMonth = addMonths(now, 1);
              start = startOfMonth(nextMonth);
              end = endOfMonth(nextMonth);
              break;
            case 'this-quarter':
              start = startOfQuarter(now);
              end = endOfQuarter(now);
              break;
            case 'last-quarter':
              const lastQuarter = subQuarters(now, 1);
              start = startOfQuarter(lastQuarter);
              end = endOfQuarter(lastQuarter);
              break;
            case 'next-quarter':
              const nextQuarter = addQuarters(now, 1);
              start = startOfQuarter(nextQuarter);
              end = endOfQuarter(nextQuarter);
              break;
            case 'this-year':
              start = startOfYear(now);
              end = endOfYear(now);
              break;
            case 'last-year':
              const lastYear = subYears(now, 1);
              start = startOfYear(lastYear);
              end = endOfYear(lastYear);
              break;
            case 'next-year':
              const nextYear = addYears(now, 1);
              start = startOfYear(nextYear);
              end = endOfYear(nextYear);
              break;
            default:
              console.warn('Date filter - Unknown range:', rangeId);
              return false;
          }
          
          console.log(`Date range calculated: ${rangeId} -> Start: ${start.toISOString()}, End: ${end.toISOString()}`);
          
          // Verify dates are valid before comparing
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.error('Date filter - Invalid dates:', rangeId, start, end);
            return false;
          }

          const result = isWithinInterval(leadDate, { start, end });
          
          // Debug log for range filtering
          console.log(`Date filter - Range: ${rangeId}, Lead: ${leadDate.toISOString()}, Start: ${start.toISOString()}, End: ${end.toISOString()}, Match: ${result}`);
          
          return result;
        } catch (error) {
          console.error('Error processing date range:', rangeId, error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in date filter:', error);
      return false;
    }
  };

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
      const leadCreatedDate = new Date(lead.createdAt);
      
      const dateFromFilter = !filterDateFrom || leadCreatedDate >= startOfDay(new Date(filterDateFrom));
      const dateToFilter = !filterDateTo || leadCreatedDate <= endOfDay(new Date(filterDateTo));
      
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
        
        console.log(`Column filter check - Column: ${column}, Selected values:`, selectedValues);
        
        // Check if this is a date column and handle date ranges
        const isDateColumn = column === 'createdAt' || column === 'updatedAt' || column === 'nextFollowUp' || column === 'lastInteraction';
        if (isDateColumn) {
          console.log(`Applying date filter for column ${column} with values:`, selectedValues);
          const result = applyDateRangeFilter(lead, column, selectedValues);
          console.log(`Date filter result for lead ${lead.name}: ${result}`);
          return result;
        }
        
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
