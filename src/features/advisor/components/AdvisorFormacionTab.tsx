import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Table as TableIcon, Plus, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

  const allCourses = (learningRecordsData as LearningRecord[]).filter((record) => record.advisorId === advisorId);
  const allCertifications = (certificationsData as Certification[]).filter((cert) => cert.advisorId === advisorId);

  const courses = useMemo(() => {
    if (!searchTerm.trim()) return allCourses;
    const term = searchTerm.toLowerCase();
    return allCourses.filter((course) => course.nombre.toLowerCase().includes(term));
  }, [allCourses, searchTerm]);

  const certifications = useMemo(() => {
    if (!searchTerm.trim()) return allCertifications;
    const term = searchTerm.toLowerCase();
    return allCertifications.filter(
      (cert) => cert.nombre.toLowerCase().includes(term) || cert.entidad.toLowerCase().includes(term),
    );
  }, [allCertifications, searchTerm]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-md sm:text-lg font-semibold">Formación & Certificaciones</h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" className="text-xs sm:text-sm h-8 w-8 p-0 bg-[#00C73D] hover:bg-[#00C73D]/90">
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
            className="h-8 w-8 p-0 bg-[#00C73D] hover:bg-[#00C73D]/90"
          >
            {viewMode === "table" ? <LayoutGrid className="h-4 w-4" /> : <TableIcon className="h-4 w-4" />}
          </Button>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Buscar curso o certificación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="courses" className="text-xs sm:text-sm">
            Cursos ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="certifications" className="text-xs sm:text-sm">
            Certificaciones ({certifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4 sm:mt-6">
          {viewMode === "table" ? <CoursesTableView courses={courses} /> : <CoursesCardsView courses={courses} />}
        </TabsContent>

        <TabsContent value="certifications" className="mt-4 sm:mt-6">
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
