import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { OpportunityFiltersComponent } from '@/components/opportunities/OpportunityFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, Heart, Award, RefreshCw, Search, X } from 'lucide-react';
import { IOpportunity, OpportunityFilters, SortOption, OpportunityStats, OPPORTUNITY_TYPE_LABELS } from '@/types/opportunities';
import { opportunitiesService } from '@/services/opportunitiesService';

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
      <div className="container mx-auto px-4 py-5">
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
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-5">
        {/* Header */}
        <div className="space-y-3 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Market Dali
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            El mercado de tus clientes ideales. Descubre oportunidades comerciales personalizadas para maximizar tu impacto.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div className="text-xl font-bold">{stats.totalOpportunities}</div>
                <div className="text-xs text-muted-foreground">Oportunidades</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Clientes</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-xl font-bold">{stats.favoritesCount}</div>
                <div className="text-xs text-muted-foreground">Favoritas</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-xl font-bold">${(stats.totalCustomers * 125).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Comisiones Potenciales</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Highlighted Opportunities */}
        {!loading && highlightedOpportunities.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Oportunidades Destacadas</h2>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">⭐ Top 3</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {highlightedOpportunities.map((opportunity, index) => (
                <div key={opportunity.id} className="relative">
                  {/* Top Badge */}
                  <div className="absolute -top-2 -left-2 z-10">
                    <Badge 
                      variant="destructive" 
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-2 py-1 text-xs shadow-lg"
                    >
                      🔥Top {index + 1}
                    </Badge>
                  </div>
                  <div className="rounded-xl">
                    <OpportunityCard
                      opportunity={opportunity}
                      onViewDetails={handleViewDetails}
                      onFavoriteChange={handleFavoriteChange}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        

        {/* Active Filters Display */}
        {(filters.type?.length || filters.priority?.length || filters.onlyFavorites) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.type?.map((type) => (
              <Badge key={type} variant="secondary" className="capitalize bg-white">
                {type}
              </Badge>
            ))}
            {filters.priority?.map((priority) => (
              <Badge key={priority} variant="secondary" className="capitalize bg-white">
                {priority}
              </Badge>
            ))}
            {filters.onlyFavorites && (
              <Badge variant="secondary" className="bg-white">Favoritas</Badge>
            )}
          </div>
        )}

        {/* All Opportunities Section with Sidebar */}
       <div className= "mb-4"> 
         <h2 className="text-xl font-semibold">
              Todas las Oportunidades
              {!loading && opportunities.length > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({opportunities.length} resultados)
                </span>
              )}
            </h2>
          </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Buscar oportunidades..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              className="pl-10 bg-white"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <label className="pr-2">Ordenar por:</label>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevancia</SelectItem>
              <SelectItem value="customers">Más clientes</SelectItem>
              <SelectItem value="recent">Más reciente</SelectItem>
              <SelectItem value="expiring">Próximos a vencer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-6">
          {/* Opportunities Grid */}
          <div className="flex-1 space-y-3">
            

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="p-3 bg-white">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <Card className="p-8 text-center bg-white">
                <div className="space-y-3">
                  <div className="text-4xl">🔍</div>
                  <h3 className="text-lg font-semibold">No se encontraron oportunidades</h3>
                  <p className="text-muted-foreground text-sm">
                    Intenta ajustar los filtros o buscar con diferentes términos.
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

          {/* Filters Sidebar - Always visible on desktop */}
          <div className="hidden lg:block w-80 shrink-0">
            <Card className="bg-white shadow-sm sticky top-4">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-lg">Filtros</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Only Favorites */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filtros especiales</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="favorites"
                      checked={filters.onlyFavorites || false}
                      onCheckedChange={(checked) => 
                        setFilters({ ...filters, onlyFavorites: (checked === true) || undefined })
                      }
                    />
                    <Label htmlFor="favorites" className="text-sm">Solo favoritas</Label>
                  </div>
                </div>

                {/* Type Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo de oportunidad</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([type, label]) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filters.type?.includes(type as any) || false}
                          onCheckedChange={(checked) => {
                            const currentTypes = filters.type || [];
                            const newTypes = checked
                              ? [...currentTypes, type as any]
                              : currentTypes.filter(t => t !== type);
                            setFilters({ 
                              ...filters, 
                              type: newTypes.length > 0 ? newTypes : undefined 
                            });
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="text-xs">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Prioridad</Label>
                  <div className="space-y-1">
                    {['alta', 'media', 'baja'].map((priority) => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={filters.priority?.includes(priority as any) || false}
                          onCheckedChange={(checked) => {
                            const currentPriorities = filters.priority || [];
                            const newPriorities = checked
                              ? [...currentPriorities, priority as any]
                              : currentPriorities.filter(p => p !== priority);
                            setFilters({ 
                              ...filters, 
                              priority: newPriorities.length > 0 ? newPriorities : undefined 
                            });
                          }}
                        />
                        <Label htmlFor={`priority-${priority}`} className="text-sm capitalize">
                          {priority}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(filters.type?.length || filters.priority?.length || filters.onlyFavorites) && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden">
          <OpportunityFiltersComponent
            filters={filters}
            sortBy={sortBy}
            onFiltersChange={setFilters}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  );
};