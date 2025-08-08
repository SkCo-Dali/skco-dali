
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon | React.ComponentType<any>;
  description?: string;
}

export function KPICard({ title, value, change, changeType = 'neutral', icon: Icon, description }: KPICardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground'
  }[changeType];

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-3 px-3 md:px-6">
        <CardTitle className="text-xs md:text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pb-3 md:pb-4 px-3 md:px-6">
        <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">{value}</div>
        {change && (
          <p className={`text-xs md:text-sm ${changeColor} mb-1`}>
            {change}
          </p>
        )}
        {description && (
          <p className="text-sm md:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
