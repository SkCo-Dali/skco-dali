
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
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users } from 'lucide-react';

interface WhatsAppSendConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  messageCount: number;
  isLoading?: boolean;
}

export function WhatsAppSendConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  messageCount,
  isLoading = false
}: WhatsAppSendConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            Confirmar Envío de WhatsApp
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Estás a punto de enviar</span>
              <Badge variant="secondary" className="text-xs">
                {messageCount} mensajes de WhatsApp
              </Badge>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground">
              ¿Deseas continuar con el envío?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto text-xs sm:text-sm">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#25D366]/90 text-xs sm:text-sm"
          >
            {isLoading ? "Enviando..." : "Confirmar Envío"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
