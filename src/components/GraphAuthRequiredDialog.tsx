import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraphAuthButton } from '@/components/GraphAuthButton';
import { Mail, Shield, CheckCircle } from 'lucide-react';

interface GraphAuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthorizationComplete: () => void;
}

export function GraphAuthRequiredDialog({
  open,
  onOpenChange,
  onAuthorizationComplete,
}: GraphAuthRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Conecta tu cuenta de correo
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p>
              Para enviar correos masivos desde tu cuenta de Skandia, necesitamos conectar tu cuenta de correo corporativo.
            </p>
            
            <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Conexión segura</p>
                  <p className="text-xs text-muted-foreground">
                    Utilizamos el protocolo OAuth de Microsoft para conectar tu cuenta de forma segura.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Una única vez</p>
                  <p className="text-xs text-muted-foreground">
                    Solo necesitas autorizar una vez. Después podrás enviar correos sin volver a conectar.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <GraphAuthButton
                onAuthorizationComplete={onAuthorizationComplete}
                variant="default"
                size="default"
                className="w-full"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
