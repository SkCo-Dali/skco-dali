import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, AlertCircle } from "lucide-react";
import { useProviders } from "@/core/di/providers";
import type { Campaign, CampaignAssignment } from "@/core/api/dto";

interface Props {
  advisorId: string;
}

export const AdvisorCampanasTab = ({ advisorId }: Props) => {
  const { campaigns: campaignProvider } = useProviders();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [assignments, setAssignments] = useState<CampaignAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setCampaigns(campaignsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAssignment = (campaignId: string) => {
    return assignments.find((a) => a.campaignId === campaignId);
  };

  const calculateProgress = (assignment?: CampaignAssignment) => {
    if (!assignment?.leadsAsignados) return 0;
    return Math.round(
      (assignment.leadsAtendidos! / assignment.leadsAsignados) * 100
    );
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
    return <Badge variant={variants[estado] || "secondary"}>{estado}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campañas Asignadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campañas Asignadas ({campaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay campañas asignadas a este asesor
            </p>
          ) : (
            <div className="overflow-x-auto">
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
                        <TableCell className="font-medium">
                          {campaign.nombre}
                        </TableCell>
                        <TableCell>{campaign.producto}</TableCell>
                        <TableCell>{campaign.canal}</TableCell>
                        <TableCell>{getEstadoBadge(campaign.estado)}</TableCell>
                        <TableCell className="text-right">
                          {assignment?.cuota || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {assignment?.leadsAtendidos || 0} /{" "}
                          {assignment?.leadsAsignados || 0}
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
                              onClick={() =>
                                handleReportIncidence(campaign.campaignId)
                              }
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPIs por Campaña (Simulado)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Implementación pendiente: Tabla con negocios, primas, conversión, ticket y ROI por campaña.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
