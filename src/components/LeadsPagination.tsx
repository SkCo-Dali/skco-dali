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
  onLeadsPerPageChange,
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
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Calcular rango de resultados mostrados
  const startResult = (currentPage - 1) * leadsPerPage + 1;
  const endResult = Math.min(currentPage * leadsPerPage, totalLeads);

  return (
    <div className="w-full bg-white border-t">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 sm:px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Mostrar:</span>
            <Select value={leadsPerPage.toString()} onValueChange={(value) => onLeadsPerPageChange(Number(value))}>
              <SelectTrigger className="w-16 sm:w-20 h-7 sm:h-8 bg-white border border-gray-300 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
            Resultado {startResult} - {endResult} de {totalLeads}
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-0.5 sm:gap-1 w-full sm:w-auto justify-center sm:justify-end">
            <button
              className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#00C73D] text-white hover:bg-[#00b835]"
              }`}
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            {generatePageNumbers().map((page, index) => (
              <div key={index}>
                {page === "ellipsis" ? (
                  <span className="px-1 sm:px-2 py-1 text-[#3f3f3f] text-xs">...</span>
                ) : (
                  <button
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs font-medium ${
                      currentPage === page ? "text-[#00C73D]" : "text-[#3f3f3f] hover:text-[#00C73D]"
                    }`}
                    onClick={() => onPageChange(page as number)}
                  >
                    {page}
                  </button>
                )}
              </div>
            ))}

            <button
              className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#00C73D] text-white hover:bg-[#00b835]"
              }`}
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
