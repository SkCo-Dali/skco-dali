import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/types/crm';
import { getAllLeads, createLead, updateLead, deleteLead, getLeadsByUser } from '@/utils/leadsApiClient';
import { getReassignableLeads } from '@/utils/leadAssignmentApiClient';
import { mapLeadToCreateRequest, mapLeadToUpdateRequest } from '@/utils/leadsApiMapper';
import { useAuth } from '@/contexts/AuthContext';
import { usePaginatedLeadsApi } from './usePaginatedLeadsApi';

// Hook legacy para compatibilidad
export const useLeadsApi = () => {
  const { user } = useAuth();
  
  // Usar el nuevo hook de paginación
  const paginatedApi = usePaginatedLeadsApi();
  
  // Para mantener compatibilidad, devolver los leads sin paginación
  // En el futuro se puede refactorizar para eliminar esta compatibilidad
  
  // Crear nuevo lead (mantener funcionalidad original)
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
      
      // Refrescar la lista después de crear
      paginatedApi.refreshLeads();
      
      return newLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear lead';
      console.error('❌ Error creating lead:', errorMessage);
      return null;
    }
  };

  // Actualizar lead existente (mantener funcionalidad original)
  const updateExistingLead = async (leadData: Lead, skipReassignmentCheck: boolean = false) => {
    if (!user?.id) {
      return null;
    }

    if (user.role === 'analista') {
      return null;
    }
    
    try {
      console.log('🔄 Updating lead...');
      
      // Obtener el lead original para comparar asignaciones
      const originalLead = paginatedApi.leads.find(l => l.id === leadData.id);
      const hasAssignmentChange = originalLead && originalLead.assignedTo !== leadData.assignedTo;
      
      if (hasAssignmentChange && !skipReassignmentCheck) {
        console.log('⚠️ Assignment change detected - should use reassignment API first');
        
        const leadDataWithOriginalAssignment = {
          ...leadData,
          assignedTo: originalLead.assignedTo
        };
        
        const updateRequest = mapLeadToUpdateRequest(leadDataWithOriginalAssignment, user.id);
        await updateLead(leadData.id, updateRequest);
        
        console.log('✅ Lead updated successfully (assignment preserved):', leadData.id);
      } else {
        const updateRequest = mapLeadToUpdateRequest(leadData, user.id);
        await updateLead(leadData.id, updateRequest);
        
        console.log('✅ Lead updated successfully:', leadData.id);
      }
      
      // Refrescar la lista después de actualizar
      paginatedApi.refreshLeads();
      
      return leadData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar lead';
      console.error('❌ Error updating lead:', errorMessage);
      return null;
    }
  };

  // Eliminar lead (mantener funcionalidad original)
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
      
      // Refrescar la lista después de eliminar
      paginatedApi.refreshLeads();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar lead';
      console.error('❌ Error deleting lead:', errorMessage);
      return false;
    }
  };

  // Cargar leads por usuario (usar API antigua para compatibilidad)
  const loadLeadsByUser = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      console.log('🔄 Loading leads by user from API...');
      const fetchedLeads = await getLeadsByUser(targetUserId);
      console.log('✅ User leads loaded successfully:', fetchedLeads.length);
      
      // No actualizar el estado aquí, ya que usamos el hook paginado
      return fetchedLeads;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar leads del usuario';
      console.error('❌ Error loading user leads:', errorMessage);
      return [];
    }
  };

  return {
    leads: paginatedApi.leads,
    loading: paginatedApi.loading,
    error: paginatedApi.error,
    pagination: paginatedApi.pagination,
    filters: paginatedApi.filters,
    apiFilters: paginatedApi.apiFilters,
    updateFilters: paginatedApi.updateFilters,
    setPage: paginatedApi.setPage,
    setPageSize: paginatedApi.setPageSize,
    getUniqueValues: paginatedApi.getUniqueValues,
    loadLeads: paginatedApi.loadLeads,
    loadLeadsByUser,
    createNewLead,
    updateExistingLead,
    deleteExistingLead,
    refreshLeads: paginatedApi.refreshLeads
  };
};
