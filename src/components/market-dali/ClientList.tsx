import React, { useState } from "react";
import { MarketClient, MarketOpportunity, CATEGORY_CONFIG } from "@/types/marketDali";
import { ClientCard } from "./ClientCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, ArrowLeft, ShoppingCart, CheckCircle2, X } from "lucide-react";
import bannerCumple from "@/assets/banner-cumple.png";

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
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const categoryConfig = CATEGORY_CONFIG[opportunity.type];

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

  // Count clients already in cart
  const clientsInCart = clients.filter((c) => isInCart(c.id)).length;
  const allInCart = clientsInCart === clients.length && clients.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with opportunity info */}
      <div
        className="rounded-lg p-4 border border-border relative overflow-hidden"
        style={{
          backgroundImage: `url(${bannerCumple})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-background/90" />
        <div className="flex items-start gap-3 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{opportunity.icon}</span>
              <Badge variant="secondary" className="text-xs">
                {categoryConfig.label}
              </Badge>
            </div>
            <h2 className="text-lg sm:text-xl font-bold line-clamp-2 mb-1 text-whie">{opportunity.title}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2">{opportunity.subtitle}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground relative z-10">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{clients.length} clientes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            <span>{clientsInCart} en carrito</span>
          </div>
        </div>
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
          disabled={allInCart || clients.length === 0}
          variant={allInCart ? "outline" : "default"}
          className="whitespace-nowrap"
        >
          {allInCart ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Todos agregados
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar todos ({clients.length})
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
