import React from 'react';
import { Heart, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IOpportunity, OPPORTUNITY_TYPE_LABELS, PRIORITY_COLORS } from '@/types/opportunities';
import { opportunitiesService } from '@/services/mock/opportunitiesService';
import { useToast } from '@/hooks/use-toast';

interface OpportunityCardProps {
  opportunity: IOpportunity;
  onViewDetails: (opportunity: IOpportunity) => void;
  onFavoriteChange?: (opportunityId: string, isFavorite: boolean) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onViewDetails,
  onFavoriteChange
}) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = React.useState(
    opportunitiesService.isFavorite(opportunity.id)
  );

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = opportunitiesService.toggleFavorite(opportunity.id);
    setIsFavorite(newFavoriteState);
    onFavoriteChange?.(opportunity.id, newFavoriteState);
    
    toast({
      title: newFavoriteState ? "Agregado a favoritas" : "Removido de favoritas",
      description: opportunity.title,
      duration: 2000,
    });
  };

  const handleViewDetails = () => {
    onViewDetails(opportunity);
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
              {opportunity.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                {opportunity.title}
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteToggle}
            className="h-8 w-8 shrink-0 hover:bg-red-50 hover:text-red-500"
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
            />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {opportunity.subtitle}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-0.5 ${getPriorityColor(opportunity.priority)}`}
          >
            {opportunity.priority.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
          </Badge>
          {/* Time Window (if applicable) */}
        {opportunity.expiresAt && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            ⏰ Vence {new Date(opportunity.expiresAt).toLocaleDateString('es-ES')}
          </div>
      )}
        </div>

        {/* Customer Count */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatCustomerCount(opportunity.customerCount)}</span>
          <span className="text-muted-foreground">clientes impactables</span>
        </div>

        {/* Score Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Score de Impacto</span>
            <span className="text-sm font-bold text-primary">{opportunity.score}/100</span>
          </div>
          <Progress 
            value={opportunity.score} 
            className="h-2"
          />
        </div>

        {/* Time Window (if applicable) */}
        {opportunity.expiresAt && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            ⏰ Vence {new Date(opportunity.expiresAt).toLocaleDateString('es-ES')}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleViewDetails}
          className="w-full group/btn"
          variant="outline"
        >
          Ver detalles
          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};