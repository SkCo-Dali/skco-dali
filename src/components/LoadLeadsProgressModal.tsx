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
        className="max-w-4xl max-h-[90vh]"
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
              <p className="text-muted-foreground">
                Por favor espera mientras se cargan las oportunidades...
              </p>
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
                <p className="font-semibold">
                  Se cargaron {leads.length} oportunidades en el módulo de leads
                </p>
                <p className="text-sm text-muted-foreground">
                  Podrás consultarlas en el módulo de leads filtrando por la campaña:{" "}
                  <span className="font-medium text-foreground">{campaignName}</span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Clientes cargados:</p>
                <ScrollArea className="h-[300px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            {lead.documentNumber || "N/A"}
                          </TableCell>
                          <TableCell>{lead.name}</TableCell>
                          <TableCell className="text-sm">{lead.email || "N/A"}</TableCell>
                          <TableCell>{lead.phone || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
                <p className="text-sm text-muted-foreground">
                  A continuación se abrirá la ventana de envío de correos masivos por si deseas 
                  abordarlos de inmediato. Desde allí podrás ver uno a uno estos clientes con 
                  oportunidades y seleccionar todos o descartar los que desees.
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={onGoToLeads}
                className="w-full sm:w-auto"
              >
                Prefiero revisar esas oportunidades en el módulo de leads antes de enviar correos
              </Button>
              <Button
                onClick={onSendEmails}
                className="w-full sm:w-auto"
              >
                Vamos a enviarle correos a estos {leads.length} clientes con oportunidades
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
