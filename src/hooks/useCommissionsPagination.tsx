import { useState, useEffect, useMemo } from 'react';
import { Commission } from '@/data/commissions';

export const useCommissionsPagination = (commissions: Commission[], initialItemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [commissions.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const totalPages = Math.ceil(commissions.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCommissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return commissions.slice(startIndex, endIndex);
  }, [commissions, currentPage, itemsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    paginatedCommissions,
    totalPages,
    totalCommissions: commissions.length,
    itemsPerPage,
    setItemsPerPage
  };
};
