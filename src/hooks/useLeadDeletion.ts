
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteLead } from '@/utils/leadsApiClient';
import { Lead } from '@/types/crm';
import { useAuth } from '@/contexts/AuthContext';

interface UseLeadDeletionProps {
  onLeadDeleted?: () => void;
}

export function useLeadDeletion({ onLeadDeleted }: UseLeadDeletionProps = {}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const canDeleteLead = (lead: Lead): boolean => {
    if (!user) return false;

    // El rol de administrador puede eliminar cualquier lead
    if (user.role === 'admin') {
      return true;
    }

    // Los roles supervisor, fp, director y socio pueden eliminar leads que hayan creado y tengan asignados
    const allowedRoles = ['supervisor', 'fp', 'director', 'socio'];
    if (!allowedRoles.includes(user.role)) {
      return false;
    }

    // Verificar que el lead esté asignado al usuario actual y que lo haya creado
    return lead.assignedTo === user.id && lead.createdBy === user.id;
  };

  const canDeleteLeads = (leads: Lead[]): { canDelete: boolean; restrictedCount: number } => {
    let restrictedCount = 0;
    
    for (const lead of leads) {
      if (!canDeleteLead(lead)) {
        restrictedCount++;
      }
    }

    return {
      canDelete: restrictedCount === 0,
      restrictedCount
    };
  };

  const deleteSingleLead = async (leadId: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await deleteLead(leadId);
      toast.success('Lead eliminado exitosamente');
      onLeadDeleted?.();
      return true;
    } catch (error) {
      console.error('Error al eliminar lead:', error);
      toast.error('Error al eliminar el lead');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteMultipleLeads = async (leadIds: string[]): Promise<{ success: boolean; successCount: number; errorCount: number }> => {
    setIsDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const leadId of leadIds) {
        try {
          await deleteLead(leadId);
          successCount++;
        } catch (error) {
          console.error(`Error al eliminar lead ${leadId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} lead(s) eliminado(s) exitosamente`);
        onLeadDeleted?.();
      }

      if (errorCount > 0) {
        toast.error(`Error al eliminar ${errorCount} lead(s)`);
      }

      return {
        success: successCount > 0,
        successCount,
        errorCount
      };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    canDeleteLead,
    canDeleteLeads,
    deleteSingleLead,
    deleteMultipleLeads
  };
}
