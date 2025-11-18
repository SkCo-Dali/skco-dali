import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  advisorId: string;
}

export const AdvisorFormacionTab = ({ advisorId }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formación & Certificaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Implementación pendiente: Lista de cursos completados, certificaciones vigentes/por vencer, y botón para asignar nuevo curso.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Advisor ID: {advisorId}
        </p>
      </CardContent>
    </Card>
  );
};
