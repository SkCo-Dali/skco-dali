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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historial de Actividades</CardTitle>
        <Button onClick={handleCreateAlert} size="sm" className="gap-2">
          <Bell className="h-4 w-4" />
          Crear Alerta
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Implementación pendiente: Timeline de interacciones, cambios de estado, alertas y notas del asesor.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Advisor ID: {advisorId}
        </p>
      </CardContent>
    </Card>
  );
};
