import React, { useState } from "react";
import { MarketCart } from "@/types/marketDali";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2, Users, X, Loader2, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  cart: MarketCart;
  isOpen: boolean;
  isProcessing: boolean;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onClose: () => void;
  onRemoveItem: (clientId: string) => void;
  onClearCart: () => void;
  onLoadAsLeads: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  isOpen,
  isProcessing,
  isCollapsed = false,
  onCollapsedChange,
  onClose,
  onRemoveItem,
  onClearCart,
  onLoadAsLeads,
}) => {
  const isEmpty = cart.items.length === 0;

  const handleToggleCollapse = () => {
    onCollapsedChange?.(!isCollapsed);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Desktop collapse/expand toggle button */}
      <button
        onClick={handleToggleCollapse}
        className={cn(
          "hidden lg:flex fixed z-30 top-1/2 -translate-y-1/2 items-center justify-center",
          "w-8 h-16 bg-primary border border-primary rounded-l-lg shadow-lg",
          "hover:bg-primary/90 transition-all duration-300",
          isCollapsed ? "right-0" : "right-80",
        )}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-5 w-5 text-primary-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-primary-foreground" />
        )}
        {isCollapsed && cart.items.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
          >
            {cart.items.length}
          </Badge>
        )}
      </button>

      {/* Drawer */}
      <div
        className={cn(
          "fixed bg-card border-l border-border shadow-xl transition-transform duration-300 ease-in-out",
          // Mobile: bottom sheet with higher z-index
          "z-40 inset-x-0 bottom-0 top-auto h-[80vh] rounded-t-2xl lg:rounded-none",
          // Desktop: right panel, positioned below header
          "lg:z-30 lg:top-20 lg:bottom-0 lg:right-0 lg:left-auto lg:w-80 lg:h-auto",
          // Transform based on open state and collapse state
          isOpen
            ? isCollapsed
              ? "translate-y-0 lg:translate-x-full"
              : "translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-y-0 lg:translate-x-full",
        )}
      >
        {/* Handle for mobile */}
        <div className="lg:hidden w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground justify-center">Mi Carrito</h3>
            {!isEmpty && (
              <Badge variant="secondary" className="ml-1">
                {cart.items.length}
              </Badge>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors lg:hidden">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Opportunity indicator */}
        {cart.opportunityTitle && (
          <div className="px-4 py-2 bg-primary/5 border-b border-border">
            <p className="text-xs text-muted-foreground">Oportunidad seleccionada:</p>
            <p className="text-sm font-medium text-foreground truncate">{cart.opportunityTitle}</p>
          </div>
        )}

        {/* Content */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-3" />
            <h4 className="font-medium text-foreground mb-1">Carrito vacío</h4>
            <p className="text-sm text-muted-foreground">Selecciona una oportunidad y agrega clientes para comenzar</p>
          </div>
        ) : (
          <>
            {/* Items list */}
            <ScrollArea className="flex-1 h-[calc(100%-280px)] lg:h-[calc(100%-260px)]">
              <div className="p-4 space-y-2">
                {cart.items.map((item) => (
                  <div key={item.client.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.client.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.client.segment} {/*• {item.client.score}%*/}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.client.id)}
                      className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors"
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Clear cart button */}
            <div className="px-4 py-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onClearCart}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vaciar carrito
              </Button>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border bg-card">
              <Button className="w-full" onClick={onLoadAsLeads} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
                Cargar en gestor de leads
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
