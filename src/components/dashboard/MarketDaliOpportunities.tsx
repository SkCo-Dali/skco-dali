import {
  Users,
  Calendar,
  ChevronRight,
  PartyPopper,
  FileText,
  TrendingUp,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <Card className="p-4 max-h-[450px] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold truncate">Market Dali</h3>
        <Button variant="link" className="text-primary p-0 h-auto" onClick={() => navigate("/market-dali")}>
          Más oportunidades
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-full">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3 flex-1 pr-4">
          {mockOpportunities.slice(0, 3).map((opportunity) => {
            const IconComponent = opportunity.icon;
            return (
              <div
                key={opportunity.id}
                className="group relative flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 p-2 md:p-4 rounded-xl transition-colors cursor-pointer hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => navigate(`/market-dali/${opportunity.id}`)}
              >
                {/* Contenido principal */}
                <div className="flex flex-col md:flex-row md:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mb-2 md:mb-0">
                    <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs md:text-base mb-1 md:mb-2 line-clamp-2">{opportunity.title}</h4>

                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{opportunity.clients}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-xs md:text-sm">{opportunity.dueDate}</span>
                      </div>

                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          opportunity.priority === "Alta" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {opportunity.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Chevron - solo visible en desktop */}
                <ChevronRight
                  aria-hidden
                  className="hidden md:block w-6 h-6 text-muted-foreground group-hover:text-primary self-center shrink-0 transition-colors"
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
