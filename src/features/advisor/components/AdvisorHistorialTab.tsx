import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface Props {
  advisorId: string;
}

export const AdvisorHistorialTab = ({ advisorId }: Props) => {
  const handleCreateAlert = () => {
    console.log("Crear alerta para advisor:", advisorId);
    alert("Acción simulada: Crear alerta");
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Historial de Actividades</CardTitle>
        <Button onClick={handleCreateAlert} size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm w-fit">
          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Crear Alerta
        </Button>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <p className="text-xs sm:text-base text-muted-foreground">
          Implementación pendiente: Timeline de interacciones, cambios de estado, alertas y notas del asesor.
        </p>
        <p className="text-[10px] sm:text-sm text-muted-foreground mt-2">
          Advisor ID: {advisorId}
        </p>
      </CardContent>
    </Card>
  );
};
