import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  advisorId: string;
}

export const AdvisorMetasTab = ({ advisorId }: Props) => {
  const handleEditGoal = () => {
    console.log("Editar meta para advisor:", advisorId);
    alert("Acción simulada: Editar meta");
  };

  const handleAddTask = () => {
    console.log("Añadir tarea al plan 30-60-90 para advisor:", advisorId);
    alert("Acción simulada: Añadir tarea al plan 30-60-90");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Metas & Plan 30-60-90</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleEditGoal} size="sm">
              Editar Meta
            </Button>
            <Button onClick={handleAddTask} size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir Tarea
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Implementación pendiente: Metas por producto, avance vs objetivo, y plan de acción 30-60-90 días.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Advisor ID: {advisorId}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
