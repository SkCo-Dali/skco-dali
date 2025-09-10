import React, { useState, useMemo } from "react";
import { Commission, PRODUCT_TYPE_LABELS, COMMISSION_TYPE_LABELS } from "@/data/commissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search } from "lucide-react";

interface CommissionsTableProps {
  commissions: Commission[];
}

export function CommissionsTable({ commissions }: CommissionsTableProps) {
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterCommissionType, setFilterCommissionType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar comisiones
  const filteredCommissions = useMemo(() => {
    return commissions.filter(commission => {
      const matchesProduct = filterProduct === "all" || commission.productType === filterProduct;
      const matchesCommissionType = filterCommissionType === "all" || commission.commissionType === filterCommissionType;
      const matchesSearch = searchTerm === "" || 
        commission.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesProduct && matchesCommissionType && matchesSearch;
    });
  }, [commissions, filterProduct, filterCommissionType, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);
  const paginatedCommissions = filteredCommissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = ['Cliente', 'No. Póliza', 'Producto', 'Tipo', 'Valor Comisión', 'Período'];
    const csvContent = [
      headers.join(','),
      ...filteredCommissions.map(commission => [
        commission.clientName,
        commission.policyNumber,
        PRODUCT_TYPE_LABELS[commission.productType],
        COMMISSION_TYPE_LABELS[commission.commissionType],
        commission.commissionValue,
        commission.period
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comisiones.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Obtener opciones únicas para filtros
  const productOptions = Array.from(new Set(commissions.map(c => c.productType)));
  const commissionTypeOptions = Array.from(new Set(commissions.map(c => c.commissionType)));

  const getBadgeVariant = (productType: Commission['productType']) => {
    const variants = {
      'patrimonio': 'default',
      'ahorro': 'secondary',
      'seguros': 'destructive',
      'enfermedades': 'outline',
      'pensiones': 'secondary'
    } as const;
    return variants[productType] || 'default';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">
            Detalle de las Comisiones
          </CardTitle>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por cliente o póliza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterProduct} onValueChange={setFilterProduct}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los productos</SelectItem>
              {productOptions.map(product => (
                <SelectItem key={product} value={product}>
                  {PRODUCT_TYPE_LABELS[product]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterCommissionType} onValueChange={setFilterCommissionType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Tipo de comisión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {commissionTypeOptions.map(type => (
                <SelectItem key={type} value={type}>
                  {COMMISSION_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>No. Póliza</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor Comisión</TableHead>
                <TableHead>Período</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">
                    {commission.clientName}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {commission.policyNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(commission.productType)}>
                      {PRODUCT_TYPE_LABELS[commission.productType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {COMMISSION_TYPE_LABELS[commission.commissionType]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${commission.commissionValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {commission.period}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredCommissions.length)} de {filteredCommissions.length} comisiones
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}