import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProviders } from "@/core/di/providers";
import { useAdvisorStore } from "../store/advisorStore";
import type { Advisor } from "@/core/api/dto";

export const AdvisorsHome = () => {
  const navigate = useNavigate();
  const { advisors: advisorProvider } = useProviders();
  const { advisors, setAdvisors, filters, setFilters, isLoading, setIsLoading } =
    useAdvisorStore();

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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ficha 360° de Asesores</h1>
            <p className="text-sm text-muted-foreground">
              Gestión integral de asesores y desempeño
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
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
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Región</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead>Jefe</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : advisors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No se encontraron asesores
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  advisors.map((advisor) => (
                    <TableRow
                      key={advisor.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(advisor)}
                    >
                      <TableCell className="font-medium">{advisor.id}</TableCell>
                      <TableCell>{advisor.doc}</TableCell>
                      <TableCell>{advisor.nombre}</TableCell>
                      <TableCell>{advisor.region}</TableCell>
                      <TableCell>{advisor.zona}</TableCell>
                      <TableCell>{advisor.jefe || "-"}</TableCell>
                      <TableCell>{advisor.canal || "-"}</TableCell>
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
