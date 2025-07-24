
import { useState, useEffect, useMemo } from 'react';
import { Lead } from '@/types/crm';

export const useLeadsPagination = (leads: Lead[], initialLeadsPerPage: number = 50) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(initialLeadsPerPage);

  // Resetear a la primera página cuando cambien los leads o la cantidad por página
  useEffect(() => {
    setCurrentPage(1);
  }, [leads]);

  // Resetear a la primera página cuando cambie la cantidad por página
  useEffect(() => {
    setCurrentPage(1);
  }, [leadsPerPage]);

  const totalPages = Math.ceil(leads.length / leadsPerPage);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * leadsPerPage;
    const endIndex = startIndex + leadsPerPage;
    return leads.slice(startIndex, endIndex);
  }, [leads, currentPage, leadsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    paginatedLeads,
    totalPages,
    totalLeads: leads.length,
    leadsPerPage,
    setLeadsPerPage
  };
};
