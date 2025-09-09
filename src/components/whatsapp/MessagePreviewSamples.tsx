import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/crm';

interface MessagePreviewSamplesProps {
  leads: Lead[];
  message: string;
  renderMessage: (message: string, lead: Lead) => string;
  showAll?: boolean;
}

export function MessagePreviewSamples({ 
  leads, 
  message, 
  renderMessage,
  showAll = false
}: MessagePreviewSamplesProps) {
  const [showFullModal, setShowFullModal] = useState(false);

  if (!message.trim()) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Escribe un mensaje para ver la previsualización
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay leads válidos para mostrar
      </div>
    );
  }

  const sampleLeads = showAll ? leads : leads.slice(0, 5);

  const PreviewTable = ({ leads: tableLeads }: { leads: Lead[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead className="min-w-[300px]">Mensaje Renderizado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableLeads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">
              {lead.name}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {lead.phone}
            </TableCell>
            <TableCell>
              <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                {renderMessage(message, lead)}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <div className="space-y-4">
        {showAll ? (
          <PreviewTable leads={sampleLeads} />
        ) : (
          <>
            <PreviewTable leads={sampleLeads} />
            
            {leads.length > 5 && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Mostrando {sampleLeads.length} de {leads.length}
                  </Badge>
                </div>
                <Button
                  onClick={() => setShowFullModal(true)}
                  variant="outline"
                  size="sm"
                >
                  Ver todos ({leads.length})
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para ver todos */}
      <Dialog open={showFullModal} onOpenChange={setShowFullModal}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Previsualización Completa ({leads.length} mensajes)
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[60vh]">
            <PreviewTable leads={leads} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}