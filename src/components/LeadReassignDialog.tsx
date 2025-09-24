import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead, User } from "@/types/crm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers } from "@/utils/userApiClient";
import { useLeadAssignments } from "@/hooks/useLeadAssignments";
import { UserCheck, X, Search } from "lucide-react";

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
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState<string>("");
  
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { loading: reassignLoading, handleReassignLead } = useLeadAssignments();

  // Filter users based on search term
  const filteredUsers = assignableUsers.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchAssignableUsers = async () => {
      if (!isOpen) return;
      
      setLoadingUsers(true);
      try {
        console.log('🔄 Cargando usuarios asignables para reasignación desde API...');
        const users = await getAllUsers();
        
        // Filtrar solo usuarios activos y que no sea el usuario actual asignado
        const filteredUsers = users.filter(user => 
          user.isActive && user.id !== lead?.assignedTo
        );
        
        console.log('✅ Usuarios asignables cargados para reasignación:', filteredUsers.length);
        setAssignableUsers(filteredUsers);
      } catch (error) {
        console.error('❌ Error cargando usuarios asignables:', error);
        toast({
          title: "Error",
          description: "Error al cargar usuarios asignables",
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
        notes.trim(),
        lead.stage
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
        setUserSearch(""); // Clear search on successful submission
        
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
    setUserSearch(""); // Clear search when closing
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
              <SelectContent className="bg-white z-50">
                <div className="px-2 py-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                    <Input
                      placeholder="Buscar usuario..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-8 h-6 text-xs"
                      autoFocus
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <ScrollArea className="h-48">
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.role}
                    </SelectItem>
                  ))}
                  {filteredUsers.length === 0 && userSearch && (
                    <div className="px-2 py-2 text-sm text-gray-500 text-center">
                      No se encontraron usuarios
                    </div>
                  )}
                </ScrollArea>
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