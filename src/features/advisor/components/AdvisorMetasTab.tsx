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
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Metas & Plan 30-60-90</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleEditGoal} size="sm" className="text-xs sm:text-sm">
              Editar Meta
            </Button>
            <Button onClick={handleAddTask} size="sm" variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Añadir Tarea</span>
              <span className="sm:hidden">Añadir</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <p className="text-xs sm:text-base text-muted-foreground">
            Implementación pendiente: Metas por producto, avance vs objetivo, y plan de acción 30-60-90 días.
          </p>
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-2">
            Advisor ID: {advisorId}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
