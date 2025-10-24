import { Users, Calendar, ChevronRight, PartyPopper, FileText, TrendingUp, ArrowRight, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <Card className="p-4 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
       <div className="flex items-center gap-2">
        <ShoppingBag className="w-5 h-5" />
        <h3 className="text-lg font-semibold truncate">Oportunidades de Market Dali</h3>
        <Button variant="link" className="text-primary p-0 h-auto"> onClick={() => navigate("/oportunidades")}>
          Más oportunidades
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
       </div>
      </div>

      <div className="space-y-3 flex-1">
        {mockOpportunities.slice(0, 3).map((opportunity) => {
          const IconComponent = opportunity.icon;
          return (
            <div
              key={opportunity.id}
              className="
    group relative flex items-center justify-between gap-3
    p-4 rounded-xl transition-colors cursor-pointer
    hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
  "
            >
              {/* Izquierda */}
              <div className="flex gap-3 flex-1 min-w-0" onClick={() => navigate(`/oportunidades/${opportunity.id}`)}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-2 line-clamp-2 truncate">{opportunity.title}</h4>

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

              {/* Derecha */}
              <ChevronRight
                aria-hidden
                className="w-6 h-6 text-muted-foreground group-hover:text-primary self-center shrink-0 transition-colors"
                onClick={() => navigate(`/oportunidades/${opportunity.id}`)}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
