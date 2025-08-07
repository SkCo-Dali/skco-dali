import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface LeadsStageCardProps {
  leads: Lead[];
}

export function LeadsStageCard({ leads }: LeadsStageCardProps) {
  const totalLeads = leads.length;
  
  // Contar leads por estado
  const stageStats = leads.reduce((acc, lead) => {
    const stage = lead.stage;
    if (!acc[stage]) {
      acc[stage] = 0;
    }
    acc[stage]++;
    return acc;
  }, {} as Record<string, number>);

  // Preparar datos para el resumen
  const chartData = Object.entries(stageStats).map(([stage, count]) => ({
    stage: stage.length > 15 ? `${stage.substring(0, 15)}...` : stage,
    fullStage: stage,
    count,
    percentage: totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : '0'
  })).sort((a, b) => b.count - a.count);

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Resumen por Estado</CardTitle>
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
          {chartData.slice(0, 5).map((item) => (
            <div key={item.fullStage} className="flex justify-between items-center">
              <span className="truncate pr-2 text-xs" title={item.fullStage}>
                {item.stage}
              </span>
              <span className="font-medium whitespace-nowrap text-xs">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
          {chartData.length > 5 && (
            <div className="text-xs text-muted-foreground text-center pt-1">
              +{chartData.length - 5} estados más
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}