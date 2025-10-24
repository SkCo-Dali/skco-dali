import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UsersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  usersPerPage: number;
  onPageChange: (page: number) => void;
  onUsersPerPageChange: (usersPerPage: number) => void;
}

export function UsersPagination({ 
  currentPage, 
  totalPages, 
  totalUsers, 
  usersPerPage, 
  onPageChange,
  onUsersPerPageChange 
}: UsersPaginationProps) {
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
  const startResult = (currentPage - 1) * usersPerPage + 1;
  const endResult = Math.min(currentPage * usersPerPage, totalUsers);

  return (
    <div className="flex items-center justify-between p-4 bg-card border-t">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mostrar:</span>
          <Select 
            value={usersPerPage.toString()} 
            onValueChange={(value) => onUsersPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <span className="text-sm text-muted-foreground">
          Resultado {startResult} - {endResult} de {totalUsers}
        </span>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              currentPage === 1 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {generatePageNumbers().map((page, index) => (
            <div key={index}>
              {page === 'ellipsis' ? (
                <span className="px-2 py-1 text-muted-foreground">...</span>
              ) : (
                <button
                  className={`w-8 h-8 text-sm font-medium rounded-full transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
          
          <button
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              currentPage === totalPages 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
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
