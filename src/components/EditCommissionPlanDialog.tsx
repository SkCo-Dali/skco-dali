import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CommissionPlan, AssignmentType, ROLES_LIST } from "@/data/commissionPlans";
import { useToast } from "@/hooks/use-toast";
import { CommissionRulesTable } from "@/components/CommissionRulesTable";
import { CreateRuleDialog } from "@/components/CreateRuleDialog";
import { EditRuleDialog } from "@/components/EditRuleDialog";
import { InactivatePlanDialog } from "@/components/InactivatePlanDialog";
import { useCommissionRules } from "@/hooks/useCommissionRules";
import { CommissionRule } from "@/data/commissionPlans";

interface EditCommissionPlanDialogProps {
  plan: CommissionPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePlan: (id: string, planData: Partial<CommissionPlan>) => Promise<CommissionPlan | null>;
  onSendToApproval?: (id: string) => Promise<boolean>;
  onRejectPlan?: (id: string, reason?: string) => Promise<boolean>;
  onPublishPlan?: (id: string) => Promise<boolean>;
  onInactivatePlan?: (id: string, reason?: string) => Promise<boolean>;
}

export function EditCommissionPlanDialog({ plan, open, onOpenChange, onUpdatePlan, onSendToApproval, onRejectPlan, onPublishPlan, onInactivatePlan }: EditCommissionPlanDialogProps) {
  const { toast } = useToast();
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [isEditRuleOpen, setIsEditRuleOpen] = useState(false);
  const [selectedRuleToEdit, setSelectedRuleToEdit] = useState<CommissionRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInactivateDialogOpen, setIsInactivateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    assignmentType: "all_users" as AssignmentType,
    assignmentValue: "",
  });

  // Fetch rules from API
  const { rules: uiRules, loading: rulesLoading, error: rulesError, fetchRules } = useCommissionRules(plan.id);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description,
        startDate: new Date(plan.startDate),
        endDate: new Date(plan.endDate),
        assignmentType: plan.assignmentType,
        assignmentValue: plan.assignmentValue || "",
      });
    }
  }, [plan]);

  const handleSaveAsDraft = async () => {
    setIsLoading(true);
    try {
      const updatedData: Partial<CommissionPlan> = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate ? format(formData.startDate, "yyyy-MM-dd") : undefined,
        endDate: formData.endDate ? format(formData.endDate, "yyyy-MM-dd") : undefined,
        assignmentType: formData.assignmentType,
        assignmentValue: formData.assignmentType !== "all_users" ? formData.assignmentValue : undefined,
      };

      const result = await onUpdatePlan(plan.id, updatedData);
      if (result) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForApproval = async () => {
    if (!plan?.id || !onSendToApproval) return;
    
    setIsLoading(true);
    const success = await onSendToApproval(plan.id);
    setIsLoading(false);
    
    if (success) {
      onOpenChange(false);
    }
  };

  const handlePublishAndCalculate = async () => {
    if (!plan?.id || !onPublishPlan) return;
    
    setIsLoading(true);
    const success = await onPublishPlan(plan.id);
    setIsLoading(false);
    
    if (success) {
      onOpenChange(false);
    }
  };

  const handleInactivate = () => {
    setIsInactivateDialogOpen(true);
  };

  const handleConfirmInactivate = async (reason?: string) => {
    if (!plan?.id || !onInactivatePlan) return;
    
    setIsLoading(true);
    const success = await onInactivatePlan(plan.id, reason);
    setIsLoading(false);
    
    if (success) {
      setIsInactivateDialogOpen(false);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editor de Planes de Compensación</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="information" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="information">Información</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>

              <TabsContent value="information" className="flex-1 overflow-hidden mt-4">
                <div className="grid grid-cols-1 h-[calc(90vh-280px)] w-full overflow-y-auto">
                  {/* Section 1: General Information (Red box) */}
                  <div className="col-span-2 flex flex-col">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Información General</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre*</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Ingrese el nombre del plan"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Ingrese la descripción del plan"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Fecha de Inicio *</Label>
                          <DatePicker
                            date={formData.startDate}
                            onDateChange={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
                            placeholder="dd/MM/yyyy"
                          />
                        </div>

                        <div>
                          <Label>Fecha de Fin *</Label>
                          <DatePicker
                            date={formData.endDate}
                            onDateChange={(date) => setFormData((prev) => ({ ...prev, endDate: date }))}
                            placeholder="dd/MM/yyyy"
                            disabled={(date) => (formData.startDate ? date < formData.startDate : false)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Asignado a *</Label>
                        <RadioGroup
                          value={formData.assignmentType}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              assignmentType: value as AssignmentType,
                              assignmentValue: value === "all_users" ? "" : prev.assignmentValue,
                            }))
                          }
                          className="mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all_users" id="edit_all_users" />
                            <Label htmlFor="edit_all_users">Todos los Usuarios</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="user" id="edit_user" />
                            <Label htmlFor="edit_user">Usuario</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="role" id="edit_role" />
                            <Label htmlFor="edit_role">Rol</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="team" id="edit_team" />
                            <Label htmlFor="edit_team">Equipo</Label>
                          </div>
                        </RadioGroup>

                        {formData.assignmentType === "role" && (
                          <div className="mt-3">
                            <Select
                              value={formData.assignmentValue}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, assignmentValue: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                              </SelectTrigger>
                              <SelectContent className="bg-background border shadow-md max-h-[200px] overflow-y-auto">
                                {ROLES_LIST.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {(formData.assignmentType === "user" || formData.assignmentType === "team") && (
                          <div className="mt-3">
                            <Input
                              value={formData.assignmentValue}
                              onChange={(e) => setFormData((prev) => ({ ...prev, assignmentValue: e.target.value }))}
                              placeholder={`Ingrese el nombre del ${formData.assignmentType === 'user' ? 'usuario' : 'equipo'}`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Rules Table (Yellow box) */}
                  <div className="col-span-3 flex flex-col">
                    <div className="mt-4 flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">Reglas</h3>
                      <Button
                        onClick={() => setIsCreateRuleOpen(true)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        disabled={rulesLoading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear
                      </Button>
                    </div>

                    {rulesLoading ? (
                      <div className="flex items-center justify-center py-8 border rounded-md">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Cargando reglas...</span>
                      </div>
                    ) : rulesError ? (
                      <div className="text-center py-8 border rounded-md text-destructive">
                        Error al cargar reglas: {rulesError}
                      </div>
                    ) : uiRules.length === 0 ? (
                      <div className="text-center py-8 border rounded-md text-muted-foreground">
                        No hay reglas creadas aún. Haz clic en "Crear" para agregar tu primera regla.
                      </div>
                    ) : (
                      <ScrollArea className="flex-1 rounded-md">
                        <div className="w-full">
                          <CommissionRulesTable
                            rules={uiRules}
                            planId={plan.id}
                            onRuleDeleted={() => {
                              fetchRules();
                              toast({
                                title: "Rule deleted",
                                description: "The rule has been successfully deleted.",
                              });
                            }}
                            onRuleUpdated={() => {
                              fetchRules();
                              toast({
                                title: "Rule updated",
                                description: "The rule has been successfully updated.",
                              });
                            }}
                          />
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-y-auto mt-4">
                <div className="text-center py-8 text-muted-foreground">Funcionalidad de historial próximamente.</div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {plan.status === "ready_to_approve" ? (
              <>
                <Button onClick={handlePublishAndCalculate} className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Publicando..." : "Publicar"}
                </Button>
                <Button
                  onClick={async () => {
                    const reason = prompt("Ingrese el motivo del rechazo (opcional):");
                    if (reason !== null && onRejectPlan) {
                      setIsLoading(true);
                      const success = await onRejectPlan(plan.id, reason || undefined);
                      setIsLoading(false);
                      if (success) {
                        onOpenChange(false);
                      }
                    }
                  }}
                  variant="outline"
                  className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive"
                  disabled={isLoading}
                >
                  Rechazar
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
                  Cancelar
                </Button>
              </>
            ) : plan.status === "rejected" || plan.status === "inactive" ? (
              <>
                <Button
                  onClick={handleSendForApproval}
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary"
                  disabled={isLoading}
                >
                  Listo para Aprobar
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
                  Cancelar
                </Button>
              </>
            ) : plan.status === "published" ? (
              <>
                <Button
                  onClick={handleInactivate}
                  variant="outline"
                  className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive"
                  disabled={isLoading}
                >
                  {isLoading ? "Inactivando..." : "Inactivar"}
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSaveAsDraft}
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Guardando..." : "Guardar como Borrador"}
                </Button>
                <Button
                  onClick={handleSendForApproval}
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary"
                  disabled={isLoading}
                >
                  Listo para Aprobar
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateRuleDialog
        planId={plan.id}
        open={isCreateRuleOpen}
        onOpenChange={setIsCreateRuleOpen}
        onRuleCreated={() => {
          fetchRules();
          toast({
            title: "Rule created",
            description: "The rule has been successfully created.",
          });
        }}
      />

      <EditRuleDialog
        rule={selectedRuleToEdit}
        planId={plan.id}
        open={isEditRuleOpen}
        onOpenChange={(open) => {
          setIsEditRuleOpen(open);
          if (!open) setSelectedRuleToEdit(null);
        }}
        onRuleUpdated={() => {
          fetchRules();
          setIsEditRuleOpen(false);
          setSelectedRuleToEdit(null);
          toast({
            title: "Rule updated",
            description: "The rule has been successfully updated.",
          });
        }}
      />

      <InactivatePlanDialog
        open={isInactivateDialogOpen}
        onOpenChange={setIsInactivateDialogOpen}
        onConfirm={handleConfirmInactivate}
        isLoading={isLoading}
      />
    </>
  );
}
