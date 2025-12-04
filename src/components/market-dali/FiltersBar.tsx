import React, { useState } from 'react';
import { MarketFilters, CATEGORY_CONFIG, PRIORITY_CONFIG, OpportunityCategory } from '@/types/marketDali';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Heart,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FiltersBarProps {
  filters: MarketFilters;
  onFiltersChange: (filters: Partial<MarketFilters>) => void;
  onResetFilters: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = Object.entries(CATEGORY_CONFIG) as [OpportunityCategory, typeof CATEGORY_CONFIG[OpportunityCategory]][];
  const priorities = Object.entries(PRIORITY_CONFIG) as ['alta' | 'media' | 'baja', typeof PRIORITY_CONFIG['alta']][];

  const toggleCategory = (category: OpportunityCategory) => {
    const current = filters.categories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    onFiltersChange({ categories: updated });
  };

  const togglePriority = (priority: 'alta' | 'media' | 'baja') => {
    const current = filters.priorities;
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority];
    onFiltersChange({ priorities: updated });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.categories.length > 0 ||
    filters.priorities.length > 0 ||
    filters.onlyFavorites;

  return (
    <div className="space-y-3 mb-6">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar oportunidades..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9 h-10"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        <Button
          variant={filters.onlyFavorites ? 'default' : 'outline'}
          size="icon"
          onClick={() => onFiltersChange({ onlyFavorites: !filters.onlyFavorites })}
          className="h-10 w-10 flex-shrink-0"
        >
          <Heart className={cn('h-4 w-4', filters.onlyFavorites && 'fill-current')} />
        </Button>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="h-10 gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && !isExpanded && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {(filters.categories.length || 0) + (filters.priorities.length || 0) + (filters.onlyFavorites ? 1 : 0)}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Expandable filters */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            {/* Categories */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Categorías
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(([key, config]) => (
                  <Badge
                    key={key}
                    variant={filters.categories.includes(key) ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors hover:bg-primary/80"
                    onClick={() => toggleCategory(key)}
                  >
                    {config.icon} {config.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Priorities */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Prioridad
              </label>
              <div className="flex flex-wrap gap-2">
                {priorities.map(([key, config]) => (
                  <Badge
                    key={key}
                    variant={filters.priorities.includes(key) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      filters.priorities.includes(key) 
                        ? '' 
                        : config.color
                    )}
                    onClick={() => togglePriority(key)}
                  >
                    {config.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reset button */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetFilters}
                  className="text-muted-foreground"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active filters chips (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map(cat => (
            <Badge 
              key={cat} 
              variant="secondary"
              className="gap-1 pr-1"
            >
              {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
              <button 
                onClick={() => toggleCategory(cat)}
                className="ml-1 p-0.5 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.priorities.map(prio => (
            <Badge 
              key={prio} 
              variant="secondary"
              className="gap-1 pr-1"
            >
              {PRIORITY_CONFIG[prio].label}
              <button 
                onClick={() => togglePriority(prio)}
                className="ml-1 p-0.5 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.onlyFavorites && (
            <Badge 
              variant="secondary"
              className="gap-1 pr-1"
            >
              <Heart className="h-3 w-3 fill-current" /> Favoritos
              <button 
                onClick={() => onFiltersChange({ onlyFavorites: false })}
                className="ml-1 p-0.5 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
