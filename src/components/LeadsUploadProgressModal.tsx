import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload,
  CheckCircle, 
  XCircle, 
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

interface LeadsUploadProgressModalProps {
  isOpen: boolean;
  fileName: string;
  isUploading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  successMessage?: string;
  onClose: () => void;
}

export function LeadsUploadProgressModal({ 
  isOpen,
  fileName,
  isUploading,
  isSuccess,
  isError,
  errorMessage,
  successMessage,
  onClose
}: LeadsUploadProgressModalProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Preparando carga...');

  useEffect(() => {
    if (isUploading) {
      setProgress(0);
      setStatusMessage('Subiendo archivo...');
      
      // Simular progreso durante la carga
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 2;
          if (prev < 60) return prev + 1;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 200);

      // Cambiar mensaje de estado después de 2 segundos
      const timeout = setTimeout(() => {
        setStatusMessage('Procesando leads...');
      }, 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isUploading]);

  useEffect(() => {
    if (isSuccess) {
      setProgress(100);
      setStatusMessage('¡Carga completada exitosamente!');
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      setProgress(0);
      setStatusMessage('Error en la carga');
    }
  }, [isError]);

  const getIcon = () => {
    if (isSuccess) {
      return <CheckCircle className="h-12 w-12 text-green-600" />;
    }
    if (isError) {
      return <XCircle className="h-12 w-12 text-red-600" />;
    }
    if (isUploading) {
      return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
    }
    return <Upload className="h-12 w-12 text-muted-foreground" />;
  };

  const canClose = !isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {isSuccess ? 'Carga Completada' : isError ? 'Error en la Carga' : 'Cargando Leads'}
          </DialogTitle>
          <DialogDescription>
            {isSuccess 
              ? 'Los leads se han cargado exitosamente' 
              : isError 
              ? 'Ocurrió un error durante la carga'
              : 'Subiendo y procesando archivo de leads'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado visual */}
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {getIcon()}
            <div className="text-center">
              <p className="text-lg font-medium">
                {statusMessage}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {fileName}
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          {(isUploading || isSuccess) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
                <div className="text-center mt-2 text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensaje de éxito */}
          {isSuccess && successMessage && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Éxito</p>
                    <p className="text-sm text-green-700 mt-1">
                      {successMessage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensaje de error */}
          {isError && errorMessage && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botón de cerrar */}
        {canClose && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
