import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Lead } from "@/types/crm";

interface LoadLeadsProgressModalProps {
  open: boolean;
  loading: boolean;
  leads: Lead[];
  campaignName: string;
  opportunityId?: string;
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
        className="
          w-full 
          max-w-3xl 
          max-h-[80vh] 
          flex 
          flex-col
          [&>button]:hidden
        "
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

            {/* Contenido */}
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-5 space-y-4">
                <p className="text-base font-semibold text-foreground">
                  Se cargaron {leads.length} clientes en el módulo de leads
                </p>
                <p className="text-sm text-foreground/80">
                  Los encontrarás filtrando por la campaña:{" "}
                  <span className="font-medium text-foreground">{campaignName}</span>
                </p>

                <div className="space-y-4 mt-4">
                  <p className="text-base font-semibold text-foreground">¿Qué quieres hacer ahora?</p>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">📧</span>
                      <div>
                        <p className="text-base font-medium text-foreground">Opción 1: Preparar un correo para ellos</p>
                        <p className="text-sm text-foreground/80 mt-1">Se abrirá el editor de correos donde podrás:</p>
                        <ul className="text-sm text-foreground/80 mt-1 ml-4 list-disc space-y-0.5">
                          <li>Escoger una plantilla o escribir tu mensaje</li>
                          <li>Decidir a cuáles clientes enviarles</li>
                          <li>Revisar todo antes de enviar</li>
                        </ul>
                        <p className="text-sm text-foreground/90 mt-2 italic font-medium">
                          Nada se envía sin tu confirmación final.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">📋</span>
                      <div>
                        <p className="text-base font-medium text-foreground">Opción 2: Ir al módulo de leads</p>
                        <p className="text-sm text-foreground/80 mt-1">
                          Verás estos clientes ya filtrados automáticamente por la campaña para que puedas revisar su
                          información.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer fijo con los botones centrados */}
              <div className="flex flex-col items-center gap-2 w-full mt-4">
                <Button onClick={onSendEmails} className="w-full max-w-md">
                  Preparar correo
                </Button>
                <Button variant="outline" onClick={onGoToLeads} className="w-full max-w-md">
                  Ir al módulo de leads
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
