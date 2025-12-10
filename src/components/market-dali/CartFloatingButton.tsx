import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CartFloatingButtonProps {
  itemsCount: number;
  onClick: () => void;
}

export const CartFloatingButton: React.FC<CartFloatingButtonProps> = ({
  itemsCount,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-20 right-4 z-30',
        'flex items-center gap-2 px-4 py-3',
        'bg-primary text-primary-foreground',
        'rounded-full shadow-lg',
        'hover:bg-primary/90 transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'lg:hidden' // Only show on mobile
      )}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemsCount > 0 && (
        <>
          <span className="font-medium">Ver carrito</span>
          <Badge 
            variant="secondary" 
            className="bg-white text-primary h-6 w-6 p-0 rounded-full flex items-center justify-center"
          >
            {itemsCount}
          </Badge>
        </>
      )}
    </button>
  );
};
