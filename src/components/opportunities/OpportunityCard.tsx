import React from 'react';
import { Heart, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IOpportunity, OPPORTUNITY_TYPE_LABELS, PRIORITY_COLORS } from '@/types/opportunities';
import { opportunitiesService } from '@/services/mock/opportunitiesService';
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
    <Card 
      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-white shadow-md border-0 hover:shadow-lg"
      onClick={handleViewDetails}
    >
      <CardHeader className="pb-3 px-5 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              {opportunity.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors mb-0.5">
                {opportunity.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {opportunity.subtitle}
              </p>
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
      </CardHeader>

      <CardContent className="space-y-3 px-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-0.5 font-semibold ${getPriorityColor(opportunity.priority)}`}
          >
            {opportunity.priority.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium bg-blue-50 text-blue-700 border-blue-200">
            {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
          </Badge>
          {opportunity.expiresAt && (
            <Badge className="text-xs px-2 py-0.5 text-orange-600 bg-orange-50 border-orange-200">
              Vence {formatBogotaDate(opportunity.expiresAt)}
            </Badge>
          )}
        </div>

        {/* Customer Count */}
        <div className="flex items-center gap-2 text-sm">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <span className="font-bold text-blue-700">{formatCustomerCount(opportunity.customerCount)}</span>
            <span className="text-muted-foreground ml-1">clientes impactables</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-4">
        <div className="w-full flex items-center justify-center py-1.5 text-sm text-primary font-medium group-hover:text-primary/80 transition-colors">
          <span>Ver detalles</span>
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardFooter>
    </Card>
  );
};