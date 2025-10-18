import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ClientDistributionChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function ClientDistributionChart({ data }: ClientDistributionChartProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Distribución de tus clientes totales</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              formatter={(value, entry: any) => (
                <span className="text-sm text-foreground">
                  {entry.payload.value}% {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
