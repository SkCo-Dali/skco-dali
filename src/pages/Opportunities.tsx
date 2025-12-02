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
import { Users, TrendingUp, Heart, Award, RefreshCw } from "lucide-react";
import {
  IOpportunity,
  OpportunityFilters,
  SortOption,
  OpportunityStats,
  OpportunityType,
  Priority,
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
      <div className="w-full max-w-full px-4 sm:px-4 py-3 sm:py-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-3 md:gap-4 mb-3 md:mb-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-[#00C73D]">Market Dali</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Descubre oportunidades comerciales personalizadas para maximizar tu impacto.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="text-base sm:text-xl font-bold">{stats.totalOpportunities}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Oportunidades</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                </div>
                <div className="text-base sm:text-xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Clientes</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                </div>
                <div className="text-base sm:text-xl font-bold">{stats.favoritesCount}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Favoritas</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                </div>
                <div className="text-base sm:text-xl font-bold">
                  ${stats.totalCommissionPotential?.toLocaleString() || "0"}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Comisiones Potenciales</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Highlighted Opportunities */}
        {!loading && highlightedOpportunities.length > 0 && (
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold">Oportunidades Destacadas</h2>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] sm:text-xs px-1.5 sm:px-2">
                ⭐ Top 3
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {highlightedOpportunities.slice(0, 3).map((opportunity, index) => (
                <div key={opportunity.id} className="relative mx-auto w-full max-w-[280px]">
                  {/* Top Badge */}
                  <div className="absolute -top-2 -left-2 z-10">
                    <Badge
                      variant="destructive"
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs shadow-lg"
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

        {/* All Opportunities Section with Sidebar */}
        <div className="mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold">
            Todas las Oportunidades
            {!loading && opportunities.length > 0 && (
              <span className="text-xs sm:text-sm text-muted-foreground ml-2">({opportunities.length} resultados)</span>
            )}
          </h2>
        </div>

        {/* Filters Panel */}
        <div className="mb-4 sm:mb-6">
          <OpportunityFiltersComponent
            filters={filters}
            sortBy={sortBy}
            onFiltersChange={setFilters}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-8 sm:py-12 space-y-3 sm:space-y-4">
            {marketAnimation ? (
              <div className="w-48 h-48 sm:w-64 sm:h-64">
                <Lottie animationData={marketAnimation} loop={true} />
              </div>
            ) : (
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900" />
            )}
            <span className="text-sm sm:text-base md:text-lg text-muted-foreground">Cargando oportunidades...</span>
          </div>
        ) : opportunities.length === 0 ? (
          <Card className="p-6 sm:p-8 text-center bg-white">
            <div className="space-y-2 sm:space-y-3">
              <div className="text-3xl sm:text-4xl">🔍</div>
              <h3 className="text-base sm:text-lg font-semibold">No se encontraron oportunidades</h3>
              <p className="text-muted-foreground text-xs sm:text-sm px-2">
                Intenta ajustar los filtros o buscar con diferentes términos.
              </p>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-2">
                Limpiar filtros
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
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
