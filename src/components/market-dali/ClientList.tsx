import React, { useState } from "react";
import { MarketClient, MarketOpportunity, CATEGORY_CONFIG } from "@/types/marketDali";
import { ClientCard } from "./ClientCard";
import { MarketDaliLoadingAnimation } from "./MarketDaliLoadingAnimation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  CheckCircle2,
  X,
  TrendingUp,
  Target,
  Percent,
  Gift,
  Crown,
  Star,
  Zap,
  Award,
  Briefcase,
  Clock,
  Calendar,
  DollarSign,
  Heart,
  Flame,
  Sparkles,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { getCategoryBanner } from "@/config/marketDaliBanners";
import { useIsMobile } from "@/hooks/use-mobile";

// Helper to get icon based on tag content
const getTagIcon = (tag: string): LucideIcon => {
  const lowerTag = tag.toLowerCase();

  // Priority/urgency related
  if (lowerTag.includes("urgent") || lowerTag.includes("priorit") || lowerTag.includes("hot")) return Flame;
  if (lowerTag.includes("nuevo") || lowerTag.includes("new")) return Sparkles;

  // Sales/revenue related
  if (lowerTag.includes("venta") || lowerTag.includes("revenue") || lowerTag.includes("ingreso")) return DollarSign;
  if (lowerTag.includes("comisión") || lowerTag.includes("comision") || lowerTag.includes("commission")) return Percent;
  if (lowerTag.includes("descuento") || lowerTag.includes("discount") || lowerTag.includes("promo")) return Gift;

  // Performance/growth related
  if (lowerTag.includes("crecimiento") || lowerTag.includes("growth") || lowerTag.includes("tendencia"))
    return TrendingUp;
  if (
    lowerTag.includes("meta") ||
    lowerTag.includes("objetivo") ||
    lowerTag.includes("goal") ||
    lowerTag.includes("target")
  )
    return Target;
  if (lowerTag.includes("potencial") || lowerTag.includes("potential")) return Zap;

  // Status/tier related
  if (lowerTag.includes("premium") || lowerTag.includes("vip") || lowerTag.includes("oro") || lowerTag.includes("gold"))
    return Crown;
  if (lowerTag.includes("destacado") || lowerTag.includes("featured") || lowerTag.includes("top")) return Star;
  if (lowerTag.includes("leal") || lowerTag.includes("loyal") || lowerTag.includes("fidelidad")) return Heart;
  if (lowerTag.includes("ganador") || lowerTag.includes("winner") || lowerTag.includes("premio")) return Award;

  // Time related
  if (
    lowerTag.includes("tiempo") ||
    lowerTag.includes("time") ||
    lowerTag.includes("rápido") ||
    lowerTag.includes("fast")
  )
    return Clock;
  if (
    lowerTag.includes("fecha") ||
    lowerTag.includes("date") ||
    lowerTag.includes("vence") ||
    lowerTag.includes("expir")
  )
    return Calendar;

  // Business related
  if (
    lowerTag.includes("negocio") ||
    lowerTag.includes("business") ||
    lowerTag.includes("empresa") ||
    lowerTag.includes("corporat")
  )
    return Briefcase;

  // Default
  return Star;
};

interface ClientListProps {
  opportunity: MarketOpportunity;
  clients: MarketClient[];
  isLoading: boolean;
  isInCart: (clientId: string) => boolean;
  cartItemsCount: number;
  onAddToCart: (client: MarketClient) => void;
  onRemoveFromCart: (clientId: string) => void;
  onBack: () => void;
  onAddAllToCart: () => void;
  onViewLead?: (leadId: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  opportunity,
  clients,
  isLoading,
  isInCart,
  cartItemsCount,
  onAddToCart,
  onRemoveFromCart,
  onBack,
  onAddAllToCart,
  onViewLead,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  const categoryConfig = CATEGORY_CONFIG[opportunity.type];
  const bannerConfig = getCategoryBanner(opportunity.type);
  // Use API image URLs if available, otherwise fallback to category banner config
  // For mobile: prefer imageUrlMobile, fallback to imageUrl, then category config
  const apiImage = isMobile ? opportunity.imageUrlMobile || opportunity.imageUrl : opportunity.imageUrl;
  const fallbackImage = isMobile ? bannerConfig.mobileImage : bannerConfig.image;
  const bannerImage = apiImage || fallbackImage;

  // Check if client is already loaded as a lead
  const isClientAlreadyLoaded = (client: MarketClient): boolean => {
    return client.alreadyLoaded === true;
  };

  // Filter clients by search
  const filteredClients = clients.filter((client) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.phone.includes(search) ||
      client.segment.toLowerCase().includes(search)
    );
  });

  // Get clients that can be added to cart (not already loaded)
  const availableClients = clients.filter((c) => !isClientAlreadyLoaded(c));
  const alreadyLoadedCount = clients.length - availableClients.length;

  // Count clients already in cart
  const clientsInCart = availableClients.filter((c) => isInCart(c.id)).length;
  const allAvailableInCart = clientsInCart === availableClients.length && availableClients.length > 0;

  if (isLoading) {
    return <MarketDaliLoadingAnimation message="Cargando clientes..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header with opportunity info */}
      <div
        className={`
    border border-border relative overflow-hidden rounded-xl 
    px-4 py-4 md:py-12 min-h-[120px] md:min-h-[240px]
    ${!bannerImage ? `bg-gradient-to-br ${bannerConfig.gradient}` : ""}
  `}
        style={
          bannerImage
            ? {
                backgroundImage: `url(${bannerImage})`,
                backgroundSize: "cover", // 👈 que la imagen cubra todo
                backgroundPosition: "right center", // 👈 ajusta el encuadre fino
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
      >
        {/* Overlay */}
        {bannerImage && isMobile ? (
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              // Gradiente tipo banner: oscuro a la izquierda, se desvanece sobre la imagen
              background:
                "linear-gradient(to right," +
                "rgba(0, 0, 0, 0.5) 0%," +
                "rgba(0, 0, 0, 0.5) 35%," +
                "rgba(0, 0, 0, 0.5) 70%," +
                "rgba(0, 0, 0, 0.5) 75%," +
                "rgba(0, 0, 0, 0.5) 80%," +
                "rgba(0, 0, 0, 0.5) 100%)",
            }}
          />
        ) : (
          <div className={`absolute inset-0 ${bannerConfig.overlayOpacity}`} />
        )}

        {/* Texto */}
        <div className="flex items-start gap-3 relative z-10 w-full md:w-1/2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold line-clamp-2 mb-1 text-white">{opportunity.title}</h2>
            <p className="text-sm sm:text-md text-white line-clamp-2 hidden sm:block">{opportunity.subtitle}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm sm:text-md text-white relative z-10">
          <div className="flex items-center gap-1.5 px-2">
            <Users className="h-4 w-4" />
            <span>{clients.length} clientes</span>
          </div>
          {alreadyLoadedCount > 0 && (
            <div className="flex items-center gap-1.5 px-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{alreadyLoadedCount} ya cargados</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            <span>{clientsInCart} en carrito</span>
          </div>
        </div>

        {/* Tags */}
        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-white relative z-10">
            {opportunity.tags.map((tag, index) => {
              const TagIcon = getTagIcon(tag);
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 sm:gap-1.5 bg-black/20 px-2 py-1 rounded-md sm:bg-transparent sm:px-0 sm:py-0 sm:rounded-none"
                >
                  <TagIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate max-w-[80px] sm:max-w-none">{tag}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search and actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        <Button
          onClick={onAddAllToCart}
          disabled={allAvailableInCart || availableClients.length === 0}
          variant={allAvailableInCart ? "outline" : "default"}
          className="whitespace-nowrap"
        >
          {availableClients.length === 0 ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Todos ya cargados
            </>
          ) : allAvailableInCart ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Todos agregados
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar todos ({availableClients.length})
            </>
          )}
        </Button>
      </div>

      {/* Client grid */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">No hay clientes</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm
              ? "No encontramos clientes con ese término de búsqueda"
              : "Esta oportunidad no tiene clientes asociados"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              isInCart={isInCart(client.id)}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              onViewLead={onViewLead}
            />
          ))}
        </div>
      )}
    </div>
  );
};
