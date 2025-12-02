import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, AlertCircle, Search } from "lucide-react";
import { useProviders } from "@/core/di/providers";
import type { Campaign, CampaignAssignment } from "@/core/api/dto";

interface Props {
  advisorId: string;
}

export const AdvisorCampanasTab = ({ advisorId }: Props) => {
  const { campaigns: campaignProvider } = useProviders();
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [assignments, setAssignments] = useState<CampaignAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, [advisorId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignsData, assignmentsData] = await Promise.all([
        campaignProvider.getAdvisorCampaigns(advisorId),
        campaignProvider.getAdvisorCampaignAssignments(advisorId),
      ]);
      setAllCampaigns(campaignsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const campaigns = useMemo(() => {
    if (!searchTerm.trim()) return allCampaigns;
    const term = searchTerm.toLowerCase();
    return allCampaigns.filter(
      (campaign) =>
        campaign.nombre.toLowerCase().includes(term) ||
        campaign.producto.toLowerCase().includes(term) ||
        campaign.canal.toLowerCase().includes(term),
    );
  }, [allCampaigns, searchTerm]);

  const getAssignment = (campaignId: string) => {
    return assignments.find((a) => a.campaignId === campaignId);
  };

  const calculateProgress = (assignment?: CampaignAssignment) => {
    if (!assignment?.leadsAsignados) return 0;
    return Math.round((assignment.leadsAtendidos! / assignment.leadsAsignados) * 100);
  };

  const handleVerLeads = (campaignId: string) => {
    console.log("Ver leads de campaña:", campaignId, "para advisor:", advisorId);
    alert(`Deep-link simulado: Ver leads de campaña ${campaignId}`);
  };

  const handleReportIncidence = (campaignId: string) => {
    console.log("Reportar incidencia en campaña:", campaignId);
    alert("Acción simulada: Reportar incidencia");
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      activa: "default",
      pausada: "secondary",
      finalizada: "destructive",
    };
    return (
      <Badge variant={variants[estado] || "secondary"} className="text-[10px] sm:text-xs">
        {estado}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Campañas Asignadas</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">Campañas Asignadas ({campaigns.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Buscar campaña..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {campaigns.length === 0 ? (
            <p className="text-center text-xs sm:text-base text-muted-foreground py-6 sm:py-8">
              {searchTerm ? "No se encontraron campañas" : "No hay campañas asignadas a este asesor"}
            </p>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="sm:hidden space-y-3">
                {campaigns.map((campaign) => {
                  const assignment = getAssignment(campaign.campaignId);
                  const progress = calculateProgress(assignment);

                  return (
                    <div key={campaign.campaignId} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{campaign.nombre}</p>
                          <p className="text-xs text-muted-foreground">{campaign.producto}</p>
                        </div>
                        {getEstadoBadge(campaign.estado)}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/30 rounded p-2">
                          <p className="text-[10px] text-muted-foreground">Cuota</p>
                          <p className="text-xs font-medium">{assignment?.cuota || "-"}</p>
                        </div>
                        <div className="bg-muted/30 rounded p-2">
                          <p className="text-[10px] text-muted-foreground">Leads</p>
                          <p className="text-xs font-medium">
                            {assignment?.leadsAtendidos || 0}/{assignment?.leadsAsignados || 0}
                          </p>
                        </div>
                        <div className="bg-muted/30 rounded p-2">
                          <p className="text-[10px] text-muted-foreground">Avance</p>
                          <p
                            className={`text-xs font-medium ${
                              progress >= 80 ? "text-green-600" : progress >= 50 ? "text-yellow-600" : "text-red-600"
                            }`}
                          >
                            {progress}%
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerLeads(campaign.campaignId)}
                          className="flex-1 gap-1 text-xs h-8"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver Leads
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReportIncidence(campaign.campaignId)}
                          className="h-8 w-8 p-0"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaña</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Cuota</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">% Avance</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => {
                      const assignment = getAssignment(campaign.campaignId);
                      const progress = calculateProgress(assignment);

                      return (
                        <TableRow key={campaign.campaignId}>
                          <TableCell className="font-medium">{campaign.nombre}</TableCell>
                          <TableCell>{campaign.producto}</TableCell>
                          <TableCell>{campaign.canal}</TableCell>
                          <TableCell>{getEstadoBadge(campaign.estado)}</TableCell>
                          <TableCell className="text-right">{assignment?.cuota || "-"}</TableCell>
                          <TableCell className="text-right">
                            {assignment?.leadsAtendidos || 0} / {assignment?.leadsAsignados || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                progress >= 80
                                  ? "text-green-600 font-medium"
                                  : progress >= 50
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }
                            >
                              {progress}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerLeads(campaign.campaignId)}
                                className="gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Ver Leads
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReportIncidence(campaign.campaignId)}
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">KPIs por Campaña (Simulado)</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Implementación pendiente: Tabla con negocios, primas, conversión, ticket y ROI por campaña.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
