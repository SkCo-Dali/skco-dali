
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from './ui/button';

interface DataTableProps {
  data: Array<Record<string, any>> | {
    headers: string[];
    rows: (string | number)[][];
  };
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const tableData = React.useMemo(() => {
    if (Array.isArray(data)) {
      if (data.length === 0) return { headers: [], rows: [] };
      
      // Verificar si es un array de objetos (formato original esperado)
      if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
        const headers = Object.keys(data[0]);
        const rows = data.map(item => headers.map(header => item[header]));
        return { headers, rows };
      }
    }
    
    // Si ya tiene el formato { headers: [], rows: [] }, lo devolvemos tal como está
    if (data && typeof data === 'object' && 'headers' in data && 'rows' in data) {
      return data;
    }
    
    console.error('DataTable - Unknown data format:', data);
    return { headers: [], rows: [] };
  }, [data]);

  const totalPages = Math.ceil(tableData.rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = tableData.rows.slice(startIndex, endIndex);

  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const exportToCSV = () => {
    const csvContent = [
      tableData.headers.join(','),
      ...tableData.rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'tabla_datos.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="data-table-container">
      {/* Header con título y botón de descarga */}
      <div className="data-table-header">
        <span className="data-table-title">
          Tabla con {tableData.rows.length} filas y {tableData.headers.length} columnas
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={exportToCSV}
          className="data-table-export-btn"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Contenedor de la tabla con scroll */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead className="data-table-head">
            <tr>
              {tableData.headers.map((header, index) => (
                <th key={index} className="data-table-header-cell">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, rowIndex) => (
              <tr key={startIndex + rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="data-table-cell">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación si hay muchas filas */}
      {totalPages > 1 && (
        <div className="data-table-pagination">
          <span className="data-table-pagination-info">
            Mostrando {startIndex + 1}-{Math.min(endIndex, tableData.rows.length)} de {tableData.rows.length} filas
          </span>
          <div className="data-table-pagination-controls">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="data-table-pagination-current">
              {currentPage} de {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
