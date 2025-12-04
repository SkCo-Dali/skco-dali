import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { GamificationRanking } from "@/types/gamification";

interface RankingTableProps {
  rankings: GamificationRanking[];
  showWeekly?: boolean;
}

export function RankingTable({ rankings, showWeekly = false }: RankingTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold">#{rank}</span>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="py-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {showWeekly ? "Ranking Semanal" : "Ranking General"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          {rankings.map((ranking) => (
            <div
              key={ranking.userId}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                ranking.isCurrentUser ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">{getRankIcon(ranking.rank)}</div>

                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{getInitials(ranking.userName)}</AvatarFallback>
                </Avatar>

                <div>
                  <p className={`font-medium ${ranking.isCurrentUser ? "text-primary" : ""}`}>
                    {ranking.userName}
                    {ranking.isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Tú
                      </Badge>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{ranking.level.icon}</span>
                    <span className="text-xs text-muted-foreground">{ranking.level.name}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold">{showWeekly ? ranking.weeklyPoints : ranking.totalPoints}</p>
                <p className="text-xs text-muted-foreground">puntos</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
