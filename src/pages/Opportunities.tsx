import React from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { OpportunityFiltersComponent } from "@/components/opportunities/OpportunityFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, Heart, Award, RefreshCw, Search, X } from "lucide-react";
import {
  IOpportunity,
  OpportunityFilters,
  SortOption,
  OpportunityStats,
  OpportunityType,
  Priority,
  OPPORTUNITY_TYPE_LABELS,
} from "@/types/opportunities";
import { opportunitiesService } from "@/services/opportunitiesService";

export const Opportunities: React.FC = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = React.useState<IOpportunity[]>([]);
  const [highlightedOpportunities, setHighlightedOpportunities] = React.useState<IOpportunity[]>([]);
  const [stats, setStats] = React.useState<OpportunityStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<OpportunityFilters>({});
  const [sortBy, setSortBy] = React.useState<SortOption>("relevance");
  const [marketAnimation, setMarketAnimation] = React.useState(null);

  React.useEffect(() => {
    fetch("/animations/market_oportunidades.json")
      .then((res) => res.json())
      .then((data) => setMarketAnimation(data))
      .catch((err) => console.error("Error loading market animation:", err));
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [opportunitiesData, highlightedData, statsData] = await Promise.all([
        opportunitiesService.getOpportunities(filters, sortBy),
        opportunitiesService.getHighlightedOpportunities(),
        opportunitiesService.getStats(),
      ]);

      setOpportunities(opportunitiesData);
      setHighlightedOpportunities(highlightedData);
      setStats(statsData);
    } catch (err) {
      setError("Error al cargar las oportunidades. Por favor, intenta nuevamente.");
      console.error("Error loading opportunities:", err);
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
    <div className="bg-transparent min-h-screen">
      <div className="w-full max-w-full px-4 py-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-[#00C73D]">Market Dali</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Descubre oportunidades comerciales personalizadas para maximizar tu impacto.
            </p>
          </div>
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
                <div className="text-xl font-bold">${stats.totalCommissionPotential?.toLocaleString() || "0"}</div>
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
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                ⭐ Top 3
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-3">
              {highlightedOpportunities.slice(0, 3).map((opportunity, index) => (
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
              <Badge variant="secondary" className="bg-white">
                Favoritas
              </Badge>
            )}
          </div>
        )}

        {/* All Opportunities Section with Sidebar */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Todas las Oportunidades
            {!loading && opportunities.length > 0 && (
              <span className="text-sm text-muted-foreground ml-2">({opportunities.length} resultados)</span>
            )}
          </h2>
        </div>

        {/* Search, Sort, and Filters Bar */}
        <div className="mb-6 flex flex-col gap-4">
          {/* First row: Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar oportunidades..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                className="pl-10 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Ordenar por:</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
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
          </div>

          {/* Second row: Additional Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Favorites Toggle */}
            <Button
              variant={filters.onlyFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, onlyFavorites: !filters.onlyFavorites })}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${filters.onlyFavorites ? "fill-current" : ""}`} />
              Solo favoritos
            </Button>

            {/* Type Filter */}
            <Select
              value={filters.type?.[0] || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, type: value === "all" ? undefined : [value as OpportunityType] })
              }
            >
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Tipo de oportunidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="cross-sell">Cross-sell</SelectItem>
                <SelectItem value="retention">Retención</SelectItem>
                <SelectItem value="reactivation">Reactivación</SelectItem>
                <SelectItem value="churn-risk">Riesgo Cancelación</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={filters.priority?.[0] || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, priority: value === "all" ? undefined : [value as Priority] })
              }
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(filters.search || filters.onlyFavorites || filters.type?.length || filters.priority?.length) && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
            {marketAnimation ? (
              <div className="w-64 h-64">
                <Lottie animationData={marketAnimation} loop={true} />
              </div>
            ) : (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            )}
            <span className="text-lg text-muted-foreground">Cargando oportunidades...</span>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
