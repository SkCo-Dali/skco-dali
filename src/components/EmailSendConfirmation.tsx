
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
import { Mail, Users, AlertTriangle } from 'lucide-react';

interface EmailSendConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  recipientCount: number;
  isLoading?: boolean;
}

export function EmailSendConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  recipientCount,
  isLoading = false
}: EmailSendConfirmationProps) {
  const isOverLimit = recipientCount > 20;

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Confirmar Envío de Correos
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Estás a punto de enviar correos a</span>
              <Badge variant={isOverLimit ? "destructive" : "secondary"}>
                {recipientCount} destinatarios
              </Badge>
            </div>
            
            {isOverLimit && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 text-sm">
                  <strong>Límite excedido:</strong> El máximo permitido es 20 correos por envío. 
                  Por favor, reduce la cantidad de destinatarios.
                </span>
              </div>
            )}
            
            {!isOverLimit && (
              <p className="text-sm text-muted-foreground">
                Esta acción no se puede deshacer. Los correos se enviarán inmediatamente.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isOverLimit || isLoading}
            className={isOverLimit ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isLoading ? "Enviando..." : "Confirmar Envío"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
