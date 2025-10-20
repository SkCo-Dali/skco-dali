import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";

interface DashboardBannerProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "primary" | "secondary" | "accent";
}

export function DashboardBanner({
  title,
  description,
  actionLabel,
  onAction,
  variant = "primary",
}: DashboardBannerProps) {
  const bgColorClass = {
    primary: "bg-primary/10",
    secondary: "bg-secondary",
    accent: "bg-accent/10",
  }[variant];

  return (
    <Card className={`${bgColorClass} border-0 p-4 md:p-6`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction && (
          <ChevronRight onClick={onAction} className="h-10 w-10 text-primary cursor-pointer hover:text-primary/80" />
        )}
      </div>
    </Card>
  );
}
