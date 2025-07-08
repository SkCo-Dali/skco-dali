
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
    <div className="w-full overflow-hidden">
      <style>{`
        .leads-table-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #fafafa;
          border-radius: 8px;
        }
        .leads-table-scroll {
          overflow-x: auto;
          overflow-y: visible;
          position: relative;
        }
        .leads-table-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .leads-table-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .leads-table-scroll::-webkit-scrollbar-thumb {
          background: #00c83c;
          border-radius: 4px;
        }
        .leads-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #00b835;
        }
        .name-column-fixed {
          position: sticky;
          left: 0;
          z-index: 20;
          background: white;
          box-shadow: 2px 0 4px rgba(0,0,0,0.1);
        }
        .table-inner {
          min-width: fit-content;
        }
      `}</style>

      <div className="leads-table-container">
        <div className="leads-table-scroll">
          <Table className="table-inner">
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow className="bg-gray-100 border-b border-gray-100">
                {visibleColumns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={`cursor-pointer select-none px-4 py-3 text-center text-xs font-medium text-gray-600 capitalize tracking-wider ${
                      column.key === 'name' ? 'name-column-fixed' : ''
                    }`}
                    style={{ 
                      minWidth: column.key === 'name' ? '250px' : '150px',
                      width: column.key === 'name' ? '250px' : '150px'
                    }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center">
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
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={column.key} 
                      className={`px-4 py-3 text-xs ${
                        column.key === 'name' ? 'name-column-fixed' : ''
                      }`}
                      style={{ 
                        minWidth: column.key === 'name' ? '250px' : '150px',
                        width: column.key === 'name' ? '250px' : '150px'
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
  );
}
