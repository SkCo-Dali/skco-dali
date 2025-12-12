import React from 'react';
import { MarketOpportunity, MarketFilters, CATEGORY_CONFIG } from '@/types/marketDali';
import { OpportunityCard } from './OpportunityCard';
import { MarketDaliLoadingAnimation } from './MarketDaliLoadingAnimation';
import { Store, SearchX, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // Apply filters
  const filteredOpportunities = opportunities.filter(opp => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        opp.title?.toLowerCase().includes(searchLower) ||
        opp.subtitle?.toLowerCase().includes(searchLower) ||
        opp.description?.toLowerCase().includes(searchLower) ||
        opp.tags?.some(tag => tag.toLowerCase().includes(searchLower));
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
    
    // Client count filter - handle undefined/null/NaN safely
    const clientCount = opp.clientCount ?? 0;
    if (clientCount < filters.minClients || clientCount > filters.maxClients) {
      return false;
    }
    
    // Commission filter - handle undefined/null/NaN safely
    const commission = opp.potentialCommission ?? 0;
    if (commission < filters.minCommission || commission > filters.maxCommission) {
      return false;
    }
    
    // Favorites filter
    if (filters.onlyFavorites && !opp.isFavorite) {
      return false;
    }
    
    return true;
  });

  // Separate favorites and non-favorites, both sorted by id
  const favoriteOpportunities = filteredOpportunities
    .filter(opp => opp.isFavorite)
    .sort((a, b) => a.id.localeCompare(b.id));
  
  const regularOpportunities = filteredOpportunities
    .filter(opp => !opp.isFavorite)
    .sort((a, b) => a.id.localeCompare(b.id));

  const totalFiltered = favoriteOpportunities.length + regularOpportunities.length;

  console.log('🎯 OpportunityList filtered:', { 
    totalCount: opportunities.length, 
    filteredCount: totalFiltered,
    favoritesCount: favoriteOpportunities.length,
    regularCount: regularOpportunities.length,
    firstOpp: opportunities[0],
    firstFiltered: favoriteOpportunities[0] || regularOpportunities[0]
  });

  if (isLoading) {
    return <MarketDaliLoadingAnimation message="Cargando oportunidades..." />;
  }

  if (totalFiltered === 0) {
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
    <div className="space-y-6">
      {/* Favorites Section */}
      {favoriteOpportunities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Mis favoritos
            </h2>
            <span className="text-xs sm:text-sm text-muted-foreground">
              ({favoriteOpportunities.length})
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {favoriteOpportunities.map(opportunity => (
                <motion.div
                  key={opportunity.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <OpportunityCard
                    opportunity={opportunity}
                    isSelected={selectedOpportunity?.id === opportunity.id}
                    onSelect={onSelectOpportunity}
                    onToggleFavorite={onToggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Regular Opportunities Section */}
      {regularOpportunities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                {favoriteOpportunities.length > 0 ? 'Otras oportunidades' : 'Oportunidades disponibles'}
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {regularOpportunities.length} de {opportunities.length - favoriteOpportunities.length}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {regularOpportunities.map(opportunity => (
                <motion.div
                  key={opportunity.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <OpportunityCard
                    opportunity={opportunity}
                    isSelected={selectedOpportunity?.id === opportunity.id}
                    onSelect={onSelectOpportunity}
                    onToggleFavorite={onToggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
