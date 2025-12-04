import React from 'react';
import { Store, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarketDaliHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const MarketDaliHeader: React.FC<MarketDaliHeaderProps> = ({
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Market Dali
            </h1>
            <p className="text-sm text-muted-foreground">
              Descubre oportunidades y selecciona clientes para contactar
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {/* Info banner */}
      <div className="mt-4 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-medium">¿Cómo funciona?</span>{' '}
          <span className="text-muted-foreground">
            Explora las oportunidades disponibles, agrega clientes a tu carrito y realiza acciones masivas: 
            cargar al gestor de leads, enviar correos o WhatsApp.
          </span>
        </p>
      </div>
    </div>
  );
};
