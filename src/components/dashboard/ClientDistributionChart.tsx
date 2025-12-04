import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientDistributionChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function ClientDistributionChart({ data }: ClientDistributionChartProps) {
  const isMobile = useIsMobile();

  return (
    <Card className="border-border py-4 h-full">
      <CardHeader className="pb-3">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Distribución de tus clientes totales</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 220}>
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy={isMobile ? "35%" : "50%"} 
              innerRadius={isMobile ? 50 : 60} 
              outerRadius={isMobile ? 70 : 80} 
              paddingAngle={2} 
              dataKey="value"
            >
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
              layout={isMobile ? "horizontal" : "vertical"}
              verticalAlign={isMobile ? "bottom" : "middle"}
              align={isMobile ? "center" : "right"}
              wrapperStyle={isMobile ? { paddingTop: "16px" } : undefined}
              formatter={(value, entry: any) => (
                <span className="text-[11px] md:text-[12px] text-foreground">
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
