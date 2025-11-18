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
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/ficha-360")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {currentAdvisor.nombre}
            </h1>
            <span className="text-sm text-muted-foreground">
              {currentAdvisor.id}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Doc: {currentAdvisor.doc} | {currentAdvisor.region} - {currentAdvisor.zona}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/40 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Producción Mensual</p>
              <p className="text-2xl font-bold text-foreground">$42.5M</p>
              <p className="text-xs text-primary">+12.5% vs mes anterior</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Conversión</p>
              <p className="text-2xl font-bold text-foreground">28.4%</p>
              <p className="text-xs text-primary">+3.2% vs promedio</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Leads Activos</p>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-xs text-muted-foreground">18 en seguimiento</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Meta del Mes</p>
              <p className="text-2xl font-bold text-foreground">85%</p>
              <p className="text-xs text-primary">En buen camino</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-7 bg-muted/30">
          <TabsTrigger value="resumen" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="ventas" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Ventas</span>
          </TabsTrigger>
          <TabsTrigger value="formacion" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Formación</span>
          </TabsTrigger>
          <TabsTrigger value="datos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Datos</span>
          </TabsTrigger>
          <TabsTrigger value="metas" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Metas</span>
          </TabsTrigger>
          <TabsTrigger value="historial" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historial</span>
          </TabsTrigger>
          <TabsTrigger value="campanas" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
