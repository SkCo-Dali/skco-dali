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
    <Card className="bg-transparent shadow-none border-0 pt-4">
      <CardHeader className="px-4 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="text-sm sm:text-md font-semibold text-foreground">Tus logros en</h3>
            <Select value={period} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-[120px] sm:w-[140px] h-7 sm:h-8 font-semibold text-sm sm:text-md text-primary border-0 bg-transparent px-1">
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              size="sm"
            >
              Todos tus logros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-row items-center gap-3 sm:gap-6">
          {/* Points Circle */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-[#8FE000] to-[#00C73D] p-1">
              <div className="w-full h-full rounded-full bg-[#F6FCF2] flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {points.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Puntos</span>
              </div>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="flex flex-col gap-2 flex-1 w-full bg-white rounded-xl p-3 sm:p-4 shadow-md">
            <p className="text-xs sm:text-sm text-foreground">{goalMessage}</p>
            <div className="flex items-center gap-2 sm:gap-3">
              <Progress value={goalProgress} className="flex-1 h-2" />
              <span className="text-xs sm:text-sm font-semibold text-foreground shrink-0">{goalProgress}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
