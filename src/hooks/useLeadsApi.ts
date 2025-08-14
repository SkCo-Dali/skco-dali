import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/types/crm';
import { getAllLeads, createLead, updateLead, deleteLead, getLeadsByUser } from '@/utils/leadsApiClient';
import { getReassignableLeads } from '@/utils/leadAssignmentApiClient';
import { mapLeadToCreateRequest, mapLeadToUpdateRequest } from '@/utils/leadsApiMapper';
import { useAuth } from '@/contexts/AuthContext';

export const useLeadsApi = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Función para mapear ReassignableLead a Lead
  const mapReassignableLeadToLead = (reassignableLead: any): Lead => {
    console.log('🔄 Mapping individual reassignable lead:', JSON.stringify(reassignableLead, null, 2));
    
    // Parse AdditionalInfo if it's a string
    let additionalInfo = null;
    if (reassignableLead.AdditionalInfo) {
      console.log('🔍 Raw AdditionalInfo field:', reassignableLead.AdditionalInfo);
      console.log('🔍 AdditionalInfo type:', typeof reassignableLead.AdditionalInfo);
      
      try {
        // Si es un string, intentar parsear como JSON
        if (typeof reassignableLead.AdditionalInfo === 'string') {
          console.log('🔄 Attempting to parse AdditionalInfo string as JSON...');
          additionalInfo = JSON.parse(reassignableLead.AdditionalInfo);
          console.log('✅ Successfully parsed AdditionalInfo from string:', additionalInfo);
        } else if (typeof reassignableLead.AdditionalInfo === 'object') {
          // Si ya es un objeto, usarlo directamente
          console.log('🔄 AdditionalInfo is already an object, using directly');
          additionalInfo = reassignableLead.AdditionalInfo;
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse AdditionalInfo:', reassignableLead.AdditionalInfo);
        console.warn('⚠️ Parse error details:', error);
        additionalInfo = null;
      }
    }
    
    const mappedLead = {
      id: reassignableLead.Id || reassignableLead.id,
      name: reassignableLead.Name || reassignableLead.name,
      email: reassignableLead.Email || reassignableLead.email,
      phone: reassignableLead.Phone || reassignableLead.phone,
      documentNumber: reassignableLead.DocumentNumber || reassignableLead.documentNumber,
      company: reassignableLead.Company || reassignableLead.company,
      source: reassignableLead.Source || reassignableLead.source,
      campaign: reassignableLead.Campaign || reassignableLead.campaign,
      product: reassignableLead.Product ? 
        (typeof reassignableLead.Product === 'string' ? 
          reassignableLead.Product : JSON.stringify(reassignableLead.Product)) : '',
      stage: reassignableLead.Stage || reassignableLead.stage,
      priority: reassignableLead.Priority || reassignableLead.priority,
      value: parseFloat(reassignableLead.Value) || reassignableLead.value || 0,
      assignedTo: reassignableLead.AssignedTo || reassignableLead.assigned_to,
      createdBy: reassignableLead.CreatedBy || reassignableLead.created_by || '1', // Add createdBy with fallback
      createdAt: reassignableLead.CreatedAt || reassignableLead.created_at,
      updatedAt: reassignableLead.UpdatedAt || reassignableLead.updated_at,
      nextFollowUp: reassignableLead.NextFollowUp || reassignableLead.nextFollowUp,
      notes: reassignableLead.Notes || reassignableLead.notes,
      tags: reassignableLead.Tags ? 
        (typeof reassignableLead.Tags === 'string' ? 
          JSON.parse(reassignableLead.Tags) : reassignableLead.Tags) : [],
      documentType: reassignableLead.DocumentType || reassignableLead.documentType,
      portfolios: reassignableLead.SelectedPortfolios ? 
        (typeof reassignableLead.SelectedPortfolios === 'string' ? 
          JSON.parse(reassignableLead.SelectedPortfolios) : reassignableLead.SelectedPortfolios) : [],
      campaignOwnerName: reassignableLead.CampaignOwnerName || reassignableLead.campaignOwnerName,
      age: reassignableLead.Age || reassignableLead.age,
      gender: reassignableLead.Gender || reassignableLead.gender,
      preferredContactChannel: reassignableLead.PreferredContactChannel || reassignableLead.preferredContactChannel,
      status: 'New' as LeadStatus,
      portfolio: reassignableLead.SelectedPortfolios ? 
        (typeof reassignableLead.SelectedPortfolios === 'string' ? 
          JSON.parse(reassignableLead.SelectedPortfolios)[0] : reassignableLead.SelectedPortfolios[0]) || 'Portfolio A' : 'Portfolio A',
      ...(additionalInfo ?  additionalInfo  : {})
    };
    
    console.log('✅ Final mapped lead with AdditionalInfo:', JSON.stringify(mappedLead, null, 2));
    console.log('🔍 AdditionalInfo in mapped lead:', mappedLead.additionalInfo);
    
    return mappedLead;
  };

  // Función para filtrar leads según el rol del usuario
  const filterLeadsByRole = (allLeads: Lead[]): Lead[] => {
    if (!user) return [];

    console.log(`🎯 Applying role-based filtering for role: ${user.role}`);
    console.log(`🎯 Input leads count: ${allLeads.length}`);
    console.log(`🎯 User ID: ${user.id}`);

    switch (user.role) {
      case 'admin':
      case 'analista':
        // Solo admin y analista pueden ver todos los leads
        console.log(`🎯 Role ${user.role} can see all leads`);
        return allLeads;
      
      case 'gestor':
      case 'supervisor':
      case 'director':
      case 'socio':
        // Para estos roles usando la API de leads reasignables:
        // El API ya retorna solo los leads que pueden reasignar (asignados actualmente o anteriormente)
        // Por lo tanto, no necesitamos filtrar más - mostrar todos los que retorna el API
        console.log(`🎯 Role ${user.role} using reassignable leads API - showing all returned leads`);
        console.log(`🎯 Showing ${allLeads.length} reassignable leads for ${user.role}`);
        return allLeads;
      
      case 'fp':
        // Solo pueden ver leads que les asignen
        const fpFilteredLeads = allLeads.filter(lead => lead.assignedTo === user.id);
        console.log(`🎯 Role ${user.role} can see ${fpFilteredLeads.length} of ${allLeads.length} leads (only assigned to them)`);
        return fpFilteredLeads;
      
      default:
        console.log(`🎯 Unknown role ${user.role} - returning empty array`);
        return [];
    }
  };

  // Cargar leads reasignables para el usuario actual
  const loadLeads = async (filters?: any) => {
    if (!user?.id) {
      console.log('❌ No user ID available for loading reassignable leads');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 === STARTING REASSIGNABLE LEADS API CALL ===');
      console.log('👤 Current user ID:', user.id);
      console.log('👤 Current user role:', user.role);
      console.log('📡 API endpoint will be: /api/lead-assignments');
      console.log('🔄 Calling getReassignableLeads API...');
      
      // Usar la API de leads reasignables en lugar de la API regular
      const reassignableLeads = await getReassignableLeads();
      
      console.log('📊 === REASSIGNABLE LEADS API RESPONSE ===');
      console.log('📊 Response type:', typeof reassignableLeads);
      console.log('📊 Response is array:', Array.isArray(reassignableLeads));
      console.log('📊 Response length:', reassignableLeads?.length || 0);
      console.log('📊 Full raw response:', JSON.stringify(reassignableLeads, null, 2));
      
      if (reassignableLeads && reassignableLeads.length > 0) {
        console.log('📋 Sample lead structure (first lead):', JSON.stringify(reassignableLeads[0], null, 2));
      }
      
      // Mapear los leads reasignables al formato esperado
      console.log('🔄 Starting mapping process...');
      const mappedLeads = reassignableLeads.map(mapReassignableLeadToLead);
      console.log('✅ Mapping completed. Mapped leads count:', mappedLeads.length);
      
      // Filtrar leads según el rol del usuario
      console.log('🎯 Applying role-based filtering...');
      const filteredLeads = filterLeadsByRole(mappedLeads);
      console.log(`🎯 Usuario ${user.role} puede ver ${filteredLeads.length} de ${mappedLeads.length} leads reasignables`);
      
      if (filteredLeads.length > 0) {
        console.log('📋 Sample filtered lead:', JSON.stringify(filteredLeads[0], null, 2));
      }
      
      setLeads(filteredLeads);
      console.log('✅ === REASSIGNABLE LEADS LOADED SUCCESSFULLY ===');
      console.log('✅ Final leads count in state:', filteredLeads.length);
      
    } catch (err) {
      console.log('❌ === ERROR IN REASSIGNABLE LEADS API CALL ===');
      console.error('❌ Error object:', err);
      console.error('❌ Error message:', err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar leads reasignables';
      setError(errorMessage);
      
      // Mostrar mensaje más amigable según el tipo de error
      if (errorMessage.includes('Failed to fetch')) {
        console.log('🔄 Connection error detected, will retry...');
        
        // Reintentar automáticamente después de 5 segundos
        setTimeout(() => {
          console.log('🔄 Auto-retrying after connection error...');
          loadLeads(filters);
        }, 5000);
      }
    } finally {
      setLoading(false);
      console.log('🏁 loadLeads function completed');
    }
  };

  // Cargar leads por usuario
  const loadLeadsByUser = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading leads by user from API...');
      const fetchedLeads = await getLeadsByUser(targetUserId);
      
      // Filtrar leads según el rol del usuario
      const filteredLeads = filterLeadsByRole(fetchedLeads);
      
      setLeads(filteredLeads);
      console.log('✅ User leads loaded successfully:', filteredLeads.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar leads del usuario';
      console.error('❌ Error loading user leads:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo lead
  const createNewLead = async (leadData: Partial<Lead>) => {
    console.log('🎬 === STARTING CREATE NEW LEAD PROCESS ===');
    console.log('🎬 Function: createNewLead called with:', JSON.stringify(leadData, null, 2));
    
    if (!user?.id) {
      console.error('❌ Usuario no autenticado');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Creating new lead...');
      console.log('📋 Lead data received:', JSON.stringify(leadData, null, 2));
      console.log('👤 Current user ID from context:', user.id);
      
      // Verificar el UUID almacenado
      const storedUUID = localStorage.getItem('authenticated-user-uuid');
      console.log('🔐 UUID almacenado que se usará para la creación:', storedUUID);
      
      const createRequest = mapLeadToCreateRequest(leadData, user.id);
      console.log('🔄 Mapped create request:', JSON.stringify(createRequest, null, 2));
      console.log('🎯 UUID final enviado en CreatedBy:', createRequest.CreatedBy);
      console.log('🎯 UUID final enviado en AssignedTo:', createRequest.assignedTo);
      
      console.log('📞 About to call createLead API function...');
      const newLead = await createLead(createRequest);
      console.log('📞 createLead API function returned:', JSON.stringify(newLead, null, 2));
      
      // Actualizar la lista local solo si el usuario puede ver el lead
      const canSeeNewLead = filterLeadsByRole([newLead]).length > 0;
      if (canSeeNewLead) {
        setLeads(prevLeads => [newLead, ...prevLeads]);
      }
      
      console.log('✅ Lead created successfully:', newLead.id);
      
      return newLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear lead';
      console.error('❌ Error creating lead:', errorMessage);
      console.error('❌ Full error object:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar lead existente con manejo especial para reasignaciones
  const updateExistingLead = async (leadData: Lead, skipReassignmentCheck: boolean = false) => {
    if (!user?.id) {
      return null;
    }

    // Verificar si el usuario puede modificar este lead
    if (user.role === 'analista') {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Updating lead...');
      console.log('📋 Lead data to update:', JSON.stringify(leadData, null, 2));
      console.log('🔒 Skip reassignment check:', skipReassignmentCheck);
      
      // Obtener el lead original de la lista para comparar asignaciones
      const originalLead = leads.find(l => l.id === leadData.id);
      const hasAssignmentChange = originalLead && originalLead.assignedTo !== leadData.assignedTo;
      
      console.log('🔍 Original assigned to:', originalLead?.assignedTo);
      console.log('🔍 New assigned to:', leadData.assignedTo);
      console.log('🔍 Has assignment change:', hasAssignmentChange);
      
      // Si hay cambio de asignación y no se debe omitir la verificación de reasignación,
      // advertir que se debe usar la API de reasignación primero
      if (hasAssignmentChange && !skipReassignmentCheck) {
        console.log('⚠️ Assignment change detected - should use reassignment API first');
        
        // Mantener el assignedTo original para evitar conflictos
        const leadDataWithOriginalAssignment = {
          ...leadData,
          assignedTo: originalLead.assignedTo
        };
        
        const updateRequest = mapLeadToUpdateRequest(leadDataWithOriginalAssignment, user.id);
        await updateLead(leadData.id, updateRequest);
        
        // Actualizar la lista local con la asignación original
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadData.id ? leadDataWithOriginalAssignment : lead
          )
        );
        
        console.log('✅ Lead updated successfully (assignment preserved):', leadData.id);
      } else {
        // Actualización normal sin cambio de asignación o con omisión de verificación
        const updateRequest = mapLeadToUpdateRequest(leadData, user.id);
        await updateLead(leadData.id, updateRequest);
        
        // Actualizar la lista local
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadData.id ? leadData : lead
          )
        );
        
        console.log('✅ Lead updated successfully:', leadData.id);
      }
      
      return leadData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar lead';
      console.error('❌ Error updating lead:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar lead
  const deleteExistingLead = async (leadId: string) => {
    if (!user?.id) {
      return false;
    }

    // Verificar si el usuario puede eliminar leads
    if (user.role === 'analista' || user.role === 'fp' || user.role === 'gestor') {
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Deleting lead...');
      await deleteLead(leadId);
      
      // Remover de la lista local
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      
      console.log('✅ Lead deleted successfully:', leadId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar lead';
      console.error('❌ Error deleting lead:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar leads al montar el componente
  useEffect(() => {
    loadLeads();
  }, [user?.id, user?.role]);

  return {
    leads,
    loading,
    error,
    loadLeads,
    loadLeadsByUser,
    createNewLead,
    updateExistingLead,
    deleteExistingLead,
    refreshLeads: loadLeads
  };
};
