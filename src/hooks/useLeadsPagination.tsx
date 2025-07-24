
import { useState, useEffect, useMemo } from 'react';
import { Lead } from '@/types/crm';

export const useLeadsPagination = (leads: Lead[], initialLeadsPerPage: number = 50) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(initialLeadsPerPage);

  // Resetear a la primera página cuando cambien los leads
  useEffect(() => {
    setCurrentPage(1);
  }, [leads.length]);

  // Resetear a la primera página cuando cambie la cantidad por página
  useEffect(() => {
    setCurrentPage(1);
  }, [leadsPerPage]);

  const totalPages = Math.ceil(leads.length / leadsPerPage);

  // Asegurar que la página actual esté dentro del rango válido
  const validCurrentPage = useMemo(() => {
    if (totalPages === 0) return 1;
    return Math.min(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * leadsPerPage;
    const endIndex = startIndex + leadsPerPage;
    return leads.slice(startIndex, endIndex);
  }, [leads, validCurrentPage, leadsPerPage]);

  // Función para cambiar de página con validación
  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  return {
    currentPage: validCurrentPage,
    setCurrentPage: handlePageChange,
    paginatedLeads,
    totalPages,
    totalLeads: leads.length,
    leadsPerPage,
    setLeadsPerPage
  };
};
