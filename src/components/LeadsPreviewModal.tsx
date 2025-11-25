import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { PreviewLeadFromOpportunity } from "@/types/opportunitiesApi";

interface LeadsPreviewModalProps {
  open: boolean;
  loading: boolean;
  leads: PreviewLeadFromOpportunity[];
  onLoadAsLeads: () => void;
  onCancel: () => void;
}

export const LeadsPreviewModal: React.FC<LeadsPreviewModalProps> = ({
  open,
  loading,
  leads,
  onLoadAsLeads,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="w-full max-w-3xl max-h-[80vh] flex flex-col">
        {loading ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                Cargando previsualización de clientes
              </DialogTitle>
            </DialogHeader>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Por favor espera mientras se cargan los clientes...</p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Previsualización de Clientes</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Se encontraron {leads.length} cliente{leads.length !== 1 ? "s" : ""}:
                </p>
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
                          {leads.map((lead, index) => (
                            <TableRow key={index}>
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
            </div>

            <div className="flex flex-col items-center gap-2 w-full mt-4">
              <Button onClick={onLoadAsLeads} className="w-full max-w-md">
                Cargar como leads
              </Button>
              <Button variant="outline" onClick={onCancel} className="w-full max-w-md">
                Cancelar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
