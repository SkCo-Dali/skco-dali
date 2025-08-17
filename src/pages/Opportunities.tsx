import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { OpportunityFiltersComponent } from '@/components/opportunities/OpportunityFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Heart, Award, RefreshCw } from 'lucide-react';
import { IOpportunity, OpportunityFilters, SortOption, OpportunityStats } from '@/types/opportunities';
import { opportunitiesService } from '@/services/mock/opportunitiesService';

export const Opportunities: React.FC = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = React.useState<IOpportunity[]>([]);
  const [highlightedOpportunities, setHighlightedOpportunities] = React.useState<IOpportunity[]>([]);
  const [stats, setStats] = React.useState<OpportunityStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<OpportunityFilters>({});
  const [sortBy, setSortBy] = React.useState<SortOption>('relevance');

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [opportunitiesData, highlightedData, statsData] = await Promise.all([
        opportunitiesService.getOpportunities(filters, sortBy),
        opportunitiesService.getHighlightedOpportunities(),
        opportunitiesService.getStats()
      ]);

      setOpportunities(opportunitiesData);
      setHighlightedOpportunities(highlightedData);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar las oportunidades. Por favor, intenta nuevamente.');
      console.error('Error loading opportunities:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewDetails = (opportunity: IOpportunity) => {
    navigate(`/oportunidades/${opportunity.id}`);
  };

  const handleFavoriteChange = () => {
    // Refresh stats when favorites change
    opportunitiesService.getStats().then(setStats);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleRetry = () => {
    loadData();
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Market Dali
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          El mercado de tus clientes ideales. Descubre oportunidades comerciales personalizadas para maximizar tu impacto.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
              <div className="text-sm text-muted-foreground">Oportunidades</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Clientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold">{stats.favoritesCount}</div>
              <div className="text-sm text-muted-foreground">Favoritas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{stats.avgScore}</div>
              <div className="text-sm text-muted-foreground">Score Promedio</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Highlighted Opportunities */}
      {!loading && highlightedOpportunities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Oportunidades Destacadas</h2>
            <Badge variant="secondary">⭐ Top 3</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlightedOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onViewDetails={handleViewDetails}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <OpportunityFiltersComponent
        filters={filters}
        sortBy={sortBy}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* Active Filters Display */}
      {(filters.type?.length || filters.priority?.length || filters.onlyFavorites) && (
        <div className="flex flex-wrap gap-2">
          {filters.type?.map((type) => (
            <Badge key={type} variant="secondary" className="capitalize">
              {type}
            </Badge>
          ))}
          {filters.priority?.map((priority) => (
            <Badge key={priority} variant="secondary" className="capitalize">
              {priority}
            </Badge>
          ))}
          {filters.onlyFavorites && (
            <Badge variant="secondary">Favoritas</Badge>
          )}
        </div>
      )}

      {/* Opportunities Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Todas las Oportunidades
          {!loading && opportunities.length > 0 && (
            <span className="text-lg text-muted-foreground ml-2">
              ({opportunities.length} resultados)
            </span>
          )}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="text-xl font-semibold">No se encontraron oportunidades</h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros o buscar con diferentes términos.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onViewDetails={handleViewDetails}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};