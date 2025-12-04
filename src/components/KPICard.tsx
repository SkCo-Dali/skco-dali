import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon | React.ComponentType<any>;
  description?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  isActive = false,
  onClick,
}: KPICardProps) {
  const changeColor = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-muted-foreground",
  }[changeType];

  return (
    <Card
      className={`hover:shadow-md transition-all h-full pt-4 pb-4 ${onClick ? "cursor-pointer" : ""} ${
        isActive ? "bg-primary/10 border-primary shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
        <CardTitle className="text-sm sm:text-base font-medium truncate pr-2">{title}</CardTitle>
        <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent>
        <div className="text-md md:text-lg font-bold mb-0.5">{value}</div>
        {change && <p className={`text-xs md:text-sm ${changeColor} mb-0.5`}>{change}</p>}
        {description && <p className="text-xs md:text-sm text-muted-foreground text-wrap">{description}</p>}
      </CardContent>
    </Card>
  );
}
