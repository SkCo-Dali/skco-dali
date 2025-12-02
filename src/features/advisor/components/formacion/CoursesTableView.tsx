import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { LearningRecord } from "@/core/api/dto";

interface Props {
  courses: LearningRecord[];
}

export const CoursesTableView = ({ courses }: Props) => {
  return (
    <div className="leads-table-container-scroll">
      <div className="leads-table-scroll-wrapper !h-auto max-h-[400px] border rounded-lg">
        <div className="leads-table-inner-scroll">
          <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Curso</TableHead>
            <TableHead>Horas</TableHead>
            <TableHead>Calificación</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{course.nombre}</TableCell>
              <TableCell>{course.horas}h</TableCell>
              <TableCell>
                {course.score ? (
                  <span className="font-semibold">{course.score}/100</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{new Date(course.fecha).toLocaleDateString()}</TableCell>
              <TableCell>
                {course.estado === "completo" ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completado
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pendiente</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </div>
      </div>
    </div>
  );
};
