import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LeadAssigneeSelect } from "@/components/LeadAssigneeSelect";
import { Lead } from "@/types/crm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLeadAssignments } from "@/hooks/useLeadAssignments";
import { useAssignableUsers } from "@/contexts/AssignableUsersContext";
import { UserCheck } from "lucide-react";

interface LeadReassignDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newUserId: string) => void;
}

export function LeadReassignDialog({ lead, isOpen, onClose, onSuccess }: LeadReassignDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [reason, setReason] = useState<string>("No informa");
  const [notes, setNotes] = useState<string>("Sin info");
  
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { loading: reassignLoading, handleReassignLead } = useLeadAssignments();
  const { users: assignableUsers, loading: loadingUsers } = useAssignableUsers();

  // Filtrar para excluir al usuario actualmente asignado
  const filteredUsers = useMemo(() => {
    return assignableUsers.filter(user => user.Id !== lead?.assignedTo);
  }, [assignableUsers, lead?.assignedTo]);


  const handleSubmit = async () => {
    if (!lead || !selectedUserId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un usuario",
        variant: "destructive"
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Debe ingresar un motivo",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await handleReassignLead(
        lead.id,
        selectedUserId,
        reason.trim(),
        notes.trim(),
        lead.stage,
        lead.assignedTo // Pasar el usuario que actualmente tiene el lead asignado
      );

      if (success) {
        toast({
          title: "Éxito",
          description: "Lead reasignado exitosamente",
        });
        
        // Resetear formulario
        setSelectedUserId("");
        setReason("No informa");
        setNotes("Sin info");
        
        // Llamar callback de éxito con el nuevo usuario asignado
        onSuccess?.(selectedUserId);
        onClose();
      }
    } catch (error) {
      console.error('❌ Error en reasignación:', error);
    }
  };

  const handleClose = () => {
    setSelectedUserId("");
    setReason("No informa");
    setNotes("Sin info");
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#00C73D]" />
            Reasignar Lead
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {lead && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="font-medium">{lead.name}</p>
              <p className="text-sm text-gray-600">{lead.email}</p>
            </div>
          )}

          <div>
            <Label htmlFor="newUser">Nuevo Usuario Asignado</Label>
            <LeadAssigneeSelect
              value={selectedUserId}
              displayName={
                selectedUserId 
                  ? filteredUsers.find(u => u.Id === selectedUserId)?.Name || "Sin asignar"
                  : "Sin asignar"
              }
              users={filteredUsers}
              loading={loadingUsers}
              onSelect={setSelectedUserId}
            />
          </div>

          <div>
            <Label htmlFor="reason">Motivo de Reasignación</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ingrese el motivo de la reasignación"
              rows={3}
              disabled={reassignLoading}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales (opcional)"
              rows={2}
              disabled={reassignLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={reassignLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedUserId || reassignLoading}
            className="gap-2"
          >
            <UserCheck className="h-4 w-4" />
            {reassignLoading ? "Reasignando..." : "Reasignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}