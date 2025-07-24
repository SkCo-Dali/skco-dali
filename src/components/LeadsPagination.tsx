
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalLeads: number;
  leadsPerPage: number;
  onPageChange: (page: number) => void;
  onLeadsPerPageChange: (leadsPerPage: number) => void;
}

export function LeadsPagination({ 
  currentPage, 
  totalPages, 
  totalLeads, 
  leadsPerPage, 
  onPageChange,
  onLeadsPerPageChange 
}: LeadsPaginationProps) {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Calcular rango de resultados mostrados
  const startResult = totalLeads === 0 ? 0 : (currentPage - 1) * leadsPerPage + 1;
  const endResult = Math.min(currentPage * leadsPerPage, totalLeads);

  // Manejar cambio de página
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Manejar cambio en leads por página
  const handleLeadsPerPageChange = (value: string) => {
    const newLeadsPerPage = Number(value);
    if (newLeadsPerPage !== leadsPerPage) {
      onLeadsPerPageChange(newLeadsPerPage);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar:</span>
          <Select 
            value={leadsPerPage.toString()} 
            onValueChange={handleLeadsPerPageChange}
          >
            <SelectTrigger className="w-20 h-8 bg-white border border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <span className="text-sm text-gray-600">
          {totalLeads > 0 ? `Resultado ${startResult} - ${endResult} de ${totalLeads}` : 'Sin resultados'}
        </span>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentPage === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-[#00c83c] text-white hover:bg-[#00b835] cursor-pointer'
            }`}
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {generatePageNumbers().map((page, index) => (
            <div key={index}>
              {page === 'ellipsis' ? (
                <span className="px-2 py-1 text-gray-500">...</span>
              ) : (
                <button
                  className={`w-8 h-8 text-sm font-medium rounded transition-colors ${
                    currentPage === page
                      ? 'bg-[#00c83c] text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#00c83c]'
                  }`}
                  onClick={() => handlePageClick(page as number)}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
          
          <button
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentPage === totalPages 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-[#00c83c] text-white hover:bg-[#00b835] cursor-pointer'
            }`}
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
