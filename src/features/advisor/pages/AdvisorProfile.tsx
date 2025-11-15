import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, User, TrendingUp, GraduationCap, FileText, Target, History, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProviders } from "@/core/di/providers";
import { useAdvisorStore } from "../store/advisorStore";
import { AdvisorResumenTab } from "../components/AdvisorResumenTab";
import { AdvisorVentasTab } from "../components/AdvisorVentasTab";
import { AdvisorFormacionTab } from "../components/AdvisorFormacionTab";
import { AdvisorDatosTab } from "../components/AdvisorDatosTab";
import { AdvisorMetasTab } from "../components/AdvisorMetasTab";
import { AdvisorHistorialTab } from "../components/AdvisorHistorialTab";
import { AdvisorCampanasTab } from "../components/AdvisorCampanasTab";

export const AdvisorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { advisors: advisorProvider } = useProviders();
  const { currentAdvisor, setCurrentAdvisor } = useAdvisorStore();
  const [isLoading, setIsLoading] = useState(true);

  const activeTab = searchParams.get("tab") || "resumen";

  useEffect(() => {
    if (id) {
      loadAdvisor(id);
    }
  }, [id]);

  const loadAdvisor = async (advisorId: string) => {
    setIsLoading(true);
    try {
      const advisor = await advisorProvider.getAdvisorById(advisorId);
      setCurrentAdvisor(advisor);
    } catch (error) {
      console.error("Error loading advisor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!currentAdvisor) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Asesor no encontrado</p>
            <Button onClick={() => navigate("/ficha-360")} className="mt-4">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/ficha-360")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-2xl">{currentAdvisor.nombre}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentAdvisor.id} | Doc: {currentAdvisor.doc} | {currentAdvisor.region} - {currentAdvisor.zona}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="resumen" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="ventas" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Ventas</span>
          </TabsTrigger>
          <TabsTrigger value="formacion" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Formación</span>
          </TabsTrigger>
          <TabsTrigger value="datos" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Datos</span>
          </TabsTrigger>
          <TabsTrigger value="metas" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Metas</span>
          </TabsTrigger>
          <TabsTrigger value="historial" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historial</span>
          </TabsTrigger>
          <TabsTrigger value="campanas" className="gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Campañas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <AdvisorResumenTab advisor={currentAdvisor} />
        </TabsContent>
        <TabsContent value="ventas">
          <AdvisorVentasTab advisorId={currentAdvisor.id} />
        </TabsContent>
        <TabsContent value="formacion">
          <AdvisorFormacionTab advisorId={currentAdvisor.id} />
        </TabsContent>
        <TabsContent value="datos">
          <AdvisorDatosTab advisor={currentAdvisor} />
        </TabsContent>
        <TabsContent value="metas">
          <AdvisorMetasTab advisorId={currentAdvisor.id} />
        </TabsContent>
        <TabsContent value="historial">
          <AdvisorHistorialTab advisorId={currentAdvisor.id} />
        </TabsContent>
        <TabsContent value="campanas">
          <AdvisorCampanasTab advisorId={currentAdvisor.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
