import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, ChevronDown, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AchievementsSectionProps {
  points: number;
  period: string;
  goalMessage: string;
  goalProgress: number;
  onViewAllAchievements?: () => void;
  onPeriodChange?: (period: string) => void;
}

export function AchievementsSection({
  points,
  period,
  goalMessage,
  goalProgress,
  onViewAllAchievements,
  onPeriodChange,
}: AchievementsSectionProps) {
  return (
    <Card className="border-border bg-transparent">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="text-base md:text-lg font-semibold text-foreground">Tus logros en {period}</h3>
            <Select value={period} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-[140px] h-8 text-sm border-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="septiembre">septiembre</SelectItem>
                <SelectItem value="octubre">octubre</SelectItem>
                <SelectItem value="noviembre">noviembre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {onViewAllAchievements && (
            <Button
              onClick={onViewAllAchievements}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              Todos tus logros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Points Circle */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-primary bg-background flex flex-col items-center justify-center">
              <span className="text-2xl md:text-3xl font-bold text-foreground">{points.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Puntos</span>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="flex-1 w-full bg-white rounded-xl p-4">
            <p className="text-sm text-foreground mb-3">{goalMessage}</p>
            <div className="flex items-center gap-3">
              <Progress value={goalProgress} className="flex-1 h-2" />
              <span className="text-sm font-semibold text-foreground shrink-0">{goalProgress}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
