import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Award } from "lucide-react";
import type { LearningRecord } from "@/core/api/dto";

interface Props {
  courses: LearningRecord[];
}

export const CoursesCardsView = ({ courses }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow py-4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{course.nombre}</CardTitle>
              {course.estado === "completo" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{course.horas} horas</span>
            </div>

            {course.score && (
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold">{course.score}/100</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">{new Date(course.fecha).toLocaleDateString()}</span>
              <Badge variant={course.estado === "completo" ? "default" : "secondary"}>
                {course.estado === "completo" ? "Completado" : "Pendiente"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
