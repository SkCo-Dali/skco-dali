import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Table as TableIcon, Plus } from "lucide-react";
import learningRecordsData from "@/mocks/learningRecords.json";
import certificationsData from "@/mocks/certifications.json";
import { CoursesTableView } from "./formacion/CoursesTableView";
import { CoursesCardsView } from "./formacion/CoursesCardsView";
import { CertificationsTableView } from "./formacion/CertificationsTableView";
import { CertificationsCardsView } from "./formacion/CertificationsCardsView";
import type { LearningRecord, Certification } from "@/core/api/dto";

interface Props {
  advisorId: string;
}

type ViewMode = "table" | "cards";

export const AdvisorFormacionTab = ({ advisorId }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const courses = (learningRecordsData as LearningRecord[]).filter(
    (record) => record.advisorId === advisorId
  );

  const certifications = (certificationsData as Certification[]).filter(
    (cert) => cert.advisorId === advisorId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Formación & Certificaciones</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 w-8 p-0"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Asignar Curso
          </Button>
        </div>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList>
          <TabsTrigger value="courses">
            Cursos Completados ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="certifications">
            Certificaciones ({certifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          {viewMode === "table" ? (
            <CoursesTableView courses={courses} />
          ) : (
            <CoursesCardsView courses={courses} />
          )}
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          {viewMode === "table" ? (
            <CertificationsTableView certifications={certifications} />
          ) : (
            <CertificationsCardsView certifications={certifications} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
