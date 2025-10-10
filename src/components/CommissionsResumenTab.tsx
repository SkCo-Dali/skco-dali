import React from "react";
import { Commission } from "@/data/commissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommissionsResumenTabProps {
  commissions: Commission[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export function CommissionsResumenTab({
  commissions,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
}: CommissionsResumenTabProps) {
  // Filtrar comisiones del mes actual
  const currentMonthCommissions = React.useMemo(() => {
    const [year, month] = selectedMonth.split("-");
    return commissions.filter((c) => c.year === parseInt(year) && c.month === parseInt(month));
  }, [commissions, selectedMonth]);

  // KPIs
  const monthTotal = currentMonthCommissions.reduce((sum, c) => sum + c.commissionValue, 0);
  const newClients = 3; // Mock data
  const currentClients = 125; // Mock data
  const conversionRate = 3; // Mock data

  // Datos para gráfico anual
  const yearlyData = React.useMemo(() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return months.map((month) => ({
      name: month,
      value: Math.random() * 10000000 + 4000000, // Mock data
    }));
  }, []);

  // Datos para gráfico de dona
  const clientTypeData = [
    { name: "Seguro Crea Patrimonio", value: 40, color: "#0EA5E9" },
    { name: "Seguro Crea Ahorro", value: 30, color: "#22C55E" },
    { name: "Enfermedades graves", value: 30, color: "#5EEAD4" },
  ];

  const totalClientType = React.useMemo(() => clientTypeData.reduce((acc, x) => acc + x.value, 0), [clientTypeData]);

  // Leyenda custom para el donut (• 30% Nombre)
  function ClientTypeLegend({ payload = [] as any[] }) {
    return (
      <ul className="space-y-1">
        {payload.map((entry, i) => {
          const v = entry?.payload?.value ?? 0;
          const pct = Math.round((v / (totalClientType || 1)) * 100);
          return (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: entry.color }} />
              <span className="text-muted-foreground">
                <strong className="text-foreground mr-1">{pct}%</strong>
                {entry?.value}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  // Datos para gráfico de barras del equipo
  const teamData = [
    { name: "Cristina Ruiz", value: 5500000 },
    { name: "Juan Pérez", value: 10000000 },
    { name: "Rosa López", value: 5500000 },
    { name: "Camila Álvarez", value: 5500000 },
    { name: "Daniel Gómez", value: 10000000 },
  ];

  return (
    <div className="space-y-6">
      {/* Selector de mes */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Desempeño en</span>
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[180px] border-0 bg-transparent font-semibold text-[#00c73d]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">enero</SelectItem>
              <SelectItem value="2024-12">diciembre</SelectItem>
              <SelectItem value="2024-11">noviembre</SelectItem>
              <SelectItem value="2024-10">octubre</SelectItem>
              <SelectItem value="2024-09">septiembre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecciona fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* KPI Cards - Columna izquierda */}
        <div className="space-y-4 col-span-2">
          {/* Comisiones del mes */}
          <Card className="relative h-[134.5px]">
            <CardContent className="pt-4 pb-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tus comisiones del mes</p>
                <p className="text-3xl font-bold">${monthTotal.toLocaleString()}</p>
              </div>
            </CardContent>
            <Badge className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 bg-[#d4f4dd] text-[#00c73d] hover:bg-[#d4f4dd]">
              5% <TrendingUp className="h-3 w-3" /> ¡Wow!
            </Badge>
          </Card>

          {/* Nuevos clientes */}
          <Card className="relative h-[134.5px]">
            <CardContent className="pt-3 pb-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nuevos clientes que hiciste</p>
                <p className="text-3xl font-bold">{newClients}</p>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Tasa de conversión: {conversionRate}%
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] leading-none"
                    aria-label="Más info"
                    title="Porcentaje de leads que se convierten en clientes"
                  >
                    i
                  </span>
                </p>
              </div>
            </CardContent>
            <Badge className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-[#ffe5e5] text-[#dc2626] hover:bg-[#ffe5e5]">
              -5% <TrendingDown className="h-3 w-3" /> ¡Vamos!
            </Badge>
          </Card>

          {/* Gráfico anual */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Total de comisiones anual</CardTitle>
                <Select defaultValue="2025">
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-4">${(25000000).toLocaleString()}</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="value" stroke="#00c73d" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2 space-y-4">
          {/* Gráfico de dona */}
          <Card className="relative h-[285px]">
            <CardHeader>
              <Tabs defaultValue="tipo-comision" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tipo-comision">Tipo de comisión</TabsTrigger>
                  <TabsTrigger value="producto">Producto</TabsTrigger>
                </TabsList>

                {/* === Donut con leyenda a la derecha (como la imagen) === */}
                <TabsContent value="tipo-comision" className="mt-6">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart margin={{ left: 0, right: 0 }}>
                      <Pie
                        data={clientTypeData}
                        dataKey="value"
                        nameKey="name"
                        cx="35%" // deja espacio a la derecha para la leyenda
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        cornerRadius={6}
                      >
                        {clientTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>

                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        content={<ClientTypeLegend />}
                        wrapperStyle={{ right: 0 }}
                      />

                      <Tooltip
                        formatter={(value: number, _name: string, { payload }: any) => {
                          const pct = Math.round((payload.value / (totalClientType || 1)) * 100);
                          return [`${value} (${pct}%)`, payload.name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="producto">
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">Próximamente</div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Gráfico de equipo */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Comisiones promedio de tu equipo</CardTitle>
                <Select defaultValue="2025">
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-4">${(10000000).toLocaleString()}</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={teamData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#b8e986" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
