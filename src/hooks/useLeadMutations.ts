import { Lead } from '@/types/crm';
import { createLead, updateLead, deleteLead } from '@/utils/leadsApiClient';
import { mapLeadToCreateRequest, mapLeadToUpdateRequest } from '@/utils/leadsApiMapper';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Lightweight hook for lead mutations only (create, update, delete).
 * Use this when you only need to modify leads without loading the full paginated list.
 * This avoids unnecessary API calls to /api/lead-assignments/reassignable.
 */
export const useLeadMutations = () => {
  const { user } = useAuth();

  // Create new lead
  const createNewLead = async (leadData: Partial<Lead>) => {
    console.log('🎬 === STARTING CREATE NEW LEAD PROCESS ===');
    console.log('🎬 Function: createNewLead called with:', JSON.stringify(leadData, null, 2));
    
    if (!user?.id) {
      console.error('❌ Usuario no autenticado');
      return null;
    }
    
    try {
      console.log('🔄 Creating new lead...');
      
      const createRequest = mapLeadToCreateRequest(leadData, user.id);
      console.log('🔄 Mapped create request:', JSON.stringify(createRequest, null, 2));
      
      const newLead = await createLead(createRequest);
      console.log('✅ Lead created successfully:', newLead.id);
      
      return newLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear lead';
      console.error('❌ Error creating lead:', errorMessage);
      return null;
    }
  };

  // Update existing lead
  const updateExistingLead = async (leadData: Lead, skipReassignmentCheck: boolean = false) => {
    if (!user?.id) {
      return null;
    }

    if (user.role === 'analista') {
      return null;
    }
    
    try {
      console.log('🔄 Updating lead...');
      
      // When using this lightweight hook, we don't have access to the original lead
      // from a paginated list, so we always update with the provided data
      const updateRequest = mapLeadToUpdateRequest(leadData, user.id);
      await updateLead(leadData.id, updateRequest);
      
      console.log('✅ Lead updated successfully:', leadData.id);
      
      return leadData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar lead';
      console.error('❌ Error updating lead:', errorMessage);
      return null;
    }
  };

  // Delete lead
  const deleteExistingLead = async (leadId: string) => {
    if (!user?.id) {
      return false;
    }

    if (user.role === 'analista' || user.role === 'fp' || user.role === 'gestor') {
      return false;
    }
    
    try {
      console.log('🔄 Deleting lead...');
      await deleteLead(leadId);
      
      console.log('✅ Lead deleted successfully:', leadId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar lead';
      console.error('❌ Error deleting lead:', errorMessage);
      return false;
    }
  };

  return {
    createNewLead,
    updateExistingLead,
    deleteExistingLead,
  };
};
