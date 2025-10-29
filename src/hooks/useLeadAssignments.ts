import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  reassignLead,
  getLeadAssignmentHistory,
  getUserAssignmentHistory,
  getReassignableLeads,
} from "@/utils/leadAssignmentApiClient";
import { changeLeadStage } from "@/utils/leadsApiClient";
import { ReassignLeadRequest, LeadAssignmentHistory, ReassignableLead } from "@/types/leadAssignmentTypes";

export const useLeadAssignments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Función para reasignar un lead
  const handleReassignLead = async (
    leadId: string,
    toUserId: string,
    reason: string = "No informa",
    notes: string = "Sin info",
    currentStage?: string,
    fromUserId?: string, // Nuevo parámetro opcional para especificar el usuario origen
  ): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return false;
    }

    // Si no se proporciona fromUserId explícitamente, usar el usuario autenticado (para asignaciones masivas)
    const authenticatedUserUUID = localStorage.getItem("authenticated-user-uuid");
    const sourceUserId = fromUserId || authenticatedUserUUID || user.id;

    setLoading(true);
    setError(null);

    try {
      // Si el lead está en estado "nuevo", automáticamente cambiar a "asignado"
      const shouldChangeToAssigned = currentStage?.toLowerCase() === "nuevo";

      const request: ReassignLeadRequest = {
        lead_id: leadId,
        from_user_id: sourceUserId,
        to_user_id: toUserId,
        assigned_by: authenticatedUserUUID || user.id, // El que hace la reasignación
        reason,
        notes,
        ...(shouldChangeToAssigned && { new_stage: "asignado" }),
      };

      const response = await reassignLead(request);

      console.log("✅ Lead reassigned successfully:", response.message);

      // Si el stage original era "Nuevo", actualizar a "Asignado"
      if (shouldChangeToAssigned) {
        try {
          console.log(`🔄 Changing stage to "Asignado" for lead ${leadId}`);
          await changeLeadStage(leadId, "Asignado");
          console.log(`✅ Stage changed to "Asignado" successfully`);
        } catch (stageError) {
          console.error("❌ Error changing stage:", stageError);
          // No fallar la reasignación si solo falla el cambio de stage
          toast({
            title: "Advertencia",
            description: "Lead reasignado correctamente, pero hubo un error al actualizar su estado",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Éxito",
        description: "Lead reasignado exitosamente",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al reasignar lead";
      console.error("❌ Error reassigning lead:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el historial de asignaciones de un lead
  const getLeadHistory = async (leadId: string): Promise<LeadAssignmentHistory[]> => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Getting lead assignment history for: ${leadId}`);
      const history = await getLeadAssignmentHistory(leadId);
      console.log("✅ Lead history retrieved:", history.length, "assignments");
      return history;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener historial del lead";
      console.error("❌ Error getting lead history:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el historial de asignaciones de un usuario
  const getUserHistory = async (userId?: string): Promise<LeadAssignmentHistory[]> => {
    const targetUserId = userId || localStorage.getItem("authenticated-user-uuid") || user?.id;

    if (!targetUserId) {
      toast({
        title: "Error",
        description: "Usuario no especificado",
        variant: "destructive",
      });
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Getting user assignment history for: ${targetUserId}`);
      const history = await getUserAssignmentHistory(targetUserId);
      console.log("✅ User history retrieved:", history.length, "assignments");
      return history;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener historial del usuario";
      console.error("❌ Error getting user history:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener leads reasignables
  const getReassignableLeadsByUser = async (userId?: string): Promise<ReassignableLead[]> => {
    const targetUserId = userId || localStorage.getItem("authenticated-user-uuid") || user?.id;

    if (!targetUserId) {
      toast({
        title: "Error",
        description: "Usuario no especificado",
        variant: "destructive",
      });
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Getting reassignable leads`);
      const leads = await getReassignableLeads();
      console.log("✅ Reassignable leads retrieved:", leads.length, "leads");
      return leads;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener leads reasignables";
      console.error("❌ Error getting reassignable leads:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleReassignLead,
    getLeadHistory,
    getUserHistory,
    getReassignableLeadsByUser,
  };
};
