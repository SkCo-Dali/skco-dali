import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProviders } from "@/core/di/providers";
import { useAdvisorStore } from "../store/advisorStore";
import type { Advisor } from "@/core/api/dto";

export const AdvisorsHome = () => {
  const navigate = useNavigate();
  const { advisors: advisorProvider } = useProviders();
  const { advisors, setAdvisors, filters, setFilters, isLoading, setIsLoading } = useAdvisorStore();

  const [searchTerm, setSearchTerm] = useState(filters.q || "");
  const [selectedRegion, setSelectedRegion] = useState(filters.region || "");
  const [selectedZona, setSelectedZona] = useState(filters.zona || "");

  useEffect(() => {
    loadAdvisors();
  }, [filters]);

  const loadAdvisors = async () => {
    setIsLoading(true);
    try {
      const result = await advisorProvider.getAdvisors(filters);
      setAdvisors(result.items);
    } catch (error) {
      console.error("Error loading advisors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({
      q: searchTerm,
      region: selectedRegion || undefined,
      zona: selectedZona || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedRegion("");
    setSelectedZona("");
    setFilters({});
  };

  const handleRowClick = (advisor: Advisor) => {
    navigate(`/ficha-360/${advisor.id}`);
  };

  const getEstadoBadge = (estado?: string) => {
    if (estado === "activo") {
      return <Badge variant="default">Activo</Badge>;
    }
    return <Badge variant="secondary">Inactivo</Badge>;
  };

  return (
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-primary">Ficha 360° de Asesores</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gestión integral de asesores y desempeño</p>
        </div>
      </div>

      {/* Filters Card */}

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por nombre, documento o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full"
            />
          </div>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Región" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Andina">Andina</SelectItem>
              <SelectItem value="Pacífico">Pacífico</SelectItem>
              <SelectItem value="Caribe">Caribe</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedZona} onValueChange={setSelectedZona}>
            <SelectTrigger>
              <SelectValue placeholder="Zona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Centro">Centro</SelectItem>
              <SelectItem value="Norte">Norte</SelectItem>
              <SelectItem value="Occidente">Occidente</SelectItem>
              <SelectItem value="Costa">Costa</SelectItem>
              <SelectItem value="Sur">Sur</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpiar filtros
          </Button>
        </div>
      </CardContent>

      {/* Table */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/40">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Documento</TableHead>
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Región</TableHead>
                  <TableHead className="font-semibold">Zona</TableHead>
                  <TableHead className="font-semibold">Jefe</TableHead>
                  <TableHead className="font-semibold">Canal</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : advisors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground font-medium">No se encontraron asesores</p>
                        <p className="text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  advisors.map((advisor) => (
                    <TableRow
                      key={advisor.id}
                      className="p-2 cursor-pointer hover:bg-primary/5 transition-colors border-b border-border/30"
                      onClick={() => handleRowClick(advisor)}
                    >
                      <TableCell className="font-medium text-primary">{advisor.id}</TableCell>
                      <TableCell className="text-foreground">{advisor.doc}</TableCell>
                      <TableCell className="font-medium text-foreground">{advisor.nombre}</TableCell>
                      <TableCell className="text-muted-foreground">{advisor.region}</TableCell>
                      <TableCell className="text-muted-foreground">{advisor.zona}</TableCell>
                      <TableCell className="text-muted-foreground">{advisor.jefe || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{advisor.canal || "-"}</TableCell>
                      <TableCell>{getEstadoBadge(advisor.estado)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
