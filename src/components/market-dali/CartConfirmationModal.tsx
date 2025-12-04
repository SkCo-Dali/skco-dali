import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

interface CartConfirmationModalProps {
  isOpen: boolean;
  currentOpportunityTitle: string | null;
  newOpportunityTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CartConfirmationModal: React.FC<CartConfirmationModalProps> = ({
  isOpen,
  currentOpportunityTitle,
  newOpportunityTitle,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <AlertDialogTitle className="text-lg">
              Cambiar oportunidad del carrito
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <p>
                Tu carrito actual pertenece a la oportunidad:
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <ShoppingCart className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground">
                  {currentOpportunityTitle}
                </span>
              </div>
              <p>
                Para agregar clientes de <span className="font-medium text-foreground">"{newOpportunityTitle}"</span> 
                {' '}debes vaciar el carrito actual.
              </p>
              <p className="text-muted-foreground">
                ¿Deseas vaciar el carrito y continuar?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Vaciar y continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
