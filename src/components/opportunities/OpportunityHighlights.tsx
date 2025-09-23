import React from 'react';
import { Heart, Users, TrendingUp, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { IOpportunity, OPPORTUNITY_TYPE_LABELS, PRIORITY_COLORS } from '@/types/opportunities';
import { opportunitiesService } from '@/services/opportunitiesService';
import { useToast } from '@/hooks/use-toast';

interface OpportunityHighlightsProps {
  onViewDetails: (opportunity: IOpportunity) => void;
}

export const OpportunityHighlights: React.FC<OpportunityHighlightsProps> = ({
  onViewDetails
}) => {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = React.useState<IOpportunity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const loadHighlightedOpportunities = async () => {
      try {
        const data = await opportunitiesService.getHighlightedOpportunities();
        setOpportunities(data);
      } catch (error) {
        console.error('Error loading highlighted opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHighlightedOpportunities();
  }, []);

  const handleFavoriteToggle = (e: React.MouseEvent, opportunityId: string) => {
    e.stopPropagation();
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    const newFavoriteState = opportunitiesService.toggleFavorite(opportunityId);
    
    toast({
      title: newFavoriteState ? "Agregado a favoritas" : "Removido de favoritas",
      description: opportunity.title,
      duration: 2000,
    });
  };

  const formatCustomerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.baja;
  };

  if (loading) {
    return (
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            🌟 Oportunidades Destacadas
          </h2>
          <p className="text-sm text-muted-foreground">
            Las mejores oportunidades comerciales para hoy
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Opportunities Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opportunities.map((opportunity) => (
            <Card 
              key={opportunity.id} 
              className={`group transition-all duration-200 cursor-pointer border-border/50 relative ${
                opportunity.isActive 
                  ? 'hover:shadow-md hover:border-primary/20' 
                  : 'bg-gray-50 opacity-75'
              }`}
              onClick={() => onViewDetails(opportunity)}
            >
              <CardContent className={`p-4 space-y-3 ${!opportunity.isActive ? 'grayscale' : ''}`}>
                {/* Inactive overlay */}
                {!opportunity.isActive && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-lg">
                    <div className="bg-red-600 text-white px-2 py-1.5 rounded shadow-lg text-center transform -rotate-12">
                      <div className="flex items-center gap-1 mb-0.5">
                        <X className="h-3 w-3" />
                        <span className="font-bold text-xs">Ya fue aprovechada</span>
                      </div>
                      <div className="text-xs opacity-90 leading-tight">
                        Regresa pronto para nuevos Leads
                      </div>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`text-lg w-8 h-8 flex items-center justify-center rounded-full ${
                      opportunity.isActive ? 'bg-primary/10' : 'bg-gray-100'
                    }`}>
                      {opportunity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-sm line-clamp-1 transition-colors ${
                        opportunity.isActive 
                          ? 'group-hover:text-primary' 
                          : 'text-gray-500'
                      }`}>
                        {opportunity.title}
                      </h3>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleFavoriteToggle(e, opportunity.id)}
                    className="h-6 w-6 shrink-0 hover:bg-red-50 hover:text-red-500"
                    disabled={!opportunity.isActive}
                  >
                    <Heart 
                      className={`h-3 w-3 ${
                        opportunity.isFavorite 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-1.5 py-0.5 ${getPriorityColor(opportunity.priority)}`}
                  >
                    {opportunity.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{formatCustomerCount(opportunity.customerCount)}</span>
                    <span className="text-muted-foreground">clientes</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium text-primary">{opportunity.score}/100</span>
                    </div>
                    <Progress value={opportunity.score} className="h-1" />
                  </div>
                </div>

                {/* CTA */}
                <Button 
                  size="sm" 
                  variant={opportunity.isActive ? "outline" : "secondary"}
                  className={`w-full text-xs h-7 ${
                    !opportunity.isActive ? 'cursor-not-allowed text-gray-500' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(opportunity);
                  }}
                  disabled={!opportunity.isActive}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {opportunity.isActive ? 'Ver detalles' : 'No disponible'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>{opportunities.length} oportunidades destacadas disponibles</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsCollapsed(false)}
            className="text-xs h-6 px-2 ml-auto"
          >
            Mostrar
          </Button>
        </div>
      )}
    </div>
  );
};