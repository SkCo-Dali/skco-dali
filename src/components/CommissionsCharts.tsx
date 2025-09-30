import React from "react";
import { Commission, PRODUCT_TYPE_LABELS, PRODUCT_COLORS } from "@/data/commissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface CommissionsChartsProps {
  commissions: Commission[];
}

export function CommissionsCharts({ commissions }: CommissionsChartsProps) {
  // Datos para gráfica de barras mensuales (últimos 6 meses)
  const monthlyData = React.useMemo(() => {
    const months = ['Oct', 'Nov', 'Dic', 'Ene'];
    const monthNumbers = [10, 11, 12, 1];
    
    return months.map((month, index) => {
      const monthNum = monthNumbers[index];
      const year = monthNum <= 1 ? 2025 : 2024;
      
      const monthCommissions = commissions.filter(c => 
        c.month === monthNum && c.year === year
      );
      
      const total = monthCommissions.reduce((sum, c) => sum + c.commissionValue, 0);
      
      return {
        month,
        total: total / 1000 // Convertir a miles para mejor visualización
      };
    });
  }, [commissions]);

  // Datos para gráfica circular por tipo de producto
  const productData = React.useMemo(() => {
    const productTotals = commissions.reduce((acc, commission) => {
      const product = commission.productType;
      acc[product] = (acc[product] || 0) + commission.commissionValue;
      return acc;
    }, {} as Record<Commission['productType'], number>);

    return Object.entries(productTotals).map(([product, total]) => ({
      name: PRODUCT_TYPE_LABELS[product as Commission['productType']],
      value: total / 1000, // Convertir a miles
      fill: PRODUCT_COLORS[product as Commission['productType']]
    }));
  }, [commissions]);

  // Total general para mostrar en el centro del pie chart
  const totalGeneral = commissions.reduce((sum, c) => sum + c.commissionValue, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfica de barras mensuales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Desempeño General de las Comisiones Totales (2025)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              total: {
                label: "Total",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}K`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`$${value.toLocaleString()}K`, "Total"]}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfica circular por producto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Distribución por Tipo de Producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Valor",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`$${value.toLocaleString()}K`, "Comisiones"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Total en el centro */}
          <div className="text-center mt-4">
            <div className="text-2xl font-bold">
              ${(totalGeneral / 1000).toLocaleString()}K
            </div>
            <div className="text-sm text-muted-foreground">
              Comisiones Totales
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}