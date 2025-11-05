
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteLead } from '@/utils/leadsApiClient';

interface UseLeadDeletionProps {
  onLeadDeleted?: () => void;
}

export function useLeadDeletion({ onLeadDeleted }: UseLeadDeletionProps = {}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteSingleLead = async (leadId: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await deleteLead(leadId);
      toast({
        title: "Éxito",
        description: "Lead eliminado exitosamente"
      });
      onLeadDeleted?.();
      return true;
    } catch (error) {
      console.error('Error al eliminar lead:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el lead",
        variant: "destructive"
      });
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
        toast({
          title: "Éxito",
          description: `${successCount} lead(s) eliminado(s) exitosamente`
        });
        onLeadDeleted?.();
      }

      if (errorCount > 0) {
        toast({
          title: "Error",
          description: `Error al eliminar ${errorCount} lead(s)`,
          variant: "destructive"
        });
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
    deleteSingleLead,
    deleteMultipleLeads
  };
}
