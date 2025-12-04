import React from 'react';
import { MarketOpportunity, MarketFilters, CATEGORY_CONFIG } from '@/types/marketDali';
import { OpportunityCard } from './OpportunityCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, SearchX } from 'lucide-react';

interface OpportunityListProps {
  opportunities: MarketOpportunity[];
  selectedOpportunity: MarketOpportunity | null;
  filters: MarketFilters;
  isLoading: boolean;
  onSelectOpportunity: (opportunity: MarketOpportunity) => void;
  onToggleFavorite: (opportunityId: string) => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({
  opportunities,
  selectedOpportunity,
  filters,
  isLoading,
  onSelectOpportunity,
  onToggleFavorite,
}) => {
  console.log('🎯 OpportunityList render:', { 
    opportunitiesCount: opportunities.length, 
    isLoading, 
    filters,
    firstOpp: opportunities[0] 
  });
  
  // Apply filters
  const filteredOpportunities = opportunities.filter(opp => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        opp.title.toLowerCase().includes(searchLower) ||
        opp.subtitle.toLowerCase().includes(searchLower) ||
        opp.description.toLowerCase().includes(searchLower) ||
        opp.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(opp.type)) {
      return false;
    }
    
    // Priority filter
    if (filters.priorities.length > 0 && !filters.priorities.includes(opp.priority)) {
      return false;
    }
    
    // Client count filter
    if (opp.clientCount < filters.minClients || opp.clientCount > filters.maxClients) {
      return false;
    }
    
    // Commission filter
    if (opp.potentialCommission < filters.minCommission || opp.potentialCommission > filters.maxCommission) {
      return false;
    }
    
    // Favorites filter
    if (filters.onlyFavorites && !opp.isFavorite) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-56 sm:h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (filteredOpportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No hay oportunidades
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {filters.search || filters.categories.length > 0 || filters.priorities.length > 0 || filters.onlyFavorites
            ? 'No encontramos oportunidades con los filtros seleccionados. Intenta ajustar tus criterios de búsqueda.'
            : 'No hay oportunidades disponibles en este momento. Vuelve más tarde.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Oportunidades disponibles
          </h2>
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {filteredOpportunities.length} de {opportunities.length}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredOpportunities.map(opportunity => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            isSelected={selectedOpportunity?.id === opportunity.id}
            onSelect={onSelectOpportunity}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
