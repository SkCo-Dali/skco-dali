import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { LeadsTableProps, defaultColumns } from "./leads-table/types";
import { useLeadsTableSort } from "./leads-table/useLeadsTableSort";
import { LeadTableCell } from "./leads-table/LeadTableCell";

export function LeadsTable({ 
  leads, 
  paginatedLeads, 
  onLeadClick, 
  onLeadUpdate, 
  columns = defaultColumns, 
  onSortedLeadsChange 
}: LeadsTableProps) {
  const visibleColumns = columns.filter(col => col.visible);
  const { sortConfig, handleSort } = useLeadsTableSort(leads, onSortedLeadsChange);

  const renderSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="w-full">
      {/* Container principal con scroll horizontal */}
      <div className="relative w-full border rounded-lg bg-white">
        <div 
          className="overflow-x-auto overflow-y-visible"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#00c83c #f1f1f1'
          }}
        >
          <style>{`
            .table-scroll-container::-webkit-scrollbar {
              height: 12px;
            }
            .table-scroll-container::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 6px;
            }
            .table-scroll-container::-webkit-scrollbar-thumb {
              background: #00c83c;
              border-radius: 6px;
            }
            .table-scroll-container::-webkit-scrollbar-thumb:hover {
              background: #00b835;
            }
          `}</style>
          
          <div className="table-scroll-container">
            <Table className="relative">
              <TableHeader className="sticky top-0 z-10 bg-white border-b">
                <TableRow className="bg-gray-50">
                  {visibleColumns.map((column, index) => (
                    <TableHead 
                      key={column.key}
                      className={`
                        cursor-pointer select-none px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap
                        ${column.key === 'name' 
                          ? 'sticky left-0 z-20 bg-gray-50 shadow-[2px_0_4px_rgba(0,0,0,0.1)]' 
                          : ''
                        }
                      `}
                      style={{ 
                        minWidth: column.key === 'name' ? '200px' : '120px',
                        width: column.key === 'name' ? '200px' : '120px'
                      }}
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center justify-center">
                        {column.label}
                        {renderSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {paginatedLeads.map((lead) => (
                  <TableRow 
                    key={lead.id}
                    className="hover:bg-gray-50 transition-colors border-b"
                  >
                    {visibleColumns.map((column) => (
                      <TableCell 
                        key={column.key} 
                        className={`
                          px-4 py-3 text-xs whitespace-nowrap
                          ${column.key === 'name' 
                            ? 'sticky left-0 z-10 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.05)]' 
                            : ''
                          }
                        `}
                        style={{ 
                          minWidth: column.key === 'name' ? '200px' : '120px',
                          width: column.key === 'name' ? '200px' : '120px'
                        }}
                      >
                        <LeadTableCell
                          lead={lead}
                          columnKey={column.key}
                          onLeadClick={onLeadClick}
                          onLeadUpdate={onLeadUpdate}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
