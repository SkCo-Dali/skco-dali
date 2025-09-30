
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, FileBarChart } from "lucide-react";

interface PowerBIReport {
  id: string;
  name: string;
  description?: string;
  embedUrl: string;
  isAssigned: boolean;
}

interface InformesTableProps {
  reports: PowerBIReport[];
  onReportSelect: (report: PowerBIReport) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export function InformesTable({ reports, onReportSelect }: InformesTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
  };

  const getSortedReports = () => {
    if (!sortConfig) return reports;

    return [...reports].sort((a, b) => {
      const { key, direction } = sortConfig;
      let aValue: any;
      let bValue: any;

      switch (key) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'description':
          aValue = (a.description || '').toLowerCase();
          bValue = (b.description || '').toLowerCase();
          break;
        case 'status':
          aValue = a.isAssigned ? 'asignado' : 'no asignado';
          bValue = b.isAssigned ? 'asignado' : 'no asignado';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedReports = getSortedReports();

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
    <div className="border rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Nombre del Informe
                {renderSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('description')}
            >
              <div className="flex items-center">
                Descripción
                {renderSortIcon('description')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                Estado
                {renderSortIcon('status')}
              </div>
            </TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReports.map((report) => (
            <TableRow 
              key={report.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onReportSelect(report)}
            >
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#00C73D]/10 rounded-xl">
                    <FileBarChart className="h-4 w-4 text-[#00C73D]" />
                  </div>
                  <div className="font-medium">{report.name}</div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {report.description || 'Informe de Power BI'}
                </span>
              </TableCell>
              <TableCell>
                {report.isAssigned ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Asignado
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    No asignado
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  className="bg-[#00C73D] hover:bg-[#00C73D]/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReportSelect(report);
                  }}
                >
                  Ver Informe
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
