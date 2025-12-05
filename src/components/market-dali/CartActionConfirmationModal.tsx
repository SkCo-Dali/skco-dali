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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, MessageCircle, Plus } from 'lucide-react';
import { CartItem } from '@/types/marketDali';

type ActionType = 'email' | 'whatsapp';

interface CartActionConfirmationModalProps {
  isOpen: boolean;
  actionType: ActionType | null;
  items: CartItem[];
  opportunityTitle: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  onAddMore: () => void;
}

export const CartActionConfirmationModal: React.FC<CartActionConfirmationModalProps> = ({
  isOpen,
  actionType,
  items,
  opportunityTitle,
  onConfirm,
  onCancel,
  onAddMore,
}) => {
  const isEmail = actionType === 'email';
  const Icon = isEmail ? Mail : MessageCircle;
  const actionLabel = isEmail ? 'correo' : 'WhatsApp';
  const actionLabelPlural = isEmail ? 'correos' : 'mensajes de WhatsApp';

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${isEmail ? 'bg-blue-100' : 'bg-green-100'}`}>
              <Icon className={`h-5 w-5 ${isEmail ? 'text-blue-600' : 'text-green-600'}`} />
            </div>
            <AlertDialogTitle className="text-lg">
              Confirmar envío de {actionLabel}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              {opportunityTitle && (
                <p className="text-muted-foreground">
                  Oportunidad: <span className="font-medium text-foreground">{opportunityTitle}</span>
                </p>
              )}
              
              <p>
                Estás a punto de enviar{' '}
                <Badge variant="secondary" className="text-xs">
                  {items.length} {actionLabelPlural}
                </Badge>{' '}
                a los siguientes clientes:
              </p>

              <ScrollArea className="h-[150px] rounded-lg border border-border">
                <div className="p-2 space-y-1">
                  {items.map((item) => (
                    <div 
                      key={item.client.id} 
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.client.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {isEmail ? item.client.email : item.client.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <p className="text-muted-foreground">
                ¿Deseas agregar más clientes o continuar con el envío?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>
          <button
            onClick={onAddMore}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Agregar más
          </button>
          <AlertDialogAction 
            onClick={onConfirm}
            className={`w-full sm:w-auto ${isEmail ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#25D366] hover:bg-[#25D366]/90'}`}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
