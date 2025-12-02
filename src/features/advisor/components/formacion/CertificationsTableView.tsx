import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import type { Certification } from "@/core/api/dto";

interface Props {
  certifications: Certification[];
}

export const CertificationsTableView = ({ certifications }: Props) => {
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "vigente":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Vigente
          </Badge>
        );
      case "por_vencer":
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Por Vencer
          </Badge>
        );
      case "vencida":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Vencida
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg overflow-x-auto min-w-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Certificación</TableHead>
            <TableHead>Entidad</TableHead>
            <TableHead>Expedición</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certifications.map((cert, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{cert.nombre}</TableCell>
              <TableCell>{cert.entidad}</TableCell>
              <TableCell>{new Date(cert.expide).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(cert.expira).toLocaleDateString()}</TableCell>
              <TableCell>{getStatusBadge(cert.estado)}</TableCell>
              <TableCell>
                {cert.archivoUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={cert.archivoUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
