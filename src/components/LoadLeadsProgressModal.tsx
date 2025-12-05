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
          max-h-[85vh]
          flex
          flex-col
          overflow-hidden
          p-4 sm:p-5
          [&>button]:hidden
        "
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {loading ? (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                Cargando oportunidades en el módulo de leads
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">Por favor espera mientras se cargan las oportunidades...</p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                ¡Cargue exitoso!
              </DialogTitle>
            </DialogHeader>

            {/* Cuerpo scrolleable y más compacto */}
            <div className="flex-1 overflow-y-auto">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 px-4 py-3 space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Se cargaron {leads.length} clientes en el módulo de leads
                </p>
                <p className="text-xs sm:text-sm text-foreground/80">
                  Los encontrarás filtrando por la campaña:{" "}
                  <span className="font-semibold text-green-700 dark:text-green-400">{campaignName}</span>
                </p>

                <div className="space-y-3 mt-2">
                  <p className="text-sm font-semibold text-foreground">¿Qué quieres hacer ahora?</p>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="text-base flex-shrink-0">📧</span>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Opción 1: Preparar un correo para ellos</p>
                        <p className="text-xs sm:text-sm text-foreground/80">
                          Se abrirá el editor de correos donde podrás:
                        </p>
                        <ul className="text-xs sm:text-sm text-foreground/80 ml-4 list-disc space-y-0.5">
                          <li>Escoger una plantilla (aunque ya te sugerimos una 😉) o escribir tu mensaje</li>
                          <li>Decidir a cuáles clientes enviarles 🤔</li>
                          <li>Revisar todo antes de enviar 🔎</li>
                        </ul>
                        <p className="text-xs sm:text-sm text-foreground/90 mt-1 italic font-medium">
                          NADA se envía sin tu confirmación final.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-base flex-shrink-0">📋</span>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Opción 2: Ir al módulo de leads</p>
                        <p className="text-xs sm:text-sm text-foreground/80">
                          Verás estos clientes ya filtrados automáticamente por la campaña para que puedas revisar su
                          información.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer fijo, menos margen y botones centrados */}
            <DialogFooter className="mt-3 flex flex-col items-center gap-2 w-full">
              <Button onClick={onSendEmails} className="w-full max-w-md">
                Preparar correo
              </Button>
              <Button variant="outline" onClick={onGoToLeads} className="w-full max-w-md">
                Ir al módulo de leads
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
