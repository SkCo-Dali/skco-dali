import React from 'react';
import { Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IOpportunity, OPPORTUNITY_TYPE_LABELS, PRIORITY_COLORS } from '@/types/opportunities';
import { opportunitiesService } from '@/services/opportunitiesService';
import { useToast } from '@/hooks/use-toast';
import { formatBogotaDate } from '@/utils/dateUtils';

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

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newFavoriteState = await opportunitiesService.toggleFavorite(opportunity.id);
      setIsFavorite(newFavoriteState);
      onFavoriteChange?.(opportunity.id, newFavoriteState);
      
      toast({
        title: newFavoriteState ? "Agregado a favoritas" : "Removido de favoritas",
        description: opportunity.title,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de favorito",
        variant: "destructive",
        duration: 3000,
      });
    }
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white shadow-md border-0 hover:shadow-lg h-fit w-full max-w-[280px]"
            onClick={handleViewDetails}
          >
            {/* Top section with favorite button */}
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle}
                className="h-6 w-6 shrink-0 hover:bg-red-50 hover:text-red-500"
              >
                <Heart 
                  className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                />
              </Button>
            </div>

            <CardContent className="px-3 pb-3 pt-1 text-center space-y-2.5">
              {/* Large emoji as "product image" */}
              <div className="flex justify-center">
                <div className="text-6xl w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                  {opportunity.icon}
                </div>
              </div>

              {/* Title - centered */}
              <div>
                <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors text-center">
                  {opportunity.title}
                </h3>
              </div>

              {/* Priority and Type Badges */}
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1.5 py-0.5 font-semibold ${getPriorityColor(opportunity.priority)}`}
                >
                  {opportunity.priority.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 font-medium bg-blue-50 text-blue-700 border-blue-200">
                  {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
                </Badge>
              </div>

              {/* Customer Count */}
              <div className="flex items-center justify-center gap-1.5 text-xs">
                <div className="p-1 bg-blue-50 rounded">
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <span className="font-bold text-blue-700">{formatCustomerCount(opportunity.customerCount)}</span>
                  <span className="text-muted-foreground ml-1">clientes</span>
                </div>
              </div>

              {/* Expiration Date */}
              {opportunity.expiresAt && (
                <div className="flex justify-center">
                  <Badge className="text-xs px-1.5 py-0.5 text-orange-600 bg-orange-50 border-orange-200">
                    Vence {formatBogotaDate(opportunity.expiresAt)}
                  </Badge>
                </div>
              )}

              {/* Action Button */}
              <Button 
                variant="default" 
                size="sm" 
                className="w-full h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-white mt-4"
              >
                Ver oportunidad →
              </Button>
            </CardContent>
          </Card>
        </TooltipTrigger>
        {opportunity.subtitle && (
          <TooltipContent>
            <p className="max-w-xs text-sm">{opportunity.subtitle}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};