
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  reassignLead, 
  getLeadAssignmentHistory, 
  getUserAssignmentHistory, 
  getReassignableLeads 
} from '@/utils/leadAssignmentApiClient';
import { 
  ReassignLeadRequest, 
  LeadAssignmentHistory, 
  ReassignableLead 
} from '@/types/leadAssignmentTypes';

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
    newStage?: string
  ): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return false;
    }

    // Obtener el UUID almacenado durante la autenticación
    const authenticatedUserUUID = localStorage.getItem('authenticated-user-uuid');
    const fromUserId = authenticatedUserUUID || user.id;

    console.log('🔄 Starting lead reassignment...');
    console.log('📋 Lead ID:', leadId);
    console.log('👤 From User ID:', fromUserId);
    console.log('🎯 To User ID:', toUserId);

    setLoading(true);
    setError(null);

    try {
      const request: ReassignLeadRequest = {
        lead_id: leadId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        assigned_by: fromUserId,
        reason,
        notes,
        new_stage: newStage || 'asignado' // Por defecto 'asignado' si no se especifica
      };

      const response = await reassignLead(request);
      
      console.log('✅ Lead reassigned successfully:', response.message);
      toast({
        title: "Éxito",
        description: "Lead reasignado exitosamente",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reasignar lead';
      console.error('❌ Error reassigning lead:', errorMessage);
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
      console.log('✅ Lead history retrieved:', history.length, 'assignments');
      return history;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener historial del lead';
      console.error('❌ Error getting lead history:', errorMessage);
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
    const targetUserId = userId || localStorage.getItem('authenticated-user-uuid') || user?.id;
    
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
      console.log('✅ User history retrieved:', history.length, 'assignments');
      return history;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener historial del usuario';
      console.error('❌ Error getting user history:', errorMessage);
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
    const targetUserId = userId || localStorage.getItem('authenticated-user-uuid') || user?.id;
    
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
      console.log('✅ Reassignable leads retrieved:', leads.length, 'leads');
      return leads;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener leads reasignables';
      console.error('❌ Error getting reassignable leads:', errorMessage);
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
    getReassignableLeadsByUser
  };
};
