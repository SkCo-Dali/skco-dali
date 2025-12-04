import React from 'react';
import { MarketOpportunity, CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/types/marketDali';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OpportunityCardProps {
  opportunity: MarketOpportunity;
  isSelected: boolean;
  onSelect: (opportunity: MarketOpportunity) => void;
  onToggleFavorite: (opportunityId: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  isSelected,
  onSelect,
  onToggleFavorite,
}) => {
  const categoryConfig = CATEGORY_CONFIG[opportunity.type];
  const priorityConfig = PRIORITY_CONFIG[opportunity.priority];
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(opportunity.id);
  };

  const isExpired = !opportunity.isActive;
  const hasBeenUsed = !!opportunity.lastCampaignName;

  return (
    <Card
      className={cn(
        'relative cursor-pointer overflow-hidden',
        'border-2 transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40',
        'active:scale-[0.98]',
        isSelected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'border-border',
        (isExpired || hasBeenUsed) && 'opacity-70'
      )}
      onClick={() => onSelect(opportunity)}
    >
      {/* Cover - subtle with accent border */}
      <div className="h-16 sm:h-20 relative bg-muted/50 border-b border-border">
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl sm:text-4xl">{opportunity.icon}</span>
        </div>
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors shadow-sm"
        >
          <Heart 
            className={cn(
              'h-4 w-4 sm:h-5 sm:w-5 transition-colors',
              opportunity.isFavorite 
                ? 'fill-red-500 text-red-500' 
                : 'text-muted-foreground'
            )} 
          />
        </button>

        {/* Category badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {categoryConfig.icon} {categoryConfig.label}
          </Badge>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4">
        {/* Title */}
        <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 mb-1">
          {opportunity.title}
        </h3>
        
        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
          {opportunity.subtitle}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="font-medium">{opportunity.clientCount}</span>
          </div>
          
          {opportunity.potentialCommission > 0 && (
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>${opportunity.potentialCommission.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Priority badge */}
        <div className="flex items-center justify-between gap-2">
          <Badge 
            variant="outline" 
            className={cn('text-xs', priorityConfig.color)}
          >
            {priorityConfig.label}
          </Badge>

          {hasBeenUsed && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
              ✓ Cargado
            </Badge>
          )}
        </div>

        {/* Tags */}
        {opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {opportunity.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {opportunity.tags.length > 2 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{opportunity.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
