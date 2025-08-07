import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserGamificationProfile } from "@/types/gamification";

interface GamificationCardProps {
  profile: UserGamificationProfile;
  nextLevel?: { progress: number; pointsNeeded: number; nextLevel: any };
}

export function GamificationCard({ profile, nextLevel }: GamificationCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Mi Progreso</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{profile.level.icon}</span>
            <Badge variant="secondary" className="text-sm">
              {profile.level.name}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{profile.totalPoints}</p>
            <p className="text-sm text-muted-foreground">Puntos Totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary-foreground">#{profile.currentRank}</p>
            <p className="text-sm text-muted-foreground">Posición</p>
          </div>
        </div>

        {nextLevel && nextLevel.nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Progreso a {nextLevel.nextLevel.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {nextLevel.pointsNeeded} puntos restantes
              </span>
            </div>
            <Progress value={nextLevel.progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Esta semana:</span>
            <span className="font-medium">{profile.weeklyPoints} pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Leads gestionados:</span>
            <span className="font-medium">{profile.leadsManaged}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Chat Dali hoy:</span>
            <span className="font-medium">
              {profile.chatDaliUsedToday}/{profile.chatDaliDailyLimit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Conversión:</span>
            <span className="font-medium">{profile.conversionRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}