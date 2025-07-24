
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types/crm';
import { 
  createInteraction, 
  getInteractionsByLead, 
  getClientHistory,
  InteractionResponse,
  ClientHistoryResponse,
  CreateInteractionRequest 
} from '@/utils/interactionsApiClient';

export const useInteractionsApi = () => {
  const [loading, setLoading] = useState(false);
  const [interactions, setInteractions] = useState<InteractionResponse[]>([]);
  const [clientHistory, setClientHistory] = useState<ClientHistoryResponse[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Crear nueva interacción desde un lead
  const createInteractionFromLead = async (
    lead: Lead, 
    interactionType: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp' | 'sms' = 'note',
    outcome: 'positive' | 'negative' | 'neutral' = 'neutral'
  ): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return false;
    }

    // Validar que los campos necesarios estén presentes
    if (!interactionType || !outcome || !lead.stage || !lead.notes) {
      toast({
        title: "Campos incompletos",
        description: "Debe completar Medio de Contacto, Resultado, Etapa y Notas para crear la interacción",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const interactionData: CreateInteractionRequest = {
        LeadId: lead.id,
        UserId: user.id,
        Type: interactionType,
        Description: lead.notes,
        Stage: lead.stage,
        Outcome: outcome
      };

      await createInteraction(interactionData);
      
      toast({
        title: "Éxito",
        description: "Interacción creada exitosamente",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error creating interaction:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la interacción",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar interacciones de un lead
  const loadLeadInteractions = async (leadId: string) => {
    setLoading(true);
    try {
      const leadInteractions = await getInteractionsByLead(leadId);
      setInteractions(leadInteractions);
    } catch (error) {
      console.error('❌ Error loading lead interactions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las interacciones del lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar historial completo del cliente
  const loadClientHistory = async (lead: Lead) => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (lead.email) {
        params.email = lead.email;
      }
      
      if (lead.documentType && lead.documentNumber) {
        params.DocumentType = lead.documentType;
        params.DocumentNumber = lead.documentNumber.toString();
      }

      if (!params.email && (!params.DocumentType || !params.DocumentNumber)) {
        toast({
          title: "Información insuficiente",
          description: "Se necesita email o tipo y número de documento para cargar el historial",
          variant: "destructive",
        });
        return;
      }

      const history = await getClientHistory(params);
      setClientHistory(history);
      
      // También establecer las interacciones del lead actual
      const currentLeadHistory = history.find(h => h.LeadId === lead.id);
      if (currentLeadHistory) {
        setInteractions(currentLeadHistory.Interactions);
      }
      
    } catch (error) {
      console.error('❌ Error loading client history:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial del cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    interactions,
    clientHistory,
    createInteractionFromLead,
    loadLeadInteractions,
    loadClientHistory
  };
};
