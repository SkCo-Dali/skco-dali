import { Users, Calendar, ChevronRight, PartyPopper, FileText, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DaliOpportunity {
  id: string;
  title: string;
  icon: any;
  clients: number;
  dueDate: string;
  priority: "Alta" | "Media" | "Baja";
}

const mockOpportunities: DaliOpportunity[] = [
  {
    id: "1",
    title: "Celebra con tus clientes su día especial",
    icon: PartyPopper,
    clients: 5,
    dueDate: "10/10/2025",
    priority: "Alta",
  },
  {
    id: "2",
    title: "Acompaña a tus clientes en su declaración de renta",
    icon: FileText,
    clients: 16,
    dueDate: "18/10/2025",
    priority: "Alta",
  },
  {
    id: "3",
    title: "Cross-Sell con MFUND",
    icon: TrendingUp,
    clients: 12,
    dueDate: "20/10/2025",
    priority: "Media",
  },
];

export function MarketDaliOpportunities() {
  return (
    <Card className="p-4 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Oportunidades de Market Dali</h3>
        <Button variant="link" className="text-primary p-0 h-auto">
          Más oportunidades
        </Button>
      </div>

      <div className="space-y-3 flex-1">
        {mockOpportunities.slice(0, 3).map((opportunity) => {
          const IconComponent = opportunity.icon;
          return (
            <div
              key={opportunity.id}
              className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className="flex gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 items-center min-w-0">
                  <h4 className="font-medium mb-3 line-clamp-2">{opportunity.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{opportunity.clients} Clientes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Vence: {opportunity.dueDate}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        opportunity.priority === "Alta" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }
                    >
                      {opportunity.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              <ChevronRight className="absolute right-4 top-1/2 w-6 h-6 text-primary group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
