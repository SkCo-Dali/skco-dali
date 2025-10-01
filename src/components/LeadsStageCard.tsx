import React, { useState } from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";

interface LeadsStageCardProps {
  leads: Lead[];
  stageCounts?: Record<string, number>;
  totalLeads?: number;
  loading?: boolean;
}

export function LeadsStageCard({ leads, stageCounts, totalLeads: realTotalLeads, loading = false }: LeadsStageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Usar conteos reales si están disponibles, sino calcular desde el array local
  const stageStats = stageCounts || leads.reduce((acc, lead) => {
    const stage = lead.stage;
    if (!acc[stage]) {
      acc[stage] = 0;
    }
    acc[stage]++;
    return acc;
  }, {} as Record<string, number>);

  const totalLeads = realTotalLeads || leads.length;

  // Preparar datos para el resumen - filtrar stages con conteo > 0
  const chartData = Object.entries(stageStats)
    .filter(([_, count]) => count > 0)
    .map(([stage, count]) => ({
      stage: stage,
      fullStage: stage,
      count,
      percentage: totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.count - a.count);

  // Mostrar skeleton mientras carga
  if (loading) {
    return (
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-3">
          <CardTitle className="text-sm font-medium">Resumen por Estado</CardTitle>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-4 px-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Resumen por Estado</CardTitle>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-center text-muted-foreground text-sm">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-3">
        <CardTitle className="text-sm font-medium">Resumen por Estado</CardTitle>
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pb-4 px-3">
        <div className="space-y-2 text-sm px-0">
          <div className={`space-y-2 ${!isExpanded ? 'max-h-24 overflow-hidden' : 'max-h-40 overflow-y-auto'} transition-all duration-300`}>
            {(isExpanded ? chartData : chartData.slice(0, 3)).map((item) => (
              <div key={item.fullStage} className="flex justify-between items-start gap-2">
                <span className="text-xs text-muted-foreground flex-1 leading-tight">
                  {item.stage}
                </span>
                <span className="font-medium whitespace-nowrap text-xs">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
          {chartData.length > 3 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Ver más (+{chartData.length - 3})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}