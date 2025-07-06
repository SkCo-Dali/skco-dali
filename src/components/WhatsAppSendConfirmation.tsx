
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Confirmar Envío de WhatsApp
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Estás a punto de enviar</span>
              <Badge variant="secondary">
                {messageCount} mensajes de WhatsApp
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              ¿Deseas continuar con el envío?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#25D366] hover:bg-[#25D366]/90"
          >
            {isLoading ? "Enviando..." : "Confirmar Envío"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
