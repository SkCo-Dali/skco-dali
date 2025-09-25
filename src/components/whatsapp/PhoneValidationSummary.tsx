import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { LeadValidationError } from '@/types/whatsapp-propio';
import { getMotivoDescripcion } from '@/utils/whatsapp-phone';

interface PhoneValidationSummaryProps {
  validCount: number;
  errorCount: number;
  errors: LeadValidationError[];
}

export function PhoneValidationSummary({ 
  validCount, 
  errorCount, 
  errors 
}: PhoneValidationSummaryProps) {
  const [showErrorsModal, setShowErrorsModal] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Validación de Teléfonos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  {validCount} válidos
                </Badge>
              </div>
              
              {errorCount > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <Badge variant="destructive">
                    {errorCount} descartados
                  </Badge>
                </div>
              )}
            </div>

            {errorCount > 0 && (
              <Button
                onClick={() => setShowErrorsModal(true)}
                variant="outline"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver descartados
              </Button>
            )}
          </div>

          {errorCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Los números descartados no se incluirán en el envío
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal de errores */}
      <Dialog open={showErrorsModal} onOpenChange={setShowErrorsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Números Descartados ({errorCount})</DialogTitle>
            <DialogDescription>
              Estos leads fueron excluidos por tener números de teléfono inválidos
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Teléfono Original</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((error, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {error.leadName}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {error.phoneOriginal || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getMotivoDescripcion(error.motivo)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}