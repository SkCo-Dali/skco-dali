import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Calendar, Building2, FileText } from "lucide-react";
import type { Certification } from "@/core/api/dto";

interface Props {
  certifications: Certification[];
}

export const CertificationsCardsView = ({ certifications }: Props) => {
  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case "vigente":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          badge: <Badge variant="default">Vigente</Badge>,
        };
      case "por_vencer":
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          badge: <Badge variant="secondary">Por Vencer</Badge>,
        };
      case "vencida":
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          badge: <Badge variant="destructive">Vencida</Badge>,
        };
      default:
        return {
          icon: null,
          badge: null,
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {certifications.map((cert, index) => {
        const statusConfig = getStatusConfig(cert.estado);
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{cert.nombre}</CardTitle>
                {statusConfig.icon}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{cert.entidad}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expedición:</span>
                  <span>{new Date(cert.expide).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Vencimiento:</span>
                  <span>{new Date(cert.expira).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                {statusConfig.badge}
                {cert.archivoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={cert.archivoUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
