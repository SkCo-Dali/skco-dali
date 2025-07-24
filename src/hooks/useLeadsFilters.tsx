import { useState, useMemo } from "react";
import { Lead } from "@/types/crm";

export function useLeadsFilters(leads: Lead[]) {
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
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});

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

      // Filtros de fecha
      const dateFromFilter = !filterDateFrom || new Date(lead.createdAt) >= new Date(filterDateFrom);
      const dateToFilter = !filterDateTo || new Date(lead.createdAt) <= new Date(filterDateTo);
      
      // Filtros de valor
      const valueMinFilter = !filterValueMin || lead.value >= parseInt(filterValueMin);
      const valueMaxFilter = !filterValueMax || lead.value <= parseInt(filterValueMax);

      // Filtro de duplicados - verificar email, teléfono o documento
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

      // Aplicar filtros por columna
      const columnFiltersMatch = Object.entries(columnFilters).every(([column, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        
        const leadValue = lead[column as keyof Lead];
        const stringValue = leadValue === null || leadValue === undefined ? "" : String(leadValue);
        
        return selectedValues.includes(stringValue);
      });

      return (
        matchesSearch &&
        matchesMultiFilter(filterStage, lead.stage) &&
        matchesMultiFilter(filterPriority, lead.priority) &&
        matchesMultiFilter(filterAssignedTo, lead.assignedTo) &&
        matchesMultiFilter(filterSource, lead.source) &&
        matchesMultiFilter(filterCampaign, lead.campaign || "") &&
        dateFromFilter &&
        dateToFilter &&
        valueMinFilter &&
        valueMaxFilter &&
        duplicatesFilter() &&
        columnFiltersMatch
      );
    });
  }, [leads, searchTerm, filterStage, filterPriority, filterAssignedTo, filterSource, filterCampaign, filterDateFrom, filterDateTo, filterValueMin, filterValueMax, filterDuplicates, duplicateIdentifiers, columnFilters]);

  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "value":
          return b.value - a.value;
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [filteredLeads, sortBy]);

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

  const clearFilters = () => {
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

  // Contar leads duplicados - solo calculamos cuando se necesita
  const duplicateCount = useMemo(() => {
    if (filterDuplicates === "all") return 0; // No necesario calcularlo si no se usa
    
    return leads.filter(lead => 
      (lead.email && duplicateIdentifiers.emails.includes(lead.email.toLowerCase())) ||
      (lead.phone && duplicateIdentifiers.phones.includes(lead.phone.replace(/[\s\-\(\)]/g, ''))) ||
      (lead.documentNumber && duplicateIdentifiers.documents.includes(lead.documentNumber.toString()))
    ).length;
  }, [leads, duplicateIdentifiers, filterDuplicates]);

  return {
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
    filteredLeads: sortedLeads,
    clearFilters,
    uniqueStages,
    uniqueSources,
    uniqueCampaigns,
    uniqueAssignedTo,
    duplicateCount,
    columnFilters,
    handleColumnFilterChange,
    clearColumnFilter,
    clearAllColumnFilters
  };
}
