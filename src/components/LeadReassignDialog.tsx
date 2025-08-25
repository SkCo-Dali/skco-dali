
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead, User } from "@/types/crm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignableUsers, AssignableUser } from "@/utils/leadAssignmentApiClient";
import { useLeadAssignments } from "@/hooks/useLeadAssignments";
import { UserCheck, X } from "lucide-react";

interface LeadReassignDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeadReassignDialog({ lead, isOpen, onClose, onSuccess }: LeadReassignDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [reason, setReason] = useState<string>("No informa");
  const [notes, setNotes] = useState<string>("Sin info");
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { loading: reassignLoading, handleReassignLead } = useLeadAssignments();

  useEffect(() => {
    const fetchAssignableUsers = async () => {
      if (!isOpen) return;
      
      setLoadingUsers(true);
      try {
        console.log('🔄 Cargando usuarios asignables para reasignación desde API...');
        const users = await getAssignableUsers();
        
        // Filtrar el usuario actual al que ya está asignado el lead
        const filteredUsers = users.filter(user => user.Id !== lead?.assignedTo);
        
        console.log('✅ Usuarios asignables cargados para reasignación:', filteredUsers.length);
        setAssignableUsers(filteredUsers);
      } catch (error) {
        console.error('❌ Error cargando usuarios asignables:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios disponibles",
          variant: "destructive"
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchAssignableUsers();
  }, [isOpen, lead?.assignedTo, toast]);

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
        notes.trim()
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
        
        // Llamar callback de éxito y cerrar modal
        onSuccess?.();
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
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{lead.name}</p>
              <p className="text-sm text-gray-600">{lead.email}</p>
            </div>
          )}

          <div>
            <Label htmlFor="newUser">Nuevo Usuario Asignado</Label>
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
              disabled={loadingUsers || reassignLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingUsers ? "Cargando usuarios..." : "Seleccionar usuario"}
                />
              </SelectTrigger>
              <SelectContent>
                {assignableUsers.map((user) => (
                  <SelectItem key={user.Id} value={user.Id}>
                    {user.Name} ({user.Email}) - {user.Role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
