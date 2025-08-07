import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LeadsStageChartProps {
  leads: Lead[];
}

export function LeadsStageChart({ leads }: LeadsStageChartProps) {
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

  // Preparar datos para la gráfica
  const chartData = Object.entries(stageStats).map(([stage, count]) => ({
    stage: stage.length > 20 ? `${stage.substring(0, 20)}...` : stage,
    fullStage: stage,
    count,
    percentage: totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : '0'
  })).sort((a, b) => b.count - a.count);

  // Si no hay datos, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribución de Leads por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No hay datos disponibles para mostrar
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.fullStage}</p>
          <p className="text-primary">
            <span className="font-semibold">{data.count}</span> leads ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Distribución de Leads por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Gráfica de barras horizontales */}
          <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="horizontal"
                margin={{
                  top: 20,
                  right: 30,
                  left: 120,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category"
                  dataKey="stage" 
                  width={120}
                  fontSize={12}
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]}
                  className="hover:opacity-80"
                  minPointSize={5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Resumen por estado al lado derecho */}
          <div className="lg:w-80">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Resumen por Estado</h4>
            <div className="space-y-2 text-sm max-h-56 overflow-y-auto">
              {chartData.map((item) => (
                <div key={item.fullStage} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="truncate pr-2" title={item.fullStage}>
                    {item.stage}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}