import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommissionsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCommissions: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function CommissionsPagination({ 
  currentPage, 
  totalPages, 
  totalCommissions, 
  itemsPerPage, 
  onPageChange,
  onItemsPerPageChange 
}: CommissionsPaginationProps) {
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

  const startResult = (currentPage - 1) * itemsPerPage + 1;
  const endResult = Math.min(currentPage * itemsPerPage, totalCommissions);

  return (
    <div className="flex items-center justify-between p-4 bg-background border-t">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mostrar:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-20 h-8 bg-background border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <span className="text-sm text-muted-foreground">
          Resultado {startResult} - {endResult} de {totalCommissions}
        </span>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            className={`flex items-center justify-center w-6 h-6 rounded-full ${
              currentPage === 1 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-[#00C73D] text-white hover:bg-[#00b835]'
            }`}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {generatePageNumbers().map((page, index) => (
            <div key={index}>
              {page === 'ellipsis' ? (
                <span className="px-2 py-1 text-foreground">...</span>
              ) : (
                <button
                  className={`w-6 h-6 text-xs font-medium ${
                    currentPage === page
                      ? 'text-[#00C73D]'
                      : 'text-foreground hover:text-[#00C73D]'
                  }`}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
          
          <button
            className={`flex items-center justify-center w-6 h-6 rounded-full ${
              currentPage === totalPages 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-[#00C73D] text-white hover:bg-[#00b835]'
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
