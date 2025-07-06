
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Users, Plus, Trash2 } from "lucide-react";
import { Lead } from "@/types/crm";
import { useUsersApi } from "@/hooks/useUsersApi";
import { useToast } from "@/hooks/use-toast";
import { bulkAssignLeads, changeLeadStage } from "@/utils/leadsApiClient";

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
  const [open, setOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [assignmentType, setAssignmentType] = useState<"equitable" | "specific">("equitable");
  const [userAssignments, setUserAssignments] = useState<UserAssignment[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const { users } = useUsersApi();
  const { toast } = useToast();

  // Filtrar solo usuarios con rol de gestor
  const gestorUsers = users.filter(user => user.role === 'gestor');

  // Obtener campañas únicas
  const uniqueCampaigns = Array.from(new Set(leads.map(lead => lead.campaign).filter(Boolean)));

  // Filtrar leads nuevos por campaña
  const filteredLeads = leads.filter(lead => {
    const isNewStage = lead.stage?.toLowerCase() === 'nuevo' || 
                      lead.stage?.toLowerCase() === 'new' || 
                      lead.stage === 'Nuevo' || 
                      lead.stage === 'new';
    
    const matchesCampaign = selectedCampaign === "all" || lead.campaign === selectedCampaign;
    
    return isNewStage && matchesCampaign;
  });

  console.log('Filtered leads for assignment:', filteredLeads.length);
  console.log('Gestor users:', gestorUsers);

  // Inicializar asignaciones cuando cambien los usuarios gestores
  useEffect(() => {
    if (gestorUsers.length > 0) {
      console.log('Initializing user assignments for', gestorUsers.length, 'gestors');
      setUserAssignments(gestorUsers.map(user => ({
        userId: user.id,
        userName: user.name,
        quantity: 0
      })));
    }
  }, [gestorUsers.length]);

  // Resetear asignaciones cuando cambie la campaña
  useEffect(() => {
    if (gestorUsers.length > 0) {
      console.log('Resetting assignments for campaign change');
      setUserAssignments(gestorUsers.map(user => ({
        userId: user.id,
        userName: user.name,
        quantity: 0
      })));
    }
  }, [selectedCampaign]);

  const handleEquitableAssignment = () => {
    if (gestorUsers.length === 0 || filteredLeads.length === 0) {
      console.log('Cannot distribute: no gestors or no leads');
      return;
    }
    
    const totalLeads = filteredLeads.length;
    const baseQuantity = Math.floor(totalLeads / gestorUsers.length);
    const remainder = totalLeads % gestorUsers.length;

    console.log('Distributing equitably:', { totalLeads, baseQuantity, remainder });

    const newAssignments = gestorUsers.map((user, index) => ({
      userId: user.id,
      userName: user.name,
      quantity: baseQuantity + (index < remainder ? 1 : 0)
    }));

    console.log('New equitable assignments:', newAssignments);
    setUserAssignments(newAssignments);
  };

  const updateUserQuantity = (userId: string, quantity: number) => {
    console.log('Updating quantity for user', userId, 'to', quantity);
    
    // Asegurar que la cantidad esté dentro del rango válido
    const validQuantity = Math.max(0, Math.min(quantity || 0, filteredLeads.length));
    
    setUserAssignments(prev => {
      const updated = prev.map(assignment =>
        assignment.userId === userId 
          ? { ...assignment, quantity: validQuantity }
          : assignment
      );
      console.log('Updated assignments:', updated);
      return updated;
    });
  };

  const addUserAssignment = () => {
    console.log('Adding user assignment');
    const availableUsers = gestorUsers.filter(user => 
      !userAssignments.some(assignment => assignment.userId === user.id)
    );
    
    if (availableUsers.length > 0) {
      const newUser = availableUsers[0];
      console.log('Adding user:', newUser.name);
      setUserAssignments(prev => {
        const updated = [...prev, {
          userId: newUser.id,
          userName: newUser.name,
          quantity: 0
        }];
        console.log('Updated assignments after add:', updated);
        return updated;
      });
    } else {
      console.log('No available users to add');
    }
  };

  const removeUserAssignment = (userId: string) => {
    console.log('Removing user assignment for:', userId);
    setUserAssignments(prev => {
      const updated = prev.filter(assignment => assignment.userId !== userId);
      console.log('Updated assignments after remove:', updated);
      return updated;
    });
  };

  const getTotalAssigned = () => {
    const total = userAssignments.reduce((sum, assignment) => sum + (assignment.quantity || 0), 0);
    console.log('Total assigned:', total);
    return total;
  };

  const handleAssign = async () => {
    const totalAssigned = getTotalAssigned();
    
    console.log('Starting assignment process. Total to assign:', totalAssigned);
    
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

    setIsAssigning(true);

    try {
      // Crear lista de leads para asignar
      let leadIndex = 0;
      const assignmentPromises: Promise<void>[] = [];
      const stageChangePromises: Promise<void>[] = [];

      for (const assignment of userAssignments) {
        if (assignment.quantity > 0) {
          // Tomar los leads necesarios para este usuario
          const leadsToAssign = filteredLeads.slice(leadIndex, leadIndex + assignment.quantity);
          const leadIds = leadsToAssign.map(lead => lead.id);
          
          console.log(`Assigning ${leadIds.length} leads to user ${assignment.userName}:`, leadIds);
          
          // Asignar leads a este usuario
          if (leadIds.length > 0) {
            assignmentPromises.push(bulkAssignLeads(leadIds, assignment.userId));
            
            // Cambiar el estado de cada lead de "Nuevo" a "Asignado"
            leadIds.forEach(leadId => {
              stageChangePromises.push(changeLeadStage(leadId, "Asignado"));
            });
          }
          
          leadIndex += assignment.quantity;
        }
      }

      // Ejecutar todas las asignaciones
      await Promise.all(assignmentPromises);
      
      // Ejecutar todos los cambios de estado
      await Promise.all(stageChangePromises);
      
      toast({
        title: "Éxito",
        description: `${totalAssigned} leads asignados exitosamente y cambiados a estado Asignado`,
      });
      
      onLeadsAssigned();
      setOpen(false);
      
      // Resetear estado
      setSelectedCampaign("all");
      setAssignmentType("equitable");
      if (gestorUsers.length > 0) {
        setUserAssignments(gestorUsers.map(user => ({
          userId: user.id,
          userName: user.name,
          quantity: 0
        })));
      }
      
    } catch (error) {
      console.error('Error assigning leads:', error);
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
    console.log('Changing assignment type to:', value);
    setAssignmentType(value);
    // Resetear cantidades al cambiar tipo
    setUserAssignments(prev => prev.map(assignment => ({
      ...assignment,
      quantity: 0
    })));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asignación Masiva de Leads</DialogTitle>
        </DialogHeader>
        
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
                {uniqueCampaigns.map(campaign => (
                  <SelectItem key={campaign} value={campaign || ''}>
                    {campaign || 'Sin campaña'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Información de leads disponibles */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Leads nuevos disponibles:</strong> {filteredLeads.length}
            </p>
            {selectedCampaign !== "all" && (
              <p className="text-sm text-blue-700">
                Campaña: {selectedCampaign}
              </p>
            )}
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
                <div key={assignment.userId} className="flex items-center gap-3 p-3 border rounded-lg">
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
                        console.log('Input change for user', assignment.userId, ':', newValue);
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
            <div className="p-3 bg-gray-50 rounded-lg">
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
                <span className={`font-medium ${filteredLeads.length - getTotalAssigned() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {filteredLeads.length - getTotalAssigned()}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAssign}
              disabled={getTotalAssigned() === 0 || getTotalAssigned() > filteredLeads.length || isAssigning}
              className="flex-1"
            >
              {isAssigning ? 'Asignando...' : 'Asignar Leads'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isAssigning}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
