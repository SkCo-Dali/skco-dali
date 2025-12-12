import { useState, useEffect } from 'react';
import { getInteractionsByLead, InteractionResponse } from '@/utils/interactionsApiClient';

export interface InteractionStatus {
  email: { sent: boolean; lastDate?: string; description?: string };
  whatsapp: { sent: boolean; lastDate?: string; description?: string };
  call: { sent: boolean; lastDate?: string; description?: string };
  meeting: { sent: boolean; lastDate?: string; description?: string };
}

export const useLeadInteractions = (leadId: string | null, enabled: boolean = true) => {
  const [interactions, setInteractions] = useState<InteractionResponse[]>([]);
  const [status, setStatus] = useState<InteractionStatus>({
    email: { sent: false },
    whatsapp: { sent: false },
    call: { sent: false },
    meeting: { sent: false },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leadId || !enabled) {
      return;
    }

    const fetchInteractions = async () => {
      setLoading(true);
      try {
        const data = await getInteractionsByLead(leadId);
        setInteractions(data);

        // Process interactions to get status
        const emailInteraction = data.find(i => i.Type?.toLowerCase() === 'email');
        const whatsappInteraction = data.find(i => i.Type?.toLowerCase() === 'whatsapp');
        const callInteraction = data.find(i => i.Type?.toLowerCase() === 'call' || i.Type?.toLowerCase() === 'llamada');
        const meetingInteraction = data.find(i => i.Type?.toLowerCase() === 'meeting' || i.Type?.toLowerCase() === 'reunión');

        setStatus({
          email: { 
            sent: !!emailInteraction, 
            lastDate: emailInteraction?.CreatedAt,
            description: emailInteraction?.Description
          },
          whatsapp: { 
            sent: !!whatsappInteraction, 
            lastDate: whatsappInteraction?.CreatedAt,
            description: whatsappInteraction?.Description
          },
          call: { 
            sent: !!callInteraction, 
            lastDate: callInteraction?.CreatedAt,
            description: callInteraction?.Description
          },
          meeting: { 
            sent: !!meetingInteraction, 
            lastDate: meetingInteraction?.CreatedAt,
            description: meetingInteraction?.Description
          },
        });
      } catch (error) {
        console.error('Error fetching lead interactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [leadId, enabled]);

  return { interactions, status, loading };
};
