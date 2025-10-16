import React from "react";
import { Heart, Users, X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IOpportunity, OPPORTUNITY_TYPE_LABELS, PRIORITY_COLORS } from "@/types/opportunities";
import { opportunitiesService } from "@/services/opportunitiesService";
import { useToast } from "@/hooks/use-toast";
import { formatBogotaDate } from "@/utils/dateUtils";

interface OpportunityCardProps {
  opportunity: IOpportunity;
  onViewDetails: (opportunity: IOpportunity) => void;
  onFavoriteChange?: (opportunityId: string, isFavorite: boolean) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onViewDetails, onFavoriteChange }) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = React.useState(opportunity.isFavorite);

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
    if (opportunity.isActive) {
      onViewDetails(opportunity);
    }
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
            className={`group transition-all duration-300 shadow-md border-0 h-fit w-full max-w-[280px] relative ${
              opportunity.isActive
                ? "hover:shadow-xl hover:-translate-y-1 hover:shadow-lg bg-white cursor-pointer"
                : "bg-gray-50 opacity-75 cursor-not-allowed"
            }`}
            onClick={handleViewDetails}
          >
            {/* Inactive overlay */}
            {!opportunity.isActive && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-lg">
                <div className="bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg text-center transform -rotate-12">
                  <div className="flex items-center gap-1 mb-1">
                    <X className="h-4 w-4" />
                    <span className="font-bold text-sm">Ya fue aprovechada</span>
                  </div>
                  <div className="text-xs opacity-90">Regresa pronto para nuevos Leads</div>
                </div>
              </div>
            )}

            {/* Top section with favorite button */}
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle}
                className="h-6 w-6 shrink-0 hover:bg-red-50 hover:text-red-500"
                disabled={!opportunity.isActive}
              >
                <Heart className={`h-3 w-3 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
              </Button>
            </div>

            <CardContent
              className={`px-3 pb-3 pt-1 text-center space-y-2.5 ${!opportunity.isActive ? "grayscale" : ""}`}
            >
              {/* Large emoji as "product image" */}
              <div className="flex justify-center">
                <div
                  className={`text-6xl w-20 h-20 flex items-center justify-center rounded-2xl ${
                    opportunity.isActive ? "bg-gradient-to-br from-primary/10 to-primary/5" : "bg-gray-100"
                  }`}
                >
                  {opportunity.icon}
                </div>
              </div>

              {/* Title - centered */}
              <div>
                <h3
                  className={`font-bold text-sm line-clamp-2 transition-colors text-center ${
                    opportunity.isActive ? "group-hover:text-primary" : "text-gray-500"
                  }`}
                >
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
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5 font-medium bg-blue-50 text-blue-700 border-blue-200"
                >
                  {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
                </Badge>
              </div>

              {/* Customer Count and Commission */}
              <div className="flex items-center justify-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-blue-50 rounded">
                    <Users className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-bold text-blue-700">{formatCustomerCount(opportunity.customerCount)}</span>
                    <span className="text-muted-foreground ml-1">clientesP</span>
                  </div>
                </div>
              </div>

              {opportunity.metrics && (
                <div className="flex items-center justify-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-blue-50 rounded">
                      <Users className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-bold text-blue-700">
                        ${(opportunity.metrics.estimatedSales / 1_000_000).toFixed(1)}M
                      </span>
                      <span className="text-muted-foreground ml-1">Comisión Potencial</span>
                    </div>
                  </div>
                </div>
              )}

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
                variant={opportunity.isActive ? "default" : "secondary"}
                size="sm"
                className={`w-full h-8 text-xs font-medium mt-4 ${
                  opportunity.isActive
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
                }`}
                disabled={!opportunity.isActive}
              >
                {opportunity.isActive ? "Ver oportunidad →" : "No disponible"}
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
