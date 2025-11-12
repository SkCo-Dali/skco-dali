import React, { useState, useMemo } from "react";
import { Commission, PRODUCT_TYPE_LABELS } from "@/data/commissions";
import { CommissionCategory } from "@/components/CommissionsCategorySlicer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Filter, Calendar, ArrowUpDown } from "lucide-react";
import { useCommissionsPagination } from "@/hooks/useCommissionsPagination";
import { CommissionsPagination } from "@/components/CommissionsPagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Tipo extendido con campos adicionales para la vista gerencial
type EnrichedCommission = Commission & {
  contratoLargo: string;
  canalDescripcion: string;
  reglaNegocio: string;
  idTercero: string;
};

interface InfoGerencialTableProps {
  commissions: Commission[];
  selectedCategory: CommissionCategory;
}

// Función para generar datos mock adicionales para los campos nuevos
const enrichCommissionData = (commission: Commission): EnrichedCommission => ({
  ...commission,
  contratoLargo: `CTR-${commission.policyNumber}-${Math.floor(Math.random() * 1000)}`,
  canalDescripcion: ["Canal Digital", "Canal Presencial", "Canal Telefónico", "Canal Mixto"][Math.floor(Math.random() * 4)],
  reglaNegocio: ["RN-001 Comisión Estándar", "RN-002 Comisión Premium", "RN-003 Comisión Especial", "RN-004 Comisión Renovación"][Math.floor(Math.random() * 4)],
  idTercero: `T-${Math.floor(Math.random() * 100000)}`,
});

export function InfoGerencialTable({ commissions, selectedCategory }: InfoGerencialTableProps) {
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterCanal, setFilterCanal] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Enriquecer datos con campos adicionales
  const enrichedCommissions = useMemo<EnrichedCommission[]>(
    () => commissions.map(enrichCommissionData),
    [commissions]
  );

  // Filtrar comisiones por categoría primero
  const filteredByCategory = useMemo<EnrichedCommission[]>(() => {
    if (selectedCategory === "all") return enrichedCommissions;

    const categoryMap: Record<CommissionCategory, Commission["productType"][]> = {
      pensiones: ["pensiones"],
      fiduciaria: ["patrimonio", "ahorro"],
      seguros: ["seguros", "enfermedades"],
      all: [],
    };

    const allowedTypes = categoryMap[selectedCategory];
    return enrichedCommissions.filter((c) => allowedTypes.includes(c.productType));
  }, [enrichedCommissions, selectedCategory]);

  // Filtrar comisiones con otros filtros
  const filteredCommissions = useMemo<EnrichedCommission[]>(() => {
    return filteredByCategory.filter((commission) => {
      const matchesProduct = filterProduct === "all" || commission.productType === filterProduct;
      const matchesCanal = filterCanal === "all" || commission.canalDescripcion === filterCanal;
      const matchesSearch =
        searchTerm === "" ||
        commission.contratoLargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.canalDescripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.reglaNegocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.idTercero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        PRODUCT_TYPE_LABELS[commission.productType].toLowerCase().includes(searchTerm.toLowerCase());

      return matchesProduct && matchesCanal && matchesSearch;
    });
  }, [filteredByCategory, filterProduct, filterCanal, searchTerm]);

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
      "Producto",
      "Contrato Largo",
      "Canal Descripción",
      "Regla de Negocio",
      "Valor Comisión",
      "ID Tercero",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredCommissions.map((commission) =>
        [
          PRODUCT_TYPE_LABELS[commission.productType],
          commission.contratoLargo,
          commission.canalDescripcion,
          commission.reglaNegocio,
          commission.commissionValue,
          commission.idTercero,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "info_gerencial_comisiones.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Obtener opciones únicas para filtros
  const productOptions = Array.from(new Set(enrichedCommissions.map((c) => c.productType)));
  const canalOptions = Array.from(new Set(enrichedCommissions.map((c) => c.canalDescripcion)));

  return (
    <div className="border rounded-b-md mt-0 mb-2 p-4">
      <div className="w-full space-y-4 bg-[#fafafa] rounded-lg p-4">
        {/* Barra de búsqueda y controles */}
        <div className="flex flex-wrap items-center gap-3 pb-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Input
                placeholder="Busca por producto, contrato, canal, regla, ID tercero..."
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
            <div className="flex flex-wrap gap-3 bg-muted/50 p-4 rounded-lg border w-full">
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

              <Select value={filterCanal} onValueChange={setFilterCanal}>
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Filtrar por canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los canales</SelectItem>
                  {canalOptions.map((canal) => (
                    <SelectItem key={canal} value={canal}>
                      {canal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterProduct("all");
                  setFilterCanal("all");
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
                    Producto
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    Contrato Largo
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    Canal Descripción
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    Regla de Negocio
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-right">
                  <div className="flex items-center justify-end gap-1">
                    Valor Comisión
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    ID Tercero
                    <ArrowUpDown className="h-3 w-3 text-[#00C73D]" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(paginatedCommissions as EnrichedCommission[]).map((commission, index) => (
                <TableRow key={commission.id} className={index % 2 === 0 ? "bg-[#FFFEF0]" : "bg-background"}>
                  <TableCell className="font-medium">{PRODUCT_TYPE_LABELS[commission.productType]}</TableCell>
                  <TableCell className="font-mono text-sm">{commission.contratoLargo}</TableCell>
                  <TableCell>{commission.canalDescripcion}</TableCell>
                  <TableCell className="text-sm">{commission.reglaNegocio}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${commission.commissionValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{commission.idTercero}</TableCell>
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
