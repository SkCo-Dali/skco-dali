import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, TrendingUp, Target, Percent, Receipt } from "lucide-react";

interface Props {
  advisorId: string;
}

interface SalesKPI {
  fecha: string;
  produccion: number;
  primas: number;
  negocios: number;
  conversion: number;
  ticket: number;
}

export const AdvisorVentasTab = ({ advisorId }: Props) => {
  const [salesData, setSalesData] = useState<SalesKPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        const response = await fetch(`/src/mocks/salesKPI_${advisorId}.json`);
        const data = await response.json();
        setSalesData(data);
      } catch (error) {
        console.error("Error loading sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [advisorId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Cargando datos de ventas...</p>
        </CardContent>
      </Card>
    );
  }

  // Calcular métricas agregadas
  const totalProduccion = salesData.reduce((sum, d) => sum + d.produccion, 0);
  const totalPrimas = salesData.reduce((sum, d) => sum + d.primas, 0);
  const totalNegocios = salesData.reduce((sum, d) => sum + d.negocios, 0);
  const avgConversion = salesData.reduce((sum, d) => sum + d.conversion, 0) / salesData.length;
  const avgTicket = salesData.reduce((sum, d) => sum + d.ticket, 0) / salesData.length;

  // Preparar datos para gráficos con formato más legible
  const chartData = salesData.map((d) => ({
    fecha: new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    produccion: d.produccion / 1000000, // En millones
    primas: d.primas,
    negocios: d.negocios,
    conversion: d.conversion * 100, // En porcentaje
    ticket: d.ticket / 1000, // En miles
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Producción Total"
          value={`$${(totalProduccion / 1000000).toFixed(1)}M`}
          description="Últimos 8 días"
          variant="success"
        />
        <MetricCard
          title="Total Primas"
          value={totalPrimas.toString()}
          description="Número de primas"
          variant="neutral"
        />
        <MetricCard
          title="Negocios Cerrados"
          value={totalNegocios.toString()}
          description="Total de negocios"
          variant="success"
        />
        <MetricCard
          title="Conversión Promedio"
          value={`${(avgConversion * 100).toFixed(1)}%`}
          description="Tasa de conversión"
          variant="neutral"
        />
        <MetricCard
          title="Ticket Promedio"
          value={`$${(avgTicket / 1000).toFixed(0)}K`}
          description="Por negocio"
          variant="neutral"
        />
      </div>

      {/* Gráficos de Evolución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Producción y Primas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Evolución de Producción y Primas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                produccion: {
                  label: "Producción (M)",
                  color: "hsl(var(--primary))",
                },
                primas: {
                  label: "Primas",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis yAxisId="left" tickFormatter={(value) => `$${value}M`} />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="produccion"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Producción (M)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="primas"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Primas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Negocios Cerrados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Evolución de Negocios Cerrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                negocios: {
                  label: "Negocios",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="negocios" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Negocios" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversión */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Evolución de Tasa de Conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                conversion: {
                  label: "Conversión %",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversión"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversion"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    name="Conversión %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Ticket Promedio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Evolución de Ticket Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ticket: {
                  label: "Ticket (K)",
                  color: "hsl(var(--chart-5))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis tickFormatter={(value) => `$${value}K`} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`$${value.toFixed(0)}K`, "Ticket"]}
                  />
                  <Bar dataKey="ticket" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="Ticket (K)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
