import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface AccessDeniedProps {
  message?: string;
}

export const AccessDenied = ({ message = "No tienes permisos para acceder a esta página." }: AccessDeniedProps) => {
  return (
    <div className="container mx-auto py-5">
      <Card>
        <CardContent className="text-center py-5">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};
