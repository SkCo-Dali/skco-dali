import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import salesKPIData from "@/mocks/salesKPI_A-1001.json";

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

type DateFilter = "7days" | "30days" | "currentMonth";

export const AdvisorVentasTab = ({ advisorId }: Props) => {
  const [salesData, setSalesData] = useState<SalesKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>("7days");

  useEffect(() => {
    // Cargar datos mock directamente
    setSalesData(salesKPIData as SalesKPI[]);
    setLoading(false);
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

  // Filtrar datos según el período seleccionado
  const getFilteredData = () => {
    const today = new Date("2025-11-08"); // Fecha de referencia para mockup
    let startDate: Date;

    switch (dateFilter) {
      case "7days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        break;
      case "30days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        break;
      case "currentMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
    }

    return salesData.filter((d) => {
      const dataDate = new Date(d.fecha);
      return dataDate >= startDate && dataDate <= today;
    });
  };

  const filteredData = getFilteredData();

  // Calcular métricas agregadas
  const totalProduccion = filteredData.reduce((sum, d) => sum + d.produccion, 0);
  const totalPrimas = filteredData.reduce((sum, d) => sum + d.primas, 0);
  const totalNegocios = filteredData.reduce((sum, d) => sum + d.negocios, 0);
  const avgConversion =
    filteredData.length > 0 ? filteredData.reduce((sum, d) => sum + d.conversion, 0) / filteredData.length : 0;
  const avgTicket =
    filteredData.length > 0 ? filteredData.reduce((sum, d) => sum + d.ticket, 0) / filteredData.length : 0;

  // Preparar datos para gráficos con formato más legible
  const chartData = filteredData.map((d) => ({
    fecha: new Date(d.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
    produccion: d.produccion / 1000000, // En millones
    primas: d.primas,
    negocios: d.negocios,
    conversion: d.conversion * 100, // En porcentaje
    ticket: d.ticket / 1000, // En miles
  }));

  const getFilterLabel = () => {
    switch (dateFilter) {
      case "7days":
        return "Últimos 7 días";
      case "30days":
        return "Últimos 30 días";
      case "currentMonth":
        return "Mes actual";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Fecha */}
      <Card className="border-0 shadow-none">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Período:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={dateFilter === "7days" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter("7days")}
              >
                Últimos 7 días
              </Button>
              <Button
                variant={dateFilter === "30days" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter("30days")}
              >
                Últimos 30 días
              </Button>
              <Button
                variant={dateFilter === "currentMonth" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter("currentMonth")}
              >
                Mes actual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="APE"
          value={`$${(totalProduccion / 1000000).toFixed(1)}M`}
          description={getFilterLabel()}
          variant="success"
        />
        <MetricCard
          title="Pólizas Emitidas"
          value={totalPrimas.toString()}
          description="Número de primas"
          variant="neutral"
        />
        <MetricCard
          title="Pólizas Fondeadas"
          value={totalNegocios.toString()}
          description="Total de negocios"
          variant="success"
        />
        <MetricCard
          title="NCCF"
          value={`${(avgConversion * 100).toFixed(1)}K`}
          description="Tasa de conversión"
          variant="neutral"
        />
        <MetricCard
          title="AUMS"
          value={`$${(avgTicket / 1000).toFixed(0)}K`}
          description="Activos bajo administración"
          variant="neutral"
        />
      </div>

      {/* Gráficos de Evolución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Producción y Primas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Evolución de Pólizas Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                produccion: {
                  label: "Producción (M)",
                  color: "hsl(var(--primary))",
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
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Negocios Cerrados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Evolución de Pólizas Fondeadas</CardTitle>
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
                  <Bar dataKey="negocios" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Negocios" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversión */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Evolución de Tasa de Conversión</CardTitle>
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
            <CardTitle className="text-lg font-semibold">Evolución de Ticket Promedio</CardTitle>
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
