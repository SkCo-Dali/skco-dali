import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Advisor } from "@/core/api/dto";

interface Props {
  advisor: Advisor;
}

export const AdvisorDatosTab = ({ advisor }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Asesor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">ID</p>
              <p className="font-medium">{advisor.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documento</p>
              <p className="font-medium">{advisor.doc}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nombre Completo</p>
              <p className="font-medium">{advisor.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="font-medium">{advisor.estado}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Región</p>
              <p className="font-medium">{advisor.region}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zona</p>
              <p className="font-medium">{advisor.zona}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jefe Directo</p>
              <p className="font-medium">{advisor.jefe || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Canal</p>
              <p className="font-medium">{advisor.canal || "-"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
