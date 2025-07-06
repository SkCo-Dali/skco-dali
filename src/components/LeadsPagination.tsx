
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
  const startResult = (currentPage - 1) * leadsPerPage + 1;
  const endResult = Math.min(currentPage * leadsPerPage, totalLeads);

  return (
    <div className="flex items-center justify-between p-4 bg-white border-t">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar:</span>
          <Select 
            value={leadsPerPage.toString()} 
            onValueChange={(value) => onLeadsPerPageChange(Number(value))}
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
          Resultado {startResult} - {endResult} de {totalLeads}
        </span>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            className={`flex items-center justify-center w-8 h-8 rounded border ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
            }`}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
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
                  className={`w-8 h-8 rounded border text-sm ${
                    currentPage === page
                      ? 'bg-[#00c83c] text-white border-[#00c83c]'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
                  }`}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
          
          <button
            className={`flex items-center justify-center w-8 h-8 rounded border ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
            }`}
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
