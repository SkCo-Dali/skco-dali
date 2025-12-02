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
    <div className="w-full max-w-full px-4 sm:px-4 py-3 sm:py-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/ficha-360")}
          className="hover:bg-primary/10 h-8 w-8 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-foreground truncate">
              {currentAdvisor.nombre}
            </h1>
            <span className="text-xs sm:text-sm text-muted-foreground">{currentAdvisor.id}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
            Doc: {currentAdvisor.doc} | {currentAdvisor.region} - {currentAdvisor.zona}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-2.5 sm:p-4">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Producción Mensual</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">$42.5M</p>
              <p className="text-[10px] sm:text-xs text-primary">+12.5% vs mes anterior</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-2.5 sm:p-4">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Conversión</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">28.4%</p>
              <p className="text-[10px] sm:text-xs text-primary">+3.2% vs promedio</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-2.5 sm:p-4">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Leads Activos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">24</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">18 en seguimiento</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-2.5 sm:p-4">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Meta del Mes</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">85%</p>
              <p className="text-[10px] sm:text-xs text-primary">En buen camino</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-6 bg-muted/30 h-auto p-1">
            <TabsTrigger
              value="resumen"
              className="gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger
              value="ventas"
              className="gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Ventas</span>
            </TabsTrigger>
            <TabsTrigger
              value="formacion"
              className="gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Formación</span>
            </TabsTrigger>
            <TabsTrigger
              value="metas"
              className="gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Metas</span>
            </TabsTrigger>
            <TabsTrigger
              value="historial"
              className="gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Historial</span>
            </TabsTrigger>
            <TabsTrigger
              value="campanas"
              className="gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Campañas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resumen">
          <AdvisorResumenTab advisor={currentAdvisor} />
        </TabsContent>
        <TabsContent value="ventas">
          <AdvisorVentasTab advisorId={currentAdvisor.id} />
        </TabsContent>
        <TabsContent value="formacion">
          <AdvisorFormacionTab advisorId={currentAdvisor.id} />
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
