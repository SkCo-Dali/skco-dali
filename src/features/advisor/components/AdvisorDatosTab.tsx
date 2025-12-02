import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Advisor } from "@/core/api/dto";

interface Props {
  advisor: Advisor;
}

export const AdvisorDatosTab = ({ advisor }: Props) => {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Datos del Asesor</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-muted/30 rounded-md p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-sm text-muted-foreground">ID</p>
              <p className="text-xs sm:text-base font-medium">{advisor.id}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Documento</p>
              <p className="text-xs sm:text-base font-medium">{advisor.doc}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5 sm:p-3 sm:col-span-2">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Nombre Completo</p>
              <p className="text-xs sm:text-base font-medium">{advisor.nombre}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Estado</p>
              <p className="text-xs sm:text-base font-medium">{advisor.estado}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Región</p>
              <p className="text-xs sm:text-base font-medium">{advisor.region}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Zona</p>
              <p className="text-xs sm:text-base font-medium">{advisor.zona}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Jefe Directo</p>
              <p className="text-xs sm:text-base font-medium">{advisor.jefe || "-"}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5 sm:p-3 sm:col-span-2">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Canal</p>
              <p className="text-xs sm:text-base font-medium">{advisor.canal || "-"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
