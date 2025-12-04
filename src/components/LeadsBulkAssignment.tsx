import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Lead, LeadStatus } from "@/types/crm";
import { useAssignableUsers } from "@/contexts/AssignableUsersContext";
import { useToast } from "@/hooks/use-toast";
import { bulkAssignLeads } from "@/utils/leadAssignmentApiClient";
import { getReassignableLeadsPaginated } from "@/utils/leadAssignmentApiClient";
import { bulkChangeLeadStage } from "@/utils/leadsApiClient";
import { PaginatedLead } from "@/types/paginatedLeadsTypes";

interface LeadsBulkAssignmentProps {
  leads: Lead[];
  onLeadsAssigned: () => void;
}

interface UserAssignment {
  userId: string;
  userName: string;
  quantity: number;
}

export function LeadsBulkAssignment({ leads, onLeadsAssigned }: LeadsBulkAssignmentProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [assignmentType, setAssignmentType] = useState<"equitable" | "specific">("equitable");
  const [userAssignments, setUserAssignments] = useState<UserAssignment[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [allNewLeads, setAllNewLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const { users } = useAssignableUsers();
  const { toast } = useToast();

  // Memoizar usuarios gestores para evitar closures stale
  const gestorUsers = useMemo(() => {
    const filtered = users.filter((user) => user.Role === "gestor");
    console.log("📋 Gestor users filtered:", filtered.length, "from", users.length, "total users");
    return filtered;
  }, [users]);

  // IDs de gestores para validación rápida
  const gestorUserIds = useMemo(() => new Set(gestorUsers.map(u => u.Id)), [gestorUsers]);

  // Mapear PaginatedLead a Lead
  const mapPaginatedLeadToLead = (paginatedLead: PaginatedLead): Lead => {
    let tags: string[] = [];
    let portfolios: string[] = [];
    let additionalInfo: any = null;

    try {
      if (paginatedLead.Tags) tags = JSON.parse(paginatedLead.Tags);
    } catch {
      tags = [];
    }

    try {
      if (paginatedLead.SelectedPortfolios) portfolios = JSON.parse(paginatedLead.SelectedPortfolios);
    } catch {
      portfolios = [];
    }

    try {
      if (paginatedLead.AdditionalInfo) additionalInfo = JSON.parse(paginatedLead.AdditionalInfo);
    } catch {
      additionalInfo = null;
    }

    return {
      id: paginatedLead.Id,
      name: paginatedLead.Name,
      email: paginatedLead.Email,
      phone: paginatedLead.Phone,
      documentNumber: parseInt(paginatedLead.DocumentNumber) || 0,
      company: paginatedLead.Company,
      occupation: paginatedLead.Occupation,
      source: paginatedLead.Source,
      campaign: paginatedLead.Campaign,
      product: paginatedLead.Product,
      stage: paginatedLead.Stage,
      priority: paginatedLead.Priority,
      value: parseFloat(paginatedLead.Value) || 0,
      assignedTo: paginatedLead.AssignedTo,
      assignedToName: paginatedLead.AssignedToName,
      createdBy: paginatedLead.CreatedBy,
      createdAt: paginatedLead.CreatedAt,
      updatedAt: paginatedLead.UpdatedAt,
      nextFollowUp: paginatedLead.NextFollowUp,
      notes: paginatedLead.Notes,
      tags,
      documentType: paginatedLead.DocumentType,
      portfolios,
      campaignOwnerName: paginatedLead.CampaignOwnerName,
      age: paginatedLead.Age ? parseInt(paginatedLead.Age) : undefined,
      gender: paginatedLead.Gender,
      preferredContactChannel: paginatedLead.PreferredContactChannel,
      status: "New" as LeadStatus,
      portfolio: portfolios[0] || "Portfolio A",
      ...additionalInfo,
      lastGestorUserId: paginatedLead.LastGestorUserId,
      lastGestorName: paginatedLead.LastGestorName,
      lastGestorInteractionAt: paginatedLead.LastGestorInteractionAt,
      lastGestorInteractionStage: paginatedLead.LastGestorInteractionStage,
      lastGestorInteractionDescription: paginatedLead.LastGestorInteractionDescription,
    };
  };

  // Cargar todos los leads con stage="Nuevo" usando llamadas paginadas
  // SOLO si no hay leads seleccionados
  useEffect(() => {
    const loadAllNewLeads = async () => {
      // Si hay leads seleccionados, usarlos directamente
      if (leads.length > 0) {
        console.log(`✅ Using ${leads.length} selected leads`);
        // Filtrar solo los que están en estado Nuevo
        const newLeads = leads.filter(
          (lead) =>
            lead.stage?.toLowerCase() === "nuevo" ||
            lead.stage?.toLowerCase() === "new" ||
            lead.stage === "Nuevo" ||
            lead.stage === "new",
        );
        setAllNewLeads(newLeads);
        setIsLoadingLeads(false);
        return;
      }

      // Si NO hay selección, cargar todos los leads nuevos del API
      setIsLoadingLeads(true);
      console.log('🔄 No selection detected. Loading all leads with stage="Nuevo"...');

      try {
        const allLeads: Lead[] = [];
        let currentPage = 1;
        let totalPages = 1;
        const pageSize = 100;

        // Hacer llamadas paginadas hasta obtener todos los leads
        while (currentPage <= totalPages) {
          console.log(`📡 Fetching page ${currentPage} of ${totalPages}...`);

          const response = await getReassignableLeadsPaginated({
            page: currentPage,
            page_size: pageSize,
            filters: {
              Stage: { op: "eq", value: "Nuevo" },
            },
          });

          const mappedLeads = response.items.map(mapPaginatedLeadToLead);
          allLeads.push(...mappedLeads);

          totalPages = response.total_pages;
          currentPage++;

          console.log(`✅ Loaded ${mappedLeads.length} leads from page ${currentPage - 1}`);
        }

        console.log(`✅ Total leads loaded: ${allLeads.length}`);
        setAllNewLeads(allLeads);
      } catch (error) {
        console.error("❌ Error loading new leads:", error);
        toast({
          title: "Error",
          description: "Error al cargar leads nuevos",
          variant: "destructive",
        });
      } finally {
        setIsLoadingLeads(false);
      }
    };

    loadAllNewLeads();
  }, [leads]);

  // Obtener campañas únicas de los leads cargados
  const uniqueCampaigns = Array.from(new Set(allNewLeads.map((lead) => lead.campaign).filter(Boolean)));

  // Filtrar leads por campaña seleccionada
  const filteredLeads = allNewLeads.filter((lead) => {
    const matchesCampaign = selectedCampaign === "all" || lead.campaign === selectedCampaign;
    return matchesCampaign;
  });

  console.log("Filtered leads for assignment:", filteredLeads.length);
  console.log("Gestor users:", gestorUsers);

  // Función helper para mezclar arrays aleatoriamente (Fisher-Yates shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Inicializar asignaciones cuando cambien los usuarios gestores
  useEffect(() => {
    if (gestorUsers.length > 0) {
      console.log("🔄 Initializing user assignments for", gestorUsers.length, "gestors");
      setUserAssignments(
        gestorUsers.map((user) => ({
          userId: user.Id,
          userName: user.Name,
          quantity: 0,
        })),
      );
    }
  }, [gestorUsers]); // Depender del array completo, no solo length

  // Resetear asignaciones cuando cambie la campaña
  useEffect(() => {
    if (gestorUsers.length > 0) {
      console.log("🔄 Resetting assignments for campaign change");
      setUserAssignments(
        gestorUsers.map((user) => ({
          userId: user.Id,
          userName: user.Name,
          quantity: 0,
        })),
      );
    }
  }, [selectedCampaign, gestorUsers]); // Incluir gestorUsers para evitar closures stale

  const handleEquitableAssignment = useCallback(() => {
    if (gestorUsers.length === 0 || filteredLeads.length === 0) {
      console.log("❌ Cannot distribute: no gestors or no leads");
      return;
    }

    const totalLeads = filteredLeads.length;
    const baseQuantity = Math.floor(totalLeads / gestorUsers.length);
    const remainder = totalLeads % gestorUsers.length;

    console.log("📊 Distributing equitably and randomly:", { totalLeads, baseQuantity, remainder, gestorCount: gestorUsers.length });

    // Aleatorizar el orden de los gestores para distribución justa
    const randomizedGestors = shuffleArray(gestorUsers);
    console.log("🎲 Randomized gestors order:", randomizedGestors.map(g => g.Name));

    const newAssignments = randomizedGestors.map((user, index) => ({
      userId: user.Id,
      userName: user.Name,
      quantity: baseQuantity + (index < remainder ? 1 : 0),
    }));

    console.log("✅ New random equitable assignments:", newAssignments);
    setUserAssignments(newAssignments);
  }, [gestorUsers, filteredLeads.length]);

  const updateUserQuantity = (userId: string, quantity: number) => {
    console.log("Updating quantity for user", userId, "to", quantity);

    // Asegurar que la cantidad esté dentro del rango válido
    const validQuantity = Math.max(0, Math.min(quantity || 0, filteredLeads.length));

    setUserAssignments((prev) => {
      const updated = prev.map((assignment) =>
        assignment.userId === userId ? { ...assignment, quantity: validQuantity } : assignment,
      );
      console.log("Updated assignments:", updated);
      return updated;
    });
  };

  const addUserAssignment = () => {
    console.log("Adding user assignment");
    const availableUsers = gestorUsers.filter(
      (user) => !userAssignments.some((assignment) => assignment.userId === user.Id),
    );

    if (availableUsers.length > 0) {
      const newUser = availableUsers[0];
      console.log("Adding user:", newUser.Name);
      setUserAssignments((prev) => {
        const updated = [
          ...prev,
          {
            userId: newUser.Id,
            userName: newUser.Name,
            quantity: 0,
          },
        ];
        console.log("Updated assignments after add:", updated);
        return updated;
      });
    } else {
      console.log("No available users to add");
    }
  };

  const removeUserAssignment = (userId: string) => {
    console.log("Removing user assignment for:", userId);
    setUserAssignments((prev) => {
      const updated = prev.filter((assignment) => assignment.userId !== userId);
      console.log("Updated assignments after remove:", updated);
      return updated;
    });
  };

  const getTotalAssigned = () => {
    const total = userAssignments.reduce((sum, assignment) => sum + (assignment.quantity || 0), 0);
    console.log("Total assigned:", total);
    return total;
  };

  const handleAssign = async () => {
    const totalAssigned = getTotalAssigned();

    console.log("🚀 Starting assignment process. Total to assign:", totalAssigned);

    if (totalAssigned === 0) {
      toast({
        title: "Error",
        description: "Debe asignar al menos un lead",
        variant: "destructive",
      });
      return;
    }

    if (totalAssigned > filteredLeads.length) {
      toast({
        title: "Error",
        description: `No se pueden asignar ${totalAssigned} leads cuando solo hay ${filteredLeads.length} disponibles`,
        variant: "destructive",
      });
      return;
    }

    // VALIDACIÓN CRÍTICA: Filtrar solo asignaciones a usuarios que son gestores
    const validAssignments = userAssignments.filter(assignment => {
      const isGestor = gestorUserIds.has(assignment.userId);
      if (!isGestor && assignment.quantity > 0) {
        console.warn(`⚠️ Filtering out non-gestor user from assignment: ${assignment.userName} (${assignment.userId})`);
      }
      return isGestor && assignment.quantity > 0;
    });

    console.log("✅ Valid gestor assignments:", validAssignments.map(a => ({ name: a.userName, qty: a.quantity })));

    if (validAssignments.length === 0) {
      toast({
        title: "Error",
        description: "No hay gestores válidos para asignar leads",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);

    try {
      // Aleatorizar los leads antes de distribuir para asignación justa
      const randomizedLeads = shuffleArray(filteredLeads);
      console.log("🎲 Leads randomized for fair distribution");

      // Usar la nueva API de asignación masiva
      let leadIndex = 0;
      const bulkAssignPromises: Promise<any>[] = [];
      let totalSuccess = 0;
      let totalSkipped = 0;
      let totalFailed = 0;
      const successfulLeadIds: string[] = [];

      // USAR validAssignments en lugar de userAssignments
      for (const assignment of validAssignments) {
        // Tomar los leads necesarios para este usuario (ahora aleatorizados)
        const leadsToAssign = randomizedLeads.slice(leadIndex, leadIndex + assignment.quantity);
        const leadIds = leadsToAssign.map((lead) => lead.id);

        console.log(`📤 Assigning ${leadIds.length} leads to gestor ${assignment.userName} (${assignment.userId})`);

        // Llamar a la nueva API de bulk-assign
        if (leadIds.length > 0) {
          const assignmentPromise = bulkAssignLeads({
            leadIds,
            toUserId: assignment.userId,
            reason: "Asignación masiva",
            notes: `Asignado masivamente a ${assignment.userName}`,
          }).then((response) => {
            console.log(`✅ Bulk assignment response for ${assignment.userName}:`, response);
            totalSuccess += response.summary.success;
            totalSkipped += response.summary.skipped;
            totalFailed += response.summary.failed;
            // Guardar los IDs de leads exitosamente asignados
            if (response.successLeads && response.successLeads.length > 0) {
              successfulLeadIds.push(...response.successLeads);
            }
            return response;
          });

          bulkAssignPromises.push(assignmentPromise);
        }

        leadIndex += assignment.quantity;
      }

      // Ejecutar todas las asignaciones masivas
      await Promise.all(bulkAssignPromises);

      // Cambiar el stage de los leads exitosamente asignados a "Asignado"
      if (successfulLeadIds.length > 0) {
        console.log(`🔄 Changing stage to "Asignado" for ${successfulLeadIds.length} leads`);
        try {
          const stageResult = await bulkChangeLeadStage(successfulLeadIds, "Asignado");
          console.log(`✅ Stage change result:`, stageResult);
        } catch (stageError) {
          console.error("❌ Error changing stage:", stageError);
          // No fallar todo el proceso si solo falla el cambio de stage
          toast({
            title: "Advertencia",
            description: "Leads asignados correctamente, pero hubo un error al actualizar su estado",
            variant: "destructive",
          });
        }
      }

      // Mostrar resultado consolidado
      if (totalFailed === 0 && totalSkipped === 0) {
        toast({
          title: "Éxito",
          description: `${totalSuccess} leads asignados exitosamente y su estado actualizado a "Asignado"`,
        });
      } else if (totalSuccess > 0) {
        toast({
          title: "Asignación completada",
          description: `Exitosos: ${totalSuccess} | Omitidos: ${totalSkipped} | Fallidos: ${totalFailed}`,
        });
      } else {
        toast({
          title: "Error",
          description: `No se pudo asignar ningún lead. Fallidos: ${totalFailed}`,
          variant: "destructive",
        });
      }

      onLeadsAssigned();

      // Resetear estado
      setSelectedCampaign("all");
      setAssignmentType("equitable");
      if (gestorUsers.length > 0) {
        setUserAssignments(
          gestorUsers.map((user) => ({
            userId: user.Id,
            userName: user.Name,
            quantity: 0,
          })),
        );
      }
    } catch (error) {
      console.error("Error assigning leads:", error);
      toast({
        title: "Error",
        description: "Error al asignar leads. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleTypeChange = (value: "equitable" | "specific") => {
    console.log("Changing assignment type to:", value);
    setAssignmentType(value);
    // Resetear cantidades al cambiar tipo
    setUserAssignments((prev) =>
      prev.map((assignment) => ({
        ...assignment,
        quantity: 0,
      })),
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Asignación Masiva de Leads</DialogTitle>
      </DialogHeader>

      {isLoadingLeads ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando todos los leads nuevos...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filtro de campaña */}
          <div>
            <Label>Filtrar por campaña</Label>
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las campañas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las campañas</SelectItem>
                {uniqueCampaigns.map((campaign) => (
                  <SelectItem key={campaign} value={campaign || ""}>
                    {campaign || "Sin campaña"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Información de leads disponibles */}
          <div className="p-2 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Leads nuevos disponibles:</strong> {filteredLeads.length}
            </p>
            {selectedCampaign !== "all" && <p className="text-sm text-blue-700">Campaña: {selectedCampaign}</p>}
          </div>

          {/* Tipo de asignación */}
          <div>
            <Label>Tipo de asignación</Label>
            <Select value={assignmentType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equitable">Asignación equitativa</SelectItem>
                <SelectItem value="specific">Cantidad específica por gestor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón de asignación equitativa */}
          {assignmentType === "equitable" && (
            <div>
              <Button
                onClick={handleEquitableAssignment}
                variant="outline"
                className="w-full"
                disabled={filteredLeads.length === 0 || gestorUsers.length === 0}
              >
                Distribuir equitativamente entre gestores
              </Button>
            </div>
          )}

          <Separator />

          {/* Lista de asignaciones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Asignaciones por gestor</Label>
              {assignmentType === "specific" && (
                <Button
                  onClick={addUserAssignment}
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  disabled={userAssignments.length >= gestorUsers.length}
                >
                  <Plus className="h-3 w-3" />
                  Agregar gestor
                </Button>
              )}
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {userAssignments.map((assignment) => (
                <div key={assignment.userId} className="flex items-center gap-3 p-2 border rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium">{assignment.userName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Cantidad:</Label>
                    <Input
                      type="number"
                      min="0"
                      max={filteredLeads.length}
                      value={assignment.quantity}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        console.log("Input change for user", assignment.userId, ":", newValue);
                        updateUserQuantity(assignment.userId, isNaN(newValue) ? 0 : newValue);
                      }}
                      className="w-20"
                      disabled={assignmentType === "equitable"}
                    />
                  </div>

                  {assignmentType === "specific" && userAssignments.length > 1 && (
                    <Button
                      onClick={() => removeUserAssignment(assignment.userId)}
                      size="sm"
                      variant="outline"
                      className="p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex justify-between text-sm">
                <span>Total a asignar:</span>
                <span className="font-medium">{getTotalAssigned()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Leads disponibles:</span>
                <span className="font-medium">{filteredLeads.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Restantes:</span>
                <span
                  className={`font-medium ${filteredLeads.length - getTotalAssigned() < 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {filteredLeads.length - getTotalAssigned()}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAssign}
              disabled={getTotalAssigned() === 0 || getTotalAssigned() > filteredLeads.length || isAssigning}
              className="flex-1"
            >
              {isAssigning ? "Asignando..." : "Asignar Leads"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
