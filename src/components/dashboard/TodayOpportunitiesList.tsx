import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IOpportunity } from "@/types/opportunities";
import { Target, Users, TrendingUp, Zap } from "lucide-react";

interface TodayOpportunitiesListProps {
  opportunities: IOpportunity[];
}

export function TodayOpportunitiesList({ opportunities }: TodayOpportunitiesListProps) {
  const today = new Date();
  
  const todayOpportunities = opportunities.filter(opp => {
    const startDate = new Date(opp.timeWindow.start);
    const endDate = new Date(opp.timeWindow.end);
    return today >= startDate && today <= endDate;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 'destructive';
      case 'media':
        return 'secondary';
      case 'baja':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return '🎂';
      case 'cross-sell':
        return '🎯';
      case 'retention':
        return '🔒';
      case 'reactivation':
        return '♻️';
      case 'campaign':
        return '📣';
      case 'ai-recommendation':
        return '🤖';
      case 'recent-contact':
        return '📞';
      case 'risk-advisory':
        return '⚠️';
      case 'churn-risk':
        return '🚨';
      case 'life-events':
        return '🎉';
      default:
        return '🎯';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          Oportunidades Activas ({todayOpportunities.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayOpportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay oportunidades activas para hoy
          </p>
        ) : (
          todayOpportunities.slice(0, 5).map((opportunity) => (
            <div key={opportunity.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{getTypeIcon(opportunity.type)}</span>
                  <span className="font-medium text-sm truncate">{opportunity.title}</span>
                  <Badge variant={getPriorityColor(opportunity.priority)} className="h-5 text-xs">
                    {opportunity.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate">
                  {opportunity.subtitle}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{opportunity.customerCount.toLocaleString()} clientes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{opportunity.score}%</span>
                  </div>
                  {opportunity.isHighlighted && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-600" />
                      <span className="text-yellow-600">Destacada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {todayOpportunities.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{todayOpportunities.length - 5} oportunidades más...
          </p>
        )}
      </CardContent>
    </Card>
  );
}