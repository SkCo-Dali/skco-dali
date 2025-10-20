import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowRight } from "lucide-react";

interface CommissionsChartProps {
  data: Array<{ month: string; value: number }>;
  totalCommissions: string;
  onViewDetails?: () => void;
}

export function CommissionsChart({ data, totalCommissions, onViewDetails }: CommissionsChartProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Tus comisiones</h3>
          {onViewDetails && (
            <Button variant="link" onClick={onViewDetails} className="text-primary hover:text-primary/80">
              Ir a comisiones
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">{totalCommissions}</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={{ stroke: "hsl(var(--border))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
