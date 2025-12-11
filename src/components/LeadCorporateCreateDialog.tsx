import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeadPacPreCheck } from "@/hooks/useLeadPacPreCheck";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { useToast } from "@/hooks/use-toast";
import { InputSanitizer } from "@/utils/inputSanitizer";

export interface LeadCorporateCreateDialogRef {
  openDialog: () => void;
}

interface LeadCorporateCreateDialogProps {
  onLeadCreated?: () => void;
}

export const LeadCorporateCreateDialog = forwardRef<
  LeadCorporateCreateDialogRef,
  LeadCorporateCreateDialogProps
>((props, ref) => {
  const { onLeadCreated } = props;
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNewLead } = useLeadsApi();

  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isCreating, setIsCreating] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    empresa: "",
    email: "",
    telefono: "",
    numeroEmpleados: "",
    sectorEmpresa: "",
    estadoLeadCorporativo: "Prospecto",
    notas: "",
  });

  const preCheck = useLeadPacPreCheck({
    userId: user?.id || "",
    autoVerify: false,
  });

  useImperativeHandle(ref, () => ({
    openDialog: () => {
      setOpen(true);
      setCurrentStep(1);
      preCheck.reset();
      setFormData({
        empresa: "",
        email: "",
        telefono: "",
        numeroEmpleados: "",
        sectorEmpresa: "",
        estadoLeadCorporativo: "Prospecto",
        notas: "",
      });
    },
  }));

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(1);
    preCheck.reset();
  };

  const handleNitBlur = () => {
    if (preCheck.normalizedNit && preCheck.normalizedNit.length >= 9) {
      preCheck.verify();
    }
  };

  const handleContinueToStep2 = () => {
    if (!preCheck.hasVerified) {
      toast({
        title: "Verificación requerida",
        description: "Por favor, verifica el NIT antes de continuar",
        variant: "destructive",
      });
      return;
    }

    if (preCheck.verificationResult?.exists && preCheck.verificationResult.tipoLead === "corporate") {
      // Bloquear si ya existe un Corporativo
      return;
    }

    setCurrentStep(2);
  };

  const handleOpenExistingLead = async () => {
    if (preCheck.verificationResult?.leadId) {
      await preCheck.logDecision("open");
      toast({
        title: "Abriendo lead",
        description: `Redirigiendo a lead ${preCheck.verificationResult.leadId}`,
      });
      handleClose();
    }
  };

  const handleConvertToCorporate = async () => {
    if (preCheck.verificationResult?.leadId) {
      await preCheck.logDecision("convert");
      toast({
        title: "Conversión a Corporativo",
        description: "Funcionalidad de conversión en desarrollo",
      });
      handleClose();
    }
  };

  const handleCreateCorporate = async () => {
    if (!preCheck.normalizedNit || !formData.empresa) {
      toast({
        title: "Campos requeridos",
        description: "NIT y empresa son campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      await createNewLead({
        name: formData.empresa,
        email: InputSanitizer.sanitizeEmail(formData.email),
        phone: InputSanitizer.sanitizeText(formData.telefono),
        company: formData.empresa,
        documentType: "NIT",
        documentNumber: parseInt(preCheck.normalizedNit, 10),
        stage: "Nuevo",
        source: "DaliLM",
        campaign: "Corporativos",
        notes: formData.notas,
        // Campos específicos Corporativo
        tipoLead: "corporate",
        numeroEmpleadosAproximado: formData.numeroEmpleados
          ? parseInt(formData.numeroEmpleados, 10)
          : undefined,
        sectorEmpresa: formData.sectorEmpresa || undefined,
        estadoLeadCorporativo: formData.estadoLeadCorporativo,
      } as any);

      await preCheck.logDecision("create");

      toast({
        title: "Lead Corporativo creado",
        description: `Se ha creado exitosamente el lead Corporativo para ${formData.empresa}`,
      });

      handleClose();
      onLeadCreated?.();
    } catch (error) {
      console.error("Error creating Corporate lead:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el lead Corporativo. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nit">NIT *</Label>
        <Input
          id="nit"
          placeholder="Ej: 900.123.456-7"
          value={preCheck.nit}
          onChange={(e) => preCheck.setNit(e.target.value)}
          onBlur={handleNitBlur}
          disabled={preCheck.isVerifying}
        />
        {preCheck.normalizedNit && (
          <p className="text-sm text-muted-foreground">
            NIT normalizado: {preCheck.normalizedNit}
          </p>
        )}
        {preCheck.error && (
          <p className="text-sm text-destructive">{preCheck.error}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => preCheck.verify()}
          disabled={!preCheck.normalizedNit || preCheck.isVerifying}
          variant="outline"
          className="flex-1"
        >
          {preCheck.isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar NIT"
          )}
        </Button>
      </div>

      {/* Resultados de verificación */}
      {preCheck.hasVerified && preCheck.verificationResult && (
        <div className="mt-4 space-y-3">
          {/* Caso A: Coincidencia Corporativo por NIT */}
          {preCheck.verificationResult.exists &&
            preCheck.verificationResult.tipoLead === "corporate" && (
              <Alert variant="destructive" className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">
                    Este NIT ya tiene un Lead Corporativo registrado
                  </p>

                  {preCheck.verificationResult.inScope ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Empresa:</strong>{" "}
                        {preCheck.verificationResult.empresa}
                      </div>
                      <div>
                        <strong>Estado:</strong>{" "}
                        {preCheck.verificationResult.estado}
                      </div>
                      <div>
                        <strong>Asesor:</strong>{" "}
                        {preCheck.verificationResult.asesorDisplayName}
                      </div>
                      <div>
                        <strong>Creado:</strong>{" "}
                        {preCheck.verificationResult.creadoEl}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={handleOpenExistingLead}>
                          Abrir Lead
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClose}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p>
                        Existe un lead Corporativo registrado para este NIT.
                      </p>
                      <div>
                        <strong>Estado:</strong>{" "}
                        {preCheck.verificationResult.estado}
                      </div>
                      <div>
                        <strong>Asesor asignado:</strong>{" "}
                        {preCheck.verificationResult.asesorDisplayName}
                      </div>
                      <div>
                        <strong>Fecha de creación:</strong>{" "}
                        {preCheck.verificationResult.creadoEl}
                      </div>
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClose}
                        >
                          Cancelar creación
                        </Button>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

          {/* Caso B: Sin Corporativo pero hay lead genérico/PAC */}
          {preCheck.verificationResult.exists &&
            preCheck.verificationResult.tipoLead !== "corporate" && (
              <Alert className="border-primary">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">
                    Existe un lead {preCheck.verificationResult.tipoLead === "pac" ? "PAC" : "genérico"}{" "}
                    asociado a este NIT
                  </p>
                  <div className="space-y-2 text-sm">
                    {preCheck.verificationResult.inScope && (
                      <>
                        <div>
                          <strong>Empresa:</strong>{" "}
                          {preCheck.verificationResult.empresa}
                        </div>
                        <div>
                          <strong>Estado:</strong>{" "}
                          {preCheck.verificationResult.estado}
                        </div>
                      </>
                    )}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <Button size="sm" onClick={handleOpenExistingLead}>
                        Abrir Lead
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleConvertToCorporate}
                      >
                        Convertir a Corporativo
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleContinueToStep2}
                      >
                        Crear Corporativo de todos modos
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

          {/* Caso C: Sin coincidencias */}
          {!preCheck.verificationResult.exists && (
            <Alert className="border-success bg-success/5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription>
                <p className="font-semibold">Sin coincidencias encontradas</p>
                <p className="text-sm mt-1">
                  Puedes continuar con la creación del lead Corporativo
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label htmlFor="empresa">Empresa *</Label>
        <Input
          id="empresa"
          value={formData.empresa}
          onChange={(e) =>
            setFormData({ ...formData, empresa: e.target.value })
          }
          placeholder="Nombre de la empresa"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="contacto@empresa.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          value={formData.telefono}
          onChange={(e) =>
            setFormData({ ...formData, telefono: e.target.value })
          }
          placeholder="300 123 4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numeroEmpleados">Número Aproximado de Empleados</Label>
        <Input
          id="numeroEmpleados"
          type="number"
          value={formData.numeroEmpleados}
          onChange={(e) =>
            setFormData({ ...formData, numeroEmpleados: e.target.value })
          }
          placeholder="Ej: 50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sectorEmpresa">Sector de la Empresa</Label>
        <Input
          id="sectorEmpresa"
          value={formData.sectorEmpresa}
          onChange={(e) =>
            setFormData({ ...formData, sectorEmpresa: e.target.value })
          }
          placeholder="Ej: Tecnología, Construcción, Financiero"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estadoLeadCorporativo">Estado del Lead Corporativo</Label>
        <Select
          value={formData.estadoLeadCorporativo}
          onValueChange={(value) =>
            setFormData({ ...formData, estadoLeadCorporativo: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Prospecto">Prospecto</SelectItem>
            <SelectItem value="En Contacto">En Contacto</SelectItem>
            <SelectItem value="En Negociación">En Negociación</SelectItem>
            <SelectItem value="Cerrado Ganado">Cerrado Ganado</SelectItem>
            <SelectItem value="Cerrado Perdido">Cerrado Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          placeholder="Información adicional sobre el Lead Corporativo"
          rows={3}
        />
      </div>
    </div>
  );

  const canContinueToStep2 =
    preCheck.hasVerified &&
    (!preCheck.verificationResult?.exists ||
      preCheck.verificationResult.tipoLead !== "corporate");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1 ? "Verificación de NIT" : "Crear Lead Corporativo"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? "Paso 1: Verifica que el NIT no esté registrado previamente"
              : "Paso 2: Completa la información del lead Corporativo"}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 ? renderStep1() : renderStep2()}

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>

          {currentStep === 1 ? (
            <Button
              onClick={handleContinueToStep2}
              disabled={!canContinueToStep2}
            >
              Continuar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={isCreating}
              >
                Volver
              </Button>
              <Button onClick={handleCreateCorporate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Lead Corporativo"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

LeadCorporateCreateDialog.displayName = "LeadCorporateCreateDialog";
