import React, { useState, useMemo } from "react";
import { Commission, PRODUCT_TYPE_LABELS, COMMISSION_TYPE_LABELS } from "@/data/commissions";
import { CommissionCategory } from "@/components/CommissionsCategorySlicer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Filter, Search, ArrowUpDown, Calendar } from "lucide-react";
import { useCommissionsPagination } from "@/hooks/useCommissionsPagination";
import { CommissionsPagination } from "@/components/CommissionsPagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CommissionsTableProps {
  commissions: Commission[];
  selectedCategory: CommissionCategory;
}

export function CommissionsTable({ commissions, selectedCategory }: CommissionsTableProps) {
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterCommissionType, setFilterCommissionType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar comisiones por categoría primero
  const filteredByCategory = useMemo(() => {
    if (selectedCategory === "all") return commissions;

    const categoryMap: Record<CommissionCategory, Commission["productType"][]> = {
      pensiones: ["pensiones"],
      fiduciaria: ["patrimonio", "ahorro"],
      seguros: ["seguros", "enfermedades"],
      all: [],
    };

    const allowedTypes = categoryMap[selectedCategory];
    return commissions.filter((c) => allowedTypes.includes(c.productType));
  }, [commissions, selectedCategory]);

  // Filtrar comisiones con otros filtros
  const filteredCommissions = useMemo(() => {
    return filteredByCategory.filter((commission) => {
      const matchesProduct = filterProduct === "all" || commission.productType === filterProduct;
      const matchesCommissionType =
        filterCommissionType === "all" || commission.commissionType === filterCommissionType;
      const matchesSearch =
        searchTerm === "" ||
        commission.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        PRODUCT_TYPE_LABELS[commission.productType].toLowerCase().includes(searchTerm.toLowerCase());

      return matchesProduct && matchesCommissionType && matchesSearch;
    });
  }, [filteredByCategory, filterProduct, filterCommissionType, searchTerm]);

  // Usar hook de paginación
  const {
    currentPage,
    setCurrentPage,
    paginatedCommissions,
    totalPages,
    totalCommissions,
    itemsPerPage,
    setItemsPerPage,
  } = useCommissionsPagination(filteredCommissions, 10);

  // Calcular período de las comisiones mostradas
  const periodRange = useMemo(() => {
    if (filteredCommissions.length === 0) return "";
    const dates = filteredCommissions.map((c) => new Date(c.period));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    return `${minDate.toLocaleDateString("es-ES")} - ${maxDate.toLocaleDateString("es-ES")}`;
  }, [filteredCommissions]);

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      "Cliente",
      "No. Póliza/Contrato",
      "Producto",
      "Tipo de comisión",
      "Valor comisión",
      "Asesor",
      "Período",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredCommissions.map((commission) =>
        [
          commission.clientName,
          commission.policyNumber,
          PRODUCT_TYPE_LABELS[commission.productType],
          COMMISSION_TYPE_LABELS[commission.commissionType],
          commission.commissionValue,
          commission.agentName,
          commission.period,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comisiones.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Obtener opciones únicas para filtros
  const productOptions = Array.from(new Set(commissions.map((c) => c.productType)));
  const commissionTypeOptions = Array.from(new Set(commissions.map((c) => c.commissionType)));

  return (
    <div className="border rounded-b-md mt-0 mb-2 pb-2 px-2">
      <div className="w-full space-y-4 bg-[#fafafa] rounded-lg p-4">
        {/* Barra de búsqueda y controles */}
        <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Input
                placeholder="Busca por cliente, póliza, asesor, producto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", "hover:bg-accent")}>
                <Calendar className="mr-2 h-4 w-4" />
                Selecciona fecha
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="text-sm text-muted-foreground">Filtro de fecha próximamente</div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filtra
          </Button>

          <Button
            onClick={handleExportCSV}
            size="icon"
            className="bg-[#00C73D] hover:bg-[#00b835] text-white rounded-full h-10 w-10"
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 bg-muted/50 p-4 rounded-lg border">
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Filtrar por producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {productOptions.map((product) => (
                    <SelectItem key={product} value={product}>
                      {PRODUCT_TYPE_LABELS[product]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCommissionType} onValueChange={setFilterCommissionType}>
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Tipo de comisión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {commissionTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {COMMISSION_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterProduct("all");
                  setFilterCommissionType("all");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Período */}
        {periodRange && <div className="text-sm font-medium px-4">Periodo: {periodRange}</div>}

        {/* Tabla */}
        <div className="rounded-lg border bg-background overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    Cliente
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    No. Póliza/Contrato
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    Producto
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    Tipo de comisión
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-right">
                  <div className="flex items-center justify-end gap-1">
                    Valor comisión
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    Asesor
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    Periodo
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCommissions.map((commission, index) => (
                <TableRow key={commission.id} className={index % 2 === 0 ? "bg-[#FFFEF0]" : "bg-background"}>
                  <TableCell className="font-medium">{commission.clientName}</TableCell>
                  <TableCell className="font-mono text-sm">{commission.policyNumber}</TableCell>
                  <TableCell>{PRODUCT_TYPE_LABELS[commission.productType]}</TableCell>
                  <TableCell className="text-sm">{COMMISSION_TYPE_LABELS[commission.commissionType]}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${commission.commissionValue.toLocaleString()}
                  </TableCell>
                  <TableCell>{commission.agentName}</TableCell>
                  <TableCell>{commission.period}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginación integrada */}
          <CommissionsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCommissions={totalCommissions}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
