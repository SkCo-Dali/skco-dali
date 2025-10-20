import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeadsBulkStatusUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStage: string) => Promise<void>;
  selectedCount: number;
  isLoading?: boolean;
}

const STAGE_OPTIONS = [
  { value: "Nuevo", label: "Nuevo" },
  { value: "Asignado", label: "Asignado" },
  { value: "Localizado: No interesado", label: "Localizado: No interesado" },
  { value: "Localizado: Prospecto de venta FP", label: "Localizado: Prospecto de venta FP" },
  { value: "Localizado: Prospecto de venta AD", label: "Localizado: Prospecto de venta AD" },
  { value: "Localizado: Prospecto de venta - Pendiente", label: "Localizado: Prospecto de venta - Pendiente" },
  { value: "Localizado: Volver a llamar", label: "Localizado: Volver a llamar" },
  { value: "Localizado: No vuelve a contestar", label: "Localizado: No vuelve a contestar" },
  { value: "No localizado: No contesta", label: "No localizado: No contesta" },
  { value: "No localizado: Número equivocado", label: "No localizado: Número equivocado" },
  { value: "Contrato Creado", label: "Contrato Creado" },
  { value: "Registro de Venta (fondeado)", label: "Registro de Venta (fondeado)" },
  { value: "Repetido", label: "Repetido" },
];

export function LeadsBulkStatusUpdate({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading = false,
}: LeadsBulkStatusUpdateProps) {
  const [selectedStage, setSelectedStage] = useState<string>("");

  const handleConfirm = async () => {
    if (!selectedStage) return;

    try {
      await onConfirm(selectedStage);
      setSelectedStage("");
    } catch (error) {
      console.error("Error en actualización masiva:", error);
    }
  };

  const handleClose = () => {
    setSelectedStage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Actualización Masiva de Estado
          </DialogTitle>
          <DialogDescription>Cambia el estado de múltiples leads a la vez</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Se actualizarán{" "}
              <Badge variant="secondary" className="mx-1">
                {selectedCount}
              </Badge>
              {selectedCount === 1 ? "lead" : "leads"} seleccionados
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nuevo Estado <span className="text-destructive">*</span>
            </label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {STAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStage && (
            <Alert className="bg-muted">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Todos los leads seleccionados cambiarán a:{" "}
                <strong>{STAGE_OPTIONS.find((s) => s.value === selectedStage)?.label}</strong>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedStage || isLoading}>
            {isLoading ? "Actualizando..." : "Confirmar Actualización"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
