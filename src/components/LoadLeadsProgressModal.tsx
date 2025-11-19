import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Lead } from "@/types/crm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LoadLeadsProgressModalProps {
  open: boolean;
  loading: boolean;
  leads: Lead[];
  campaignName: string;
  onSendEmails: () => void;
  onGoToLeads: () => void;
}

export const LoadLeadsProgressModal: React.FC<LoadLeadsProgressModalProps> = ({
  open,
  loading,
  leads,
  campaignName,
  onSendEmails,
  onGoToLeads,
}) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {loading ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                Cargando oportunidades en el módulo de leads
              </DialogTitle>
            </DialogHeader>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Por favor espera mientras se cargan las oportunidades...</p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                ¡Cargue exitoso!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 space-y-2">
                <p className="font-semibold">Se cargaron {leads.length} oportunidades en el módulo de leads</p>
                <p className="text-sm text-muted-foreground">
                  Podrás consultarlas en el módulo de leads filtrando por la campaña:{" "}
                  <span className="font-medium text-foreground">{campaignName}</span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Clientes cargados:</p>
                <div className="rounded-md border">
                  <ScrollArea className="h-[300px] w-full">
                    <div className="min-w-[600px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Documento</TableHead>
                            <TableHead className="w-[180px]">Nombre</TableHead>
                            <TableHead className="w-[200px]">Email</TableHead>
                            <TableHead className="w-[120px]">Teléfono</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leads.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell className="font-medium">{lead.documentNumber || "N/A"}</TableCell>
                              <TableCell>{lead.name}</TableCell>
                              <TableCell className="text-sm">{lead.email || "N/A"}</TableCell>
                              <TableCell>{lead.phone || "N/A"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
                <p className="text-sm text-muted-foreground">
                  Estos son los clientes que acabas de cargar desde la oportunidad seleccionada. Puedes continuar de dos
                  maneras: 1. Revisarlos en el módulo de leads. Allí verás solo estos clientes, ya filtrados
                  automáticamente por la campaña. 2. Preparar un correo masivo para ellos. Podrás escoger una plantilla,
                  personalizar el mensaje y decidir a quiénes se enviará. Nada se enviará sin tu confirmación.
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button onClick={onSendEmails} className="w-full">
                Preparar correo masivo
              </Button>
              <Button variant="outline" onClick={onGoToLeads} className="w-full">
                Ver estos clientes en el módulo de leads
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
