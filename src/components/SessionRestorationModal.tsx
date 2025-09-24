import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface SessionRestorationModalProps {
  isOpen: boolean;
  onRestore: () => void;
  onDiscard: () => void;
  formName?: string;
  lastSaved?: Date;
}

export const SessionRestorationModal = ({
  isOpen,
  onRestore,
  onDiscard,
  formName = 'formulario',
  lastSaved
}: SessionRestorationModalProps) => {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await onRestore();
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Datos no guardados encontrados</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Se encontraron datos no guardados de tu {formName} anterior.
            {lastSaved && (
              <div className="mt-2 text-sm text-muted-foreground">
                Última actualización: {lastSaved.toLocaleString()}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRestore}
            disabled={isRestoring}
            className="justify-start gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {isRestoring ? 'Restaurando...' : 'Restaurar datos'}
          </Button>
          
          <Button
            onClick={onDiscard}
            variant="outline"
            className="justify-start gap-2"
          >
            <X className="h-4 w-4" />
            Empezar de nuevo
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <strong>💡 Tip:</strong> Los datos se guardan automáticamente cada 30 segundos 
          mientras trabajas para evitar perder tu progreso.
        </div>
      </DialogContent>
    </Dialog>
  );
};