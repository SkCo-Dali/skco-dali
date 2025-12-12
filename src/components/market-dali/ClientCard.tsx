import React from "react";
import { MarketClient } from "@/types/marketDali";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Phone, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeadInteractions } from "@/hooks/useLeadInteractions";
import { InteractionIcons } from "./InteractionIcons";

interface ClientCardProps {
  client: MarketClient;
  isInCart: boolean;
  onAddToCart: (client: MarketClient) => void;
  onRemoveFromCart: (clientId: string) => void;
  onViewLead?: (leadId: string) => void;
}

// Check if client is already loaded as a lead
const isClientAlreadyLoaded = (client: MarketClient): boolean => {
  return client.alreadyLoaded === true;
};

// Get the lead ID if client is already loaded
const getLeadId = (client: MarketClient): string | null => {
  if (isClientAlreadyLoaded(client)) {
    return client.id;
  }
  return null;
};

export const ClientCard: React.FC<ClientCardProps> = ({ client, isInCart, onAddToCart, onRemoveFromCart, onViewLead }) => {
  const alreadyLoaded = isClientAlreadyLoaded(client);
  const leadId = getLeadId(client);
  
  // Fetch interactions only for already loaded clients
  const { status: interactionStatus, loading: loadingInteractions } = useLeadInteractions(
    leadId,
    alreadyLoaded
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const handleCartAction = () => {
    if (alreadyLoaded) return; // Can't add already loaded clients
    if (isInCart) {
      onRemoveFromCart(client.id);
    } else {
      onAddToCart(client);
    }
  };

  const handleViewLead = () => {
    if (leadId && onViewLead) {
      onViewLead(leadId);
    }
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 rounded-xl hover:shadow-md overflow-hidden",
        isInCart && "ring-2 ring-primary border-primary bg-primary/5",
        alreadyLoaded && "opacity-75 bg-muted/30",
      )}
    >
      {/* In cart indicator */}
      {isInCart && !alreadyLoaded && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-primary border-l-[40px] border-l-transparent">
          <Check className="absolute -top-[32px] right-1 h-4 w-4 text-primary-foreground" />
        </div>
      )}

      {/* Already loaded indicator */}
      {alreadyLoaded && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-blue-500 border-l-[40px] border-l-transparent">
          <Check className="absolute -top-[32px] right-1 h-4 w-4 text-white" />
        </div>
      )}

      <CardContent className="p-3 sm:p-4">
        {/* Avatar and name */}
        <div className="flex items-start gap-3 mb-3">
          {/* <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>*/}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{client.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {client.documentType}: {client.documentNumber}
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{client.email || "Sin email"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{client.phone || "Sin teléfono"}</span>
          </div>
        </div>

        {/* Badges and interaction icons row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {alreadyLoaded && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
              Ya cargado
            </Badge>
          )}
          {alreadyLoaded && (
            <InteractionIcons status={interactionStatus} loading={loadingInteractions} />
          )}
        </div>

        {/* Score and action */}
        <div className="flex items-center gap-2">
          {/* Score badge 
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            getScoreColor(client.score)
          )}>
            <Star className="h-3 w-3" />
            <span>{client.score}%</span>
          </div>*/}

          {/* Cart button or View Lead button */}
          {alreadyLoaded ? (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto text-xs h-8 px-3 border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={handleViewLead}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Ver lead</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant={isInCart ? "outline" : "default"}
              className={cn("ml-auto text-xs h-8 px-3", isInCart && "border-primary text-primary hover:bg-primary/10")}
              onClick={handleCartAction}
            >
              {isInCart ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Agregado</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Agregar</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
