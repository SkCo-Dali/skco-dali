import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Loader2, Users, Check, X } from "lucide-react";
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
  userRole: string;
  quantity: number;
  enabled: boolean;
}

// All available stages in the system
const AVAILABLE_STAGES = [
  "Nuevo",
  "Asignado",
  "Contactado",
  "Localizado: Prospecto de venta FP",
  "Localizado: Prospecto de venta AD",
  "Localizado: Prospecto de venta - Pendiente",
  "Contrato Creado",
  "Localizado: No interesado",
];

export function LeadsBulkAssignment({ leads, onLeadsAssigned }: LeadsBulkAssignmentProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [assignmentType, setAssignmentType] = useState<"equitable" | "specific">("equitable");
  const [userAssignments, setUserAssignments] = useState<UserAssignment[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>(["Nuevo"]);
  const { users } = useAssignableUsers();
  const { toast } = useToast();

  // Get all unique roles from assignable users
  const availableRoles = useMemo(() => {
    const roles = new Set(users.map((user) => user.Role).filter(Boolean));
    return Array.from(roles).sort();
  }, [users]);

  // Filter users by selected roles (if any selected)
  const filteredUsers = useMemo(() => {
    if (selectedRoles.length === 0) {
      return users;
    }
    return users.filter((user) => selectedRoles.includes(user.Role));
  }, [users, selectedRoles]);

  // Get enabled users for equitable distribution
  const enabledUsers = useMemo(() => {
    return userAssignments.filter((ua) => ua.enabled);
  }, [userAssignments]);

  // IDs of enabled users for validation
  const enabledUserIds = useMemo(() => new Set(enabledUsers.map((u) => u.userId)), [enabledUsers]);

  // Map PaginatedLead to Lead
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

  // Load leads with selected stages using paginated calls
  useEffect(() => {
    const loadLeadsByStages = async () => {
      if (selectedStages.length === 0) {
        setAllLeads([]);
        setIsLoadingLeads(false);
        return;
      }

      if (leads.length > 0) {
        console.log(`✅ Using ${leads.length} selected leads`);
        const filteredByStage = leads.filter((lead) =>
          selectedStages.some(
            (stage) => lead.stage?.toLowerCase() === stage.toLowerCase() || lead.stage === stage,
          ),
        );
        setAllLeads(filteredByStage);
        setIsLoadingLeads(false);
        return;
      }

      setIsLoadingLeads(true);
      console.log(`🔄 No selection detected. Loading leads with stages: ${selectedStages.join(", ")}...`);

      try {
        const loadedLeads: Lead[] = [];

        // Load leads for each selected stage
        for (const stage of selectedStages) {
          let currentPage = 1;
          let totalPages = 1;
          const pageSize = 100;

          while (currentPage <= totalPages) {
            console.log(`📡 Fetching ${stage} - page ${currentPage} of ${totalPages}...`);

            const response = await getReassignableLeadsPaginated({
              page: currentPage,
              page_size: pageSize,
              filters: {
                Stage: { op: "eq", value: stage },
              },
            });

            const mappedLeads = response.items.map(mapPaginatedLeadToLead);
            loadedLeads.push(...mappedLeads);

            totalPages = response.total_pages;
            currentPage++;

            console.log(`✅ Loaded ${mappedLeads.length} leads from ${stage} page ${currentPage - 1}`);
          }
        }

        console.log(`✅ Total leads loaded: ${loadedLeads.length}`);
        setAllLeads(loadedLeads);
      } catch (error) {
        console.error("❌ Error loading leads:", error);
        toast({
          title: "Error",
          description: "Error al cargar leads",
          variant: "destructive",
        });
      } finally {
        setIsLoadingLeads(false);
      }
    };

    loadLeadsByStages();
  }, [leads, selectedStages]);

  // Get unique campaigns from loaded leads
  const uniqueCampaigns = Array.from(new Set(allLeads.map((lead) => lead.campaign).filter(Boolean)));

  // Count leads per stage
  const leadsPerStage = useMemo(() => {
    const counts: Record<string, number> = {};
    selectedStages.forEach((stage) => {
      counts[stage] = allLeads.filter(
        (lead) => lead.stage?.toLowerCase() === stage.toLowerCase() || lead.stage === stage,
      ).length;
    });
    return counts;
  }, [allLeads, selectedStages]);

  // Filter leads by selected campaign
  const filteredLeads = allLeads.filter((lead) => {
    const matchesCampaign = selectedCampaign === "all" || lead.campaign === selectedCampaign;
    return matchesCampaign;
  });

  // Fisher-Yates shuffle helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize assignments when filtered users change
  useEffect(() => {
    if (filteredUsers.length > 0) {
      console.log("🔄 Initializing user assignments for", filteredUsers.length, "users");
      setUserAssignments(
        filteredUsers.map((user) => ({
          userId: user.Id,
          userName: user.Name,
          userRole: user.Role,
          quantity: 0,
          enabled: true,
        })),
      );
    } else {
      setUserAssignments([]);
    }
  }, [filteredUsers]);

  // Reset quantities when campaign changes
  useEffect(() => {
    setUserAssignments((prev) =>
      prev.map((assignment) => ({
        ...assignment,
        quantity: 0,
      })),
    );
  }, [selectedCampaign]);

  const handleEquitableAssignment = useCallback(() => {
    const usersToDistribute = enabledUsers;
    if (usersToDistribute.length === 0 || filteredLeads.length === 0) {
      console.log("❌ Cannot distribute: no enabled users or no leads");
      return;
    }

    const totalLeads = filteredLeads.length;
    const baseQuantity = Math.floor(totalLeads / usersToDistribute.length);
    const remainder = totalLeads % usersToDistribute.length;

    console.log("📊 Distributing equitably and randomly:", {
      totalLeads,
      baseQuantity,
      remainder,
      userCount: usersToDistribute.length,
    });

    // Randomize user order for fair distribution
    const randomizedUsers = shuffleArray(usersToDistribute);
    console.log(
      "🎲 Randomized users order:",
      randomizedUsers.map((g) => g.userName),
    );

    // Create map of new quantities for enabled users
    const newQuantities = new Map<string, number>();
    randomizedUsers.forEach((user, index) => {
      newQuantities.set(user.userId, baseQuantity + (index < remainder ? 1 : 0));
    });

    // Update assignments keeping enabled state
    setUserAssignments((prev) =>
      prev.map((assignment) => ({
        ...assignment,
        quantity: assignment.enabled ? (newQuantities.get(assignment.userId) || 0) : 0,
      })),
    );
  }, [enabledUsers, filteredLeads.length]);

  const toggleUserEnabled = (userId: string) => {
    setUserAssignments((prev) =>
      prev.map((assignment) =>
        assignment.userId === userId
          ? { ...assignment, enabled: !assignment.enabled, quantity: !assignment.enabled ? assignment.quantity : 0 }
          : assignment,
      ),
    );
  };

  const toggleAllUsers = (enabled: boolean) => {
    setUserAssignments((prev) =>
      prev.map((assignment) => ({
        ...assignment,
        enabled,
        quantity: enabled ? assignment.quantity : 0,
      })),
    );
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) => {
      if (prev.includes(stage)) {
        // Don't allow deselecting all stages
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== stage);
      }
      return [...prev, stage];
    });
  };

  const updateUserQuantity = (userId: string, quantity: number) => {
    const validQuantity = Math.max(0, Math.min(quantity || 0, filteredLeads.length));

    setUserAssignments((prev) =>
      prev.map((assignment) => (assignment.userId === userId ? { ...assignment, quantity: validQuantity } : assignment)),
    );
  };

  const addUserAssignment = () => {
    const availableUsers = filteredUsers.filter(
      (user) => !userAssignments.some((assignment) => assignment.userId === user.Id),
    );

    if (availableUsers.length > 0) {
      const newUser = availableUsers[0];
      setUserAssignments((prev) => [
        ...prev,
        {
          userId: newUser.Id,
          userName: newUser.Name,
          userRole: newUser.Role,
          quantity: 0,
          enabled: true,
        },
      ]);
    }
  };

  const removeUserAssignment = (userId: string) => {
    setUserAssignments((prev) => prev.filter((assignment) => assignment.userId !== userId));
  };

  const getTotalAssigned = () => {
    return userAssignments.reduce((sum, assignment) => sum + (assignment.quantity || 0), 0);
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

    // Filter only enabled users with quantity > 0
    const validAssignments = userAssignments.filter((assignment) => assignment.enabled && assignment.quantity > 0);

    console.log(
      "✅ Valid assignments:",
      validAssignments.map((a) => ({ name: a.userName, role: a.userRole, qty: a.quantity })),
    );

    if (validAssignments.length === 0) {
      toast({
        title: "Error",
        description: "No hay usuarios habilitados para asignar leads",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);

    try {
      // Randomize leads before distribution
      const randomizedLeads = shuffleArray(filteredLeads);
      console.log("🎲 Leads randomized for fair distribution");

      let leadIndex = 0;
      let totalSuccess = 0;
      let totalSkipped = 0;
      let totalFailed = 0;
      const successfulLeadIds: string[] = [];

      // Execute sequentially to avoid database deadlocks
      for (const assignment of validAssignments) {
        const leadsToAssign = randomizedLeads.slice(leadIndex, leadIndex + assignment.quantity);
        const leadIds = leadsToAssign.map((lead) => lead.id);

        console.log(`📤 Assigning ${leadIds.length} leads to ${assignment.userName} (${assignment.userRole})`);

        if (leadIds.length > 0) {
          try {
            const response = await bulkAssignLeads({
              leadIds,
              toUserId: assignment.userId,
              reason: "Asignación masiva",
              notes: `Asignado masivamente a ${assignment.userName}`,
            });

            console.log(`✅ Bulk assignment response for ${assignment.userName}:`, response);
            totalSuccess += response.summary.success;
            totalSkipped += response.summary.skipped;
            totalFailed += response.summary.failed;

            if (response.failedLeads && response.failedLeads.length > 0) {
              console.error(`❌ Failed leads for ${assignment.userName}:`, response.failedLeads);
            }

            if (response.successLeads && response.successLeads.length > 0) {
              successfulLeadIds.push(...response.successLeads);
            }
          } catch (assignError) {
            console.error(`❌ Error assigning leads to ${assignment.userName}:`, assignError);
            totalFailed += leadIds.length;
          }
        }

        leadIndex += assignment.quantity;
      }

      // Change stage of successfully assigned leads to "Asignado"
      if (successfulLeadIds.length > 0) {
        console.log(`🔄 Changing stage to "Asignado" for ${successfulLeadIds.length} leads`);
        try {
          const stageResult = await bulkChangeLeadStage(successfulLeadIds, "Asignado");
          console.log(`✅ Stage change result:`, stageResult);
        } catch (stageError) {
          console.error("❌ Error changing stage:", stageError);
          toast({
            title: "Advertencia",
            description: "Leads asignados correctamente, pero hubo un error al actualizar su estado",
            variant: "destructive",
          });
        }
      }

      // Show consolidated result
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

      // Reset state
      setSelectedCampaign("all");
      setAssignmentType("equitable");
      if (filteredUsers.length > 0) {
        setUserAssignments(
          filteredUsers.map((user) => ({
            userId: user.Id,
            userName: user.Name,
            userRole: user.Role,
            quantity: 0,
            enabled: true,
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
    setAssignmentType(value);
    setUserAssignments((prev) =>
      prev.map((assignment) => ({
        ...assignment,
        quantity: 0,
      })),
    );
  };

  // Role badge color helper
  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role?.toLowerCase()) {
      case "director":
        return "default";
      case "supervisor":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Asignación Masiva de Leads</DialogTitle>
      </DialogHeader>

      {isLoadingLeads ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando leads ({selectedStages.join(", ")})...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stage filter */}
          <div>
            <Label className="mb-2 block">Filtrar por estado de lead</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => toggleStage(stage)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedStages.includes(stage)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  {stage}
                  {selectedStages.includes(stage) && leadsPerStage[stage] !== undefined && (
                    <span className="ml-1.5 text-xs opacity-80">({leadsPerStage[stage]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign filter */}
          <div>
            <Label>Filtrar por campaña</Label>
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las campañas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las campañas</SelectItem>
                {uniqueCampaigns.map((campaign) => (
                  <SelectItem key={campaign as string} value={(campaign as string) || ""}>
                    {(campaign as string) || "Sin campaña"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available leads info */}
          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Leads disponibles:</strong> {filteredLeads.length}
              {selectedStages.length > 0 && (
                <span className="ml-2 text-xs">
                  ({selectedStages.map((s) => `${s}: ${leadsPerStage[s] || 0}`).join(" | ")})
                </span>
              )}
            </p>
            {selectedCampaign !== "all" && (
              <p className="text-sm text-blue-700 dark:text-blue-300">Campaña: {selectedCampaign}</p>
            )}
          </div>

          {/* Role filter */}
          {availableRoles.length > 1 && (
            <div>
              <Label className="mb-2 block">Filtrar por rol</Label>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selectedRoles.includes(role)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    {role}
                  </button>
                ))}
                {selectedRoles.length > 0 && (
                  <button
                    onClick={() => setSelectedRoles([])}
                    className="px-3 py-1.5 text-sm rounded-full border border-border bg-background hover:bg-muted text-muted-foreground"
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Assignment type */}
          <div>
            <Label>Tipo de asignación</Label>
            <Select value={assignmentType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equitable">Asignación equitativa</SelectItem>
                <SelectItem value="specific">Cantidad específica por usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Equitable assignment button */}
          {assignmentType === "equitable" && (
            <div>
              <Button
                onClick={handleEquitableAssignment}
                variant="outline"
                className="w-full"
                disabled={filteredLeads.length === 0 || enabledUsers.length === 0}
              >
                <Users className="h-4 w-4 mr-2" />
                Distribuir equitativamente entre equipo
              </Button>
            </div>
          )}

          <Separator />

          {/* Assignments list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Asignaciones por usuario</Label>
                <Badge variant="outline" className="text-xs">
                  {enabledUsers.length} de {userAssignments.length} activos
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {assignmentType === "equitable" && userAssignments.length > 0 && (
                  <>
                    <Button onClick={() => toggleAllUsers(true)} size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Todos
                    </Button>
                    <Button onClick={() => toggleAllUsers(false)} size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      <X className="h-3 w-3 mr-1" />
                      Ninguno
                    </Button>
                  </>
                )}
                {assignmentType === "specific" && (
                  <Button
                    onClick={addUserAssignment}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={userAssignments.length >= filteredUsers.length}
                  >
                    <Plus className="h-3 w-3" />
                    Agregar
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {userAssignments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay usuarios disponibles para asignar
                </div>
              ) : (
                userAssignments.map((assignment) => (
                  <div
                    key={assignment.userId}
                    className={`flex items-center gap-3 p-2 border rounded-xl transition-opacity ${
                      !assignment.enabled ? "opacity-50" : ""
                    }`}
                  >
                    {/* Toggle for equitable mode */}
                    {assignmentType === "equitable" && (
                      <Switch
                        checked={assignment.enabled}
                        onCheckedChange={() => toggleUserEnabled(assignment.userId)}
                        className="data-[state=checked]:bg-primary"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{assignment.userName}</p>
                        <Badge variant={getRoleBadgeVariant(assignment.userRole)} className="text-xs shrink-0">
                          {assignment.userRole}
                        </Badge>
                      </div>
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
                          updateUserQuantity(assignment.userId, isNaN(newValue) ? 0 : newValue);
                        }}
                        className="w-20"
                        disabled={assignmentType === "equitable" || !assignment.enabled}
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
                ))
              )}
            </div>

            {/* Summary */}
            <div className="p-3 bg-muted rounded-xl">
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
                  className={`font-medium ${filteredLeads.length - getTotalAssigned() < 0 ? "text-destructive" : "text-green-600"}`}
                >
                  {filteredLeads.length - getTotalAssigned()}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
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
