import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  advisorId: string;
}

export const AdvisorVentasTab = ({ advisorId }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Implementación pendiente: Gráficos de evolución de ventas, producción, negocios, conversión y ticket promedio.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Advisor ID: {advisorId}
        </p>
      </CardContent>
    </Card>
  );
};
