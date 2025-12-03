import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Star, Zap } from "lucide-react";
import { GamificationStats as Stats } from "@/types/gamification";

interface GamificationStatsProps {
  stats: Stats;
}

export function GamificationStats({ stats }: GamificationStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Participantes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Total de asesores activos</p>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averagePoints}</div>
          <p className="text-xs text-muted-foreground">Puntos promedio por usuario</p>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.topPerformer.points}</div>
          <p className="text-xs text-muted-foreground">{stats.topPerformer.userName}</p>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Líder Semanal</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.weeklyLeader.weeklyPoints}</div>
          <p className="text-xs text-muted-foreground">{stats.weeklyLeader.userName}</p>
        </CardContent>
      </Card>
    </div>
  );
}
