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

export function MetricCard({ title, value, changePercent, changeLabel, variant = "neutral" }: MetricCardProps) {
  const showChange = changePercent !== undefined;
  const isPositive = changePercent && changePercent > 0;
  const isNegative = changePercent && changePercent < 0;

  const badgeVariant = variant === "success" ? "default" : variant === "warning" ? "secondary" : "outline";

  const badgeBg =
    variant === "success"
      ? "bg-primary/20 text-primary border-0"
      : variant === "warning"
        ? "bg-destructive/20 text-destructive border-0"
        : "bg-muted text-muted-foreground border-border";

  return (
    <Card className="relative h-full">
      <CardContent className="pt-4 pb-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        {description && <p className="text-xs md:text-xs text-muted-foreground">{description}</p>}
      </CardContent>
      {showChange && (
        <Badge
          className={`${badgeBg} absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full px-2 py-0.5`}
        >
          {isPositive && <TrendingUp className="h-3 w-3" />}
          {isNegative && <TrendingDown className="h-3 w-3" />}
          <span className="text-xs font-medium">{changePercent}%</span>
          {changeLabel && <span className="text-xs ml-1">{changeLabel}</span>}
        </Badge>
      )}
    </Card>
  );
}
