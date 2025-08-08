import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Clock, Calendar } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { GamificationCard } from "@/components/GamificationCard";
import { RankingTable } from "@/components/RankingTable";
import { GamificationStats } from "@/components/GamificationStats";
import { toast } from "sonner";

export default function Gamification() {
  const { 
    profile, 
    rankings, 
    stats, 
    notifications,
    loading, 
    error,
    getProgressToNextLevel,
    recordChatDaliUsage,
    setNotifications
  } = useGamification();

  const [activeTab, setActiveTab] = useState("overview");

  const handleTestChatDali = async () => {
    const success = await recordChatDaliUsage();
    if (success) {
      toast.success("¡+5 puntos por usar Chat Dali!", {
        description: "Seguí así para subir de nivel",
      });
    } else {
      toast.warning("Límite diario alcanzado", {
        description: "Has usado todos tus Chat Dali por hoy",
      });
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando datos de gamificación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !stats) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || "Error al cargar datos"}</p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextLevelProgress = getProgressToNextLevel();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gamificación</h1>
          <p className="text-muted-foreground">
            Compite, mejora y alcanza nuevos niveles
          </p>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card key={notification.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{notification.icon}</span>
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Overview */}
      <GamificationStats stats={stats} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-full px-0 py-0 my-0">  
          <TabsTrigger value="overview" className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c83c] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200">
            <Target className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="ranking" className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c83c] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200">
            <Trophy className="h-4 w-4 mr-2" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="weekly" className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c83c] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200">
            <Calendar className="h-4 w-4 mr-2" />
            Semanal
          </TabsTrigger>
          <TabsTrigger value="progress" className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c83c] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200">
            <Clock className="h-4 w-4 mr-2" />
            Mi Progreso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <GamificationCard 
                profile={profile} 
                nextLevel={nextLevelProgress} 
              />
            </div>
            <div className="lg:col-span-2">
              <RankingTable rankings={rankings.slice(0, 5)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ranking">
          <RankingTable rankings={rankings} />
        </TabsContent>

        <TabsContent value="weekly">
          <RankingTable rankings={rankings} showWeekly={true} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GamificationCard 
              profile={profile} 
              nextLevel={nextLevelProgress} 
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas Detalladas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Leads gestionados:</span>
                    <span className="font-medium">{profile.leadsManaged}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tiempo resp. promedio:</span>
                    <span className="font-medium">{profile.averageResponseTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tasa de conversión:</span>
                    <span className="font-medium">{profile.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Días activos (semana):</span>
                    <span className="font-medium">{profile.weeklyActivity}/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Uso Chat Dali total:</span>
                    <span className="font-medium">{profile.chatDaliUsage}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Límites Diarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Chat Dali</span>
                      <span className="text-sm">
                        {profile.chatDaliUsedToday}/{profile.chatDaliDailyLimit}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${(profile.chatDaliUsedToday / profile.chatDaliDailyLimit) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Máximo {profile.chatDaliDailyLimit * 5} puntos por día
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}