import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Advisor } from "@/core/api/dto";

interface Props {
  advisor: Advisor;
}

export const AdvisorResumenTab = ({ advisor }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Nombre:</span>
            <span className="font-medium">{advisor.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Documento:</span>
            <span className="font-medium">{advisor.doc}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">ID:</span>
            <span className="font-medium">{advisor.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <Badge variant={advisor.estado === "activo" ? "default" : "secondary"}>
              {advisor.estado}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubicación y Canal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Región:</span>
            <span className="font-medium">{advisor.region}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Zona:</span>
            <span className="font-medium">{advisor.zona}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Jefe:</span>
            <span className="font-medium">{advisor.jefe || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Canal:</span>
            <span className="font-medium">{advisor.canal || "-"}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>KPIs de Desempeño (Simulado)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">$12.5M</p>
              <p className="text-xs text-muted-foreground">Producción</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">32</p>
              <p className="text-xs text-muted-foreground">Negocios</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">28%</p>
              <p className="text-xs text-muted-foreground">Conversión</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">$690K</p>
              <p className="text-xs text-muted-foreground">Ticket Prom.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
