import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types/crm';

interface CheckClientRequest {
  email?: string;
  identificationNumber?: string;
}

interface CheckClientResponse {
  hasProfile: boolean;
  profileId: string | null;
  isCompleted?: boolean;
}

interface StartProfilingRequest {
  clientEmail?: string;
  clientIdentificationNumber?: string;
  clientName?: string;
}

interface StartProfilingResponse {
  profileId: string;
  reused: boolean;
}

interface SaveResponseRequest {
  profileId: string;
  flowStep: 'initial_question' | 'nightmare_flow' | 'strategic_flow' | 'followup' | 'custom';
  questionId: string;
  selectedAnswer: string;
  additionalNotes?: string;
}

interface SaveResponseResponse {
  saved: boolean;
  order: number;
}

interface CompleteProfilingRequest {
  profileId: string;
  finalData: {
    notes?: string;
    source: string;
    version: number;
  };
}

interface CompleteProfilingResponse {
  profileId: string;
  finalProfileType: string;
  riskLevel: string;
  recommendedProducts: string;
  investmentStrategy: string;
}

interface ProfilingResults extends CompleteProfilingResponse {
  resultData: string;
  createdAt: string;
}

export const useProfilingApi = () => {
  const [loading, setLoading] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const { user, getAccessToken } = useAuth();
  const { toast } = useToast();

  const getHeaders = async () => {
    const tokens = await getAccessToken();
    if (!tokens?.accessToken) {
      throw new Error('Usuario no autenticado');
    }
    return {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json'
    };
  };

  const getBaseUrl = () => {
    return 'https://skcodalilmdev.azurewebsites.net';
  };

  // 1. Verificar cliente
  const checkClient = async (email?: string, identificationNumber?: string): Promise<CheckClientResponse | null> => {
    if (!email && !identificationNumber) {
      toast({
        title: "Error",
        description: "Se requiere email o número de identificación",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const body: CheckClientRequest = {};
      if (email) body.email = email;
      if (identificationNumber) body.identificationNumber = identificationNumber;

      const response = await fetch(`${getBaseUrl()}/api/profiling/check-client`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error checking client:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar el cliente",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 2. Iniciar perfilamiento
  const startProfiling = async (lead: Lead): Promise<string | null> => {
    setLoading(true);
    try {
      const body: StartProfilingRequest = {
        clientName: lead.name
      };

      if (lead.email) body.clientEmail = lead.email;
      if (lead.documentNumber) body.clientIdentificationNumber = lead.documentNumber.toString();

      if (!body.clientEmail && !body.clientIdentificationNumber) {
        toast({
          title: "Información insuficiente",
          description: "Se requiere email o número de identificación del cliente",
          variant: "destructive",
        });
        return null;
      }

      const response = await fetch(`${getBaseUrl()}/api/profiling/start`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: StartProfilingResponse = await response.json();
      setCurrentProfileId(result.profileId);
      
      if (result.reused) {
        toast({
          title: "Perfil reutilizado",
          description: "Se continúa con el perfil existente del cliente",
        });
      } else {
        toast({
          title: "Nuevo perfil iniciado",
          description: "Se ha creado un nuevo perfil para el cliente",
        });
      }

      return result.profileId;
    } catch (error) {
      console.error('❌ Error starting profiling:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el perfilamiento",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 3. Guardar respuesta
  const saveResponse = async (
    profileId: string,
    flowStep: SaveResponseRequest['flowStep'],
    questionId: string,
    selectedAnswer: string,
    additionalNotes?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const body: SaveResponseRequest = {
        profileId,
        flowStep,
        questionId,
        selectedAnswer,
        additionalNotes
      };

      const response = await fetch(`${getBaseUrl()}/api/profiling/save-response`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: SaveResponseResponse = await response.json();
      console.log('✅ Response saved, order:', result.order);
      return result.saved;
    } catch (error) {
      console.error('❌ Error saving response:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la respuesta",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. Completar perfilamiento
  const completeProfiling = async (profileId: string, notes?: string): Promise<CompleteProfilingResponse | null> => {
    setLoading(true);
    try {
      const body: CompleteProfilingRequest = {
        profileId,
        finalData: {
          notes,
          source: 'frontend',
          version: 1
        }
      };

      const response = await fetch(`${getBaseUrl()}/api/profiling/complete`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: CompleteProfilingResponse = await response.json();
      
      toast({
        title: "Perfilamiento completado",
        description: `Perfil final: ${result.finalProfileType}`,
      });

      return result;
    } catch (error) {
      console.error('❌ Error completing profiling:', error);
      toast({
        title: "Error",
        description: "No se pudo completar el perfilamiento",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 5. Obtener resultados
  const getResults = async (profileId: string): Promise<ProfilingResults | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/profiling/results/${profileId}`, {
        method: 'GET',
        headers: await getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting results:', error);
      toast({
        title: "Error",
        description: "No se pudieron obtener los resultados",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentProfileId,
    setCurrentProfileId,
    checkClient,
    startProfiling,
    saveResponse,
    completeProfiling,
    getResults
  };
};