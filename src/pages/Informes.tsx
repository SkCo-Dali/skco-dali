import React, { useState, useEffect } from "react";
import { Lead, getRolePermissions } from "@/types/crm";
import ChatSami from "@/components/ChatSami";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InformesSearch } from "@/components/InformesSearch";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  FileBarChart,
  ArrowLeft,
  ExternalLink,
  Shield,
  Users,
  Settings,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useHasRole } from "@/hooks/useRequireRole";
import { powerbiService } from "@/services/powerbiService";
import { EffectiveReport, Area, Workspace } from "@/types/powerbi";
import { toast } from "@/hooks/use-toast";
import { ENV } from "@/config/environment";
import { AccessDenied } from "@/components/AccessDenied";
import { usePageAccess } from "@/hooks/usePageAccess";

// Component state types
interface InformesState {
  reports: EffectiveReport[];
  areas: Area[];
  workspaces: Workspace[];
  favorites: string[];
  loading: boolean;
  selectedReport: EffectiveReport | null;
  embedToken: string | null;
  searchTerm: string;
  selectedArea: string;
  selectedWorkspace: string;
  viewMode: "grid" | "table";
  showOnlyFavorites: boolean;
  sortColumn: "name" | "workspace" | "area" | "status" | null;
  sortDirection: "asc" | "desc";
}

export default function Informes() {
  const { hasAccess } = usePageAccess("informes");

  if (!hasAccess) {
    return <AccessDenied />;
  }

  const { user, getAccessToken } = useAuth();
  const navigate = useNavigate();
  const hasAdminRole = useHasRole("admin", "seguridad");
  const userPermissions = user ? getRolePermissions(user.role) : null;
  const [state, setState] = useState<InformesState>({
    reports: [],
    areas: [],
    workspaces: [],
    favorites: [],
    loading: true,
    selectedReport: null,
    embedToken: null,
    searchTerm: "",
    selectedArea: "",
    selectedWorkspace: "",
    viewMode: "grid",
    showOnlyFavorites: false,
    sortColumn: null,
    sortDirection: "asc",
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Get ID token for Reports APIs
      const tokenData = await getAccessToken();

      if (!tokenData?.idToken) {
        throw new Error("No ID token available");
      }

      // Build filters only when they have valid non-empty values
      const filters: {
        search?: string;
        areaId?: string;
        workspaceId?: string;
      } = {};

      if (state.searchTerm && state.searchTerm.trim()) {
        filters.search = state.searchTerm.trim();
      }
      if (state.selectedArea && state.selectedArea !== "all") {
        filters.areaId = state.selectedArea;
      }
      if (state.selectedWorkspace && state.selectedWorkspace !== "all") {
        filters.workspaceId = state.selectedWorkspace;
      }

      const [reportsData, areasData, workspacesData, favoritesData] = await Promise.all([
        powerbiService.getMyReports(filters, tokenData.idToken),
        powerbiService.getAreas({}, tokenData.idToken),
        powerbiService.getWorkspaces({}, tokenData.idToken),
        powerbiService.getFavorites({}, tokenData.idToken),
      ]);

      // Update isFavorite flag on reports
      const reportsWithFavorites = reportsData.map((report) => ({
        ...report,
        isFavorite: favoritesData.includes(report.reportId),
      }));

      setState((prev) => ({
        ...prev,
        reports: reportsWithFavorites,
        areas: areasData,
        workspaces: workspacesData,
        favorites: favoritesData,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los informes",
        variant: "destructive",
      });
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [state.searchTerm, state.selectedArea, state.selectedWorkspace]);

  // Handle report selection
  const handleReportSelect = async (report: EffectiveReport) => {
    try {
      // Get ID token for Reports APIs
      const tokenData = await getAccessToken();
      if (!tokenData?.idToken) {
        throw new Error("No ID token available");
      }

      // Check access before proceeding
      const hasAccess = await powerbiService.checkReportAccess(report.reportId, tokenData.idToken);
      if (!hasAccess) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos para ver este reporte",
          variant: "destructive",
        });
        return;
      }

      setState((prev) => ({ ...prev, selectedReport: report }));

      // Log audit event
      await powerbiService.logAudit({
        reportId: report.reportId,
        reportName: report.reportName,
        userId: user?.id || "",
        userName: user?.name,
        userEmail: user?.email,
        action: "view",
        source: "portal",
      });

      // TODO: Try to get embed token
      const embedInfo = await powerbiService.getEmbedInfo(report.reportId);
      setState((prev) => ({ ...prev, embedToken: embedInfo?.accessToken || null }));
    } catch (error) {
      console.error("Error selecting report:", error);
      toast({
        title: "Error",
        description: "Error al abrir el reporte",
        variant: "destructive",
      });
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (reportId: string) => {
    try {
      // Get ID token for Reports APIs
      const tokenData = await getAccessToken();
      if (!tokenData?.idToken) {
        throw new Error("No ID token available");
      }

      const newIsFavorite = await powerbiService.toggleFavorite(reportId, tokenData.idToken);

      setState((prev) => ({
        ...prev,
        reports: prev.reports.map((report) =>
          report.reportId === reportId ? { ...report, isFavorite: newIsFavorite } : report,
        ),
        favorites: newIsFavorite ? [...prev.favorites, reportId] : prev.favorites.filter((id) => id !== reportId),
      }));

      toast({
        title: "Éxito",
        description: newIsFavorite ? "Agregado a favoritos" : "Removido de favoritos",
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Error al actualizar favorito",
        variant: "destructive",
      });
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    setState((prev) => ({
      ...prev,
      selectedReport: null,
      embedToken: null,
    }));
  };

  // Handle search change
  const handleSearchChange = (term: string) => {
    setState((prev) => ({ ...prev, searchTerm: term }));
  };

  // Handle filter changes
  const handleAreaChange = (areaId: string) => {
    setState((prev) => ({
      ...prev,
      selectedArea: areaId === "all" ? "" : areaId,
      selectedWorkspace: "", // Reset workspace when area changes
    }));
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    setState((prev) => ({
      ...prev,
      selectedWorkspace: workspaceId === "all" ? "" : workspaceId,
    }));
  };

  const handleViewModeChange = (mode: "grid" | "table") => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  };

  const handleFavoritesFilterToggle = () => {
    setState((prev) => ({ ...prev, showOnlyFavorites: !prev.showOnlyFavorites }));
  };

  const handleSort = (column: "name" | "workspace" | "area" | "status") => {
    setState((prev) => {
      const newDirection = prev.sortColumn === column && prev.sortDirection === "asc" ? "desc" : "asc";
      return {
        ...prev,
        sortColumn: column,
        sortDirection: newDirection,
      };
    });
  };

  // Filter workspaces by selected area
  const filteredWorkspaces = state.selectedArea
    ? state.workspaces.filter((w) => w.areaId === state.selectedArea)
    : state.workspaces;

  // Get sorted and filtered reports
  const getDisplayedReports = () => {
    let filtered = [...state.reports];

    // Apply favorites filter
    if (state.showOnlyFavorites) {
      filtered = filtered.filter((report) => report.isFavorite);
    }

    // Apply sorting
    if (state.sortColumn) {
      filtered.sort((a, b) => {
        let aValue: string | boolean;
        let bValue: string | boolean;

        switch (state.sortColumn) {
          case "name":
            aValue = a.reportName.toLowerCase();
            bValue = b.reportName.toLowerCase();
            break;
          case "workspace":
            aValue = a.workspaceName.toLowerCase();
            bValue = b.workspaceName.toLowerCase();
            break;
          case "area":
            aValue = a.areaName.toLowerCase();
            bValue = b.areaName.toLowerCase();
            break;
          case "status":
            aValue = a.hasRowLevelSecurity ? "rls" : "normal";
            bValue = b.hasRowLevelSecurity ? "rls" : "normal";
            break;
          default:
            return 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return state.sortDirection === "asc" ? comparison : -comparison;
        }
        return 0;
      });
    }

    return filtered;
  };

  const displayedReports = getDisplayedReports();

  if (state.loading) {
    return (
      <div className="pt-0">
        <div className="px-4 py-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando informes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-4 pt-0 flex h-[calc(100vh-theme(spacing.16))]">
      {/* Contenido principal */}
      <div className={`flex-1 px-4 py-4  ${userPermissions?.chatSami ? "pr-0" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 tracking-tight text-primary">
              Informes Power BI
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Accede a los reportes asignados a tu perfil
              {hasAdminRole && (
                <>
                  {" "}
                  •{" "}
                  <Link to="/admin/reports" className="text-primary hover:underline">
                    Administrar reportes
                  </Link>
                </>
              )}
            </p>
          </div>

          {state.selectedReport && (
            <Button onClick={handleBackToList} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          )}
        </div>

        {!state.selectedReport ? (
          <>
            {/* Filters and Search */}
            <div className="flex flex-col space-y-4 mb-6">
              {/* Search */}
              <InformesSearch searchTerm={state.searchTerm} onSearchChange={handleSearchChange} />

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={state.selectedArea || "all"} onValueChange={handleAreaChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Todas las áreas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las áreas</SelectItem>
                    {state.areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={state.selectedWorkspace || "all"}
                  onValueChange={handleWorkspaceChange}
                  disabled={!state.selectedArea}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Todos los workspaces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los workspaces</SelectItem>
                    {filteredWorkspaces.map((workspace) => (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 ml-auto">
                  <Button
                    variant={state.showOnlyFavorites ? "default" : "outline"}
                    size="sm"
                    onClick={handleFavoritesFilterToggle}
                  >
                    <Star className={`h-4 w-4 mr-2 ${state.showOnlyFavorites ? "fill-current" : ""}`} />
                    Favoritos
                  </Button>
                  <Button
                    variant={state.viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleViewModeChange("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={state.viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleViewModeChange("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Reports Grid/Table */}
            {state.viewMode === "table" ? (
              // Table view
              <div className="border rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th
                          className="text-left p-4 font-medium cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Nombre
                            {state.sortColumn === "name" ? (
                              state.sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ArrowDown className="h-4 w-4 ml-1" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />
                            )}
                          </div>
                        </th>
                        <th
                          className="text-left p-4 font-medium cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort("workspace")}
                        >
                          <div className="flex items-center">
                            Workspace
                            {state.sortColumn === "workspace" ? (
                              state.sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ArrowDown className="h-4 w-4 ml-1" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />
                            )}
                          </div>
                        </th>
                        <th
                          className="text-left p-4 font-medium cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort("area")}
                        >
                          <div className="flex items-center">
                            Área
                            {state.sortColumn === "area" ? (
                              state.sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ArrowDown className="h-4 w-4 ml-1" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />
                            )}
                          </div>
                        </th>
                        <th
                          className="text-left p-4 font-medium cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center">
                            Estado
                            {state.sortColumn === "status" ? (
                              state.sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ArrowDown className="h-4 w-4 ml-1" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />
                            )}
                          </div>
                        </th>
                        <th className="text-left p-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedReports.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">
                              {state.showOnlyFavorites
                                ? "No tienes informes favoritos"
                                : state.searchTerm
                                  ? "No se encontraron informes"
                                  : "No hay informes disponibles"}
                            </h3>
                            <p className="text-muted-foreground">
                              {state.showOnlyFavorites
                                ? "Marca informes como favoritos para verlos aquí."
                                : state.searchTerm
                                  ? `No hay informes que coincidan con "${state.searchTerm}"`
                                  : "No tienes informes asignados en este momento."}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        displayedReports.map((report) => (
                          <tr key={report.reportId} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <FileBarChart className="h-5 w-5 text-primary" />
                                <div>
                                  <div className="font-medium">{report.reportName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {report.source === "workspace" ? "Acceso por workspace" : "Acceso directo"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">{report.workspaceName}</td>
                            <td className="p-4">{report.areaName}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Badge variant="default">Asignado</Badge>
                                {report.hasRowLevelSecurity && <Badge variant="outline">RLS</Badge>}
                                {report.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" onClick={() => navigate(`/informes/${report.reportId}`)}>
                                  Ver Informe
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFavoriteToggle(report.reportId)}
                                >
                                  <Star
                                    className={`h-4 w-4 ${report.isFavorite ? "text-yellow-500 fill-current" : ""}`}
                                  />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Grid view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedReports.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">
                        {state.showOnlyFavorites
                          ? "No tienes informes favoritos"
                          : state.searchTerm
                            ? "No se encontraron informes"
                            : "No hay informes disponibles"}
                      </h3>
                      <p className="text-muted-foreground">
                        {state.showOnlyFavorites
                          ? "Marca informes como favoritos para verlos aquí."
                          : state.searchTerm
                            ? `No hay informes que coincidan con "${state.searchTerm}"`
                            : "No tienes informes asignados en este momento."}
                      </p>
                    </Card>
                  </div>
                ) : (
                  displayedReports.map((report) => (
                    <Card
                      key={report.reportId}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-primary"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                              <FileBarChart className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{report.reportName}</CardTitle>
                              <CardDescription className="text-sm">{report.workspaceName}</CardDescription>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(report.reportId);
                            }}
                          >
                            <Star
                              className={`h-4 w-4 ${report.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground"}`}
                            />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-4">
                        <p className="text-sm text-muted-foreground mb-3">Área: {report.areaName}</p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant="default" className="text-xs">
                              Asignado
                            </Badge>
                            {report.hasRowLevelSecurity && (
                              <Badge variant="outline" className="text-xs">
                                RLS
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {report.source === "workspace" ? "Por workspace" : "Directo"}
                          </span>
                        </div>

                        <Button size="sm" className="w-full" onClick={() => navigate(`/informes/${report.reportId}`)}>
                          Ver Informe
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          // Report viewer
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <FileBarChart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{state.selectedReport.reportName}</CardTitle>
                    <CardDescription>
                      {state.selectedReport.workspaceName} • {state.selectedReport.areaName}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {state.selectedReport.hasRowLevelSecurity && <Badge variant="outline">RLS Activado</Badge>}
                  {state.selectedReport.webUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(state.selectedReport?.webUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir en Power BI
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="w-full" style={{ height: "600px" }}>
                {state.selectedReport.webUrl ? (
                  <div className="w-full h-full bg-muted/20 rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <FileBarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Próximamente integración Embedded</h3>
                      <p className="text-muted-foreground mb-4">
                        Por ahora, puedes abrir el reporte en una nueva pestaña usando el botón de arriba.
                      </p>
                      <Button onClick={() => window.open(state.selectedReport?.webUrl, "_blank")} className="mb-2">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir en nueva pestaña (temporal)
                      </Button>
                      <div className="text-xs text-muted-foreground mt-4">
                        <p>Report ID: {state.selectedReport.reportId}</p>
                        <p>Workspace: {state.selectedReport.workspaceId}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted/20 rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Configuración Pendiente</h3>
                      <p className="text-muted-foreground mb-4">La URL de este informe no ha sido configurada.</p>
                      <p className="text-xs text-muted-foreground">
                        Contacta al administrador para completar la configuración.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ChatSami - solo visible para roles autorizados */}
      {userPermissions?.chatSami && <ChatSami defaultMinimized={true} />}
    </div>
  );
}
