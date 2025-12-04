import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  changePercent?: number;
  changeLabel?: string;
  variant?: "success" | "warning" | "neutral";
  description?: string;
}

export function MetricCard({
  title,
  value,
  changePercent,
  changeLabel,
  variant = "neutral",
  description,
}: MetricCardProps) {
  const showChange = changePercent !== undefined;
  const isPositive = changePercent && changePercent > 0;
  const isNegative = changePercent && changePercent < 0;

  const badgeVariant = variant === "success" ? "default" : variant === "warning" ? "secondary" : "outline";

  const badgeBg =
    variant === "success"
      ? "bg-primary/20 text-primary border-0"
      : variant === "warning"
        ? "bg-primary/20 text-primary border-0"
        : "bg-muted text-muted-foreground border-border";

  return (
    <Card className="relative h-full pt-3 sm:pt-4 pb-4">
      <CardContent className="gap-2 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <p className="text-sm sm:text-base font-medium truncate pr-2">{title}</p>
          <p className="text-md md:text-lg font-bold mb-0.5">{value}</p>
        </div>
        {description && <p className="text-xs md:text-sm text-muted-foreground text-wrap">{description}</p>}
        {showChange && (
          <Badge
            className={`${badgeBg} inline-flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 sm:px-2 py-0.5 mt-2`}
          >
            <span className="text-[10px] sm:text-xs font-medium">{changePercent}%</span>
            {changeLabel && <span className="text-[10px] sm:text-xs">{changeLabel}</span>}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
