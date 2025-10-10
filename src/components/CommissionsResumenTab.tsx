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
  LabelList,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ====================== */
/*  Helpers para TeamBars */
/* ====================== */
function formatMillions(n: number) {
  if (n >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function CustomTopLabel(props: any) {
  const { x, y, width, value } = props;
  const cx = x + width / 2;
  return (
    <text x={cx} y={y - 6} textAnchor="middle" className="fill-foreground" fontSize={12} fontWeight={700}>
      {formatMillions(value)}
    </text>
  );
}

export function TeamBars({ data }: { name: string; value: number }[]) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const pct = el.scrollWidth <= el.clientWidth ? 100 : (el.scrollLeft / (el.scrollWidth - el.clientWidth)) * 100;
      setProgress(pct);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Asegura barras “anchas” si hay muchos miembros
  const minInnerWidth = Math.max(560, data.length * 140);

  return (
    <div className="space-y-2">
      <div
        ref={scrollRef}
        className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div style={{ minWidth: minInnerWidth }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 24 }} barSize={64} barCategoryGap={24}>
              {/* Ejes minimalistas */}
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Promedio"]}
              />
              <Bar dataKey="value" fill="#D9F99D" stroke="#A3E635" strokeWidth={1} radius={[8, 8, 0, 0]}>
                <LabelList dataKey="value" content={<CustomTopLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progreso custom */}
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-[#00c73d] transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

/* ===================================== */
/*  Componente principal de tu pantalla  */
/* ===================================== */
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
  const conversionRate = 3; // Mock data

  // Datos para gráfico anual
  const yearlyData = React.useMemo(() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return months.map((month) => ({
      name: month,
      value: Math.random() * 10000000 + 4000000, // Mock data
    }));
  }, []);

  // Donut (como tu imagen)
  const clientTypeData = [
    { name: "Seguro Crea Patrimonio", value: 40, color: "#0EA5E9" },
    { name: "Seguro Crea Ahorro", value: 30, color: "#22C55E" },
    { name: "Enfermedades graves", value: 30, color: "#5EEAD4" },
  ];
  const totalClientType = React.useMemo(() => clientTypeData.reduce((acc, x) => acc + x.value, 0), [clientTypeData]);

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

  // Equipo
  const teamData = [
    { name: "Cristina Ruiz", value: 5_500_000 },
    { name: "Juan Pérez", value: 10_000_000 },
    { name: "Rosa López", value: 5_500_000 },
    { name: "Camila Álvarez", value: 5_500_000 },
    { name: "Daniel Gómez", value: 10_000_000 },
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
                <p className="text-3xl font-bold">3</p>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Tasa de conversión: 3%
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
              <p className="text-2xl font-bold mb-4">${(25_000_000).toLocaleString()}</p>
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
          {/* Donut estilo tarjeta con leyenda a la derecha */}
          <Card className="relative overflow-hidden min-h-[300px]">
            <CardHeader>
              <Tabs defaultValue="tipo-comision" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tipo-comision">Tipo de comisión</TabsTrigger>
                  <TabsTrigger value="producto">Producto</TabsTrigger>
                </TabsList>

                <TabsContent value="tipo-comision" className="mt-6">
                  <div className="h-[230px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ left: 8, right: 8, top: 0, bottom: 0 }}>
                        <Pie
                          data={clientTypeData}
                          dataKey="value"
                          nameKey="name"
                          cx="42%"
                          cy="50%"
                          innerRadius={56}
                          outerRadius={84}
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
                  </div>
                </TabsContent>

                <TabsContent value="producto">
                  <div className="h-[230px] flex items-center justify-center text-muted-foreground">Próximamente</div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Gráfico de equipo con el look solicitado */}
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
              <p className="text-2xl font-bold mb-4">${(10_000_000).toLocaleString()}</p>
              <TeamBars data={teamData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
