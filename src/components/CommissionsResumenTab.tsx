import React from "react";
import { Commission } from "@/data/commissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";
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
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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

  // Calcular KPIs
  const monthTotal = currentMonthCommissions.reduce((sum, c) => sum + c.commissionValue, 0);
  const newClients = 3; // Mock data
  const currentClients = 125; // Mock data
  const conversionRate = 3; // Mock data

  // Datos para gráfico anual
  const yearlyData = React.useMemo(() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return months.map((month, index) => ({
      name: month,
      value: Math.random() * 10000000 + 4000000, // Mock data
    }));
  }, []);

  // Datos para gráfico de dona
  const clientTypeData = [
    { name: "Clientes actuales", value: 85, color: "#0095d9" },
    { name: "Clientes nuevos", value: 15, color: "#00c73d" },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KPI Cards - Columna izquierda */}
        <div className="space-y-4">
          {/* Comisiones del mes */}
          <Card className="relative max-h-[118px]">
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
          <Card className="relative max-h-[118px]">
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

          {/* Clientes actuales */}
          <Card className="relative h-[118px]">
            <CardContent className="pt-4 pb-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tus clientes actuales</p>
                <p className="text-3xl font-bold">{currentClients}</p>
              </div>
            </CardContent>
            <Badge className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 bg-[#fff4e5] text-[#ea580c] hover:bg-[#fff4e5] flex items-center gap-1">
              -1% <TrendingDown className="h-3 w-3" /> 1 inactivo
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
          <Card>
            <CardHeader>
              <Tabs defaultValue="tipo-cliente" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tipo-cliente">Tipo de cliente</TabsTrigger>
                  <TabsTrigger value="tipo-comision">Tipo de comisión</TabsTrigger>
                  <TabsTrigger value="producto">Producto</TabsTrigger>
                </TabsList>
                <TabsContent value="tipo-cliente" className="mt-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={clientTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {clientTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    {clientTypeData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">
                          {item.value}% {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="tipo-comision">
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">Próximamente</div>
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
