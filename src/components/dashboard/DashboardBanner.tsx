import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface DashboardBannerProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
}

export function DashboardBanner({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  variant = 'primary' 
}: DashboardBannerProps) {
  const bgColorClass = {
    primary: 'bg-primary/10',
    secondary: 'bg-secondary',
    accent: 'bg-accent/10'
  }[variant];

  return (
    <Card className={`${bgColorClass} border-0 p-4 md:p-6`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {actionLabel && onAction && (
          <Button 
            onClick={onAction}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            size="sm"
          >
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
