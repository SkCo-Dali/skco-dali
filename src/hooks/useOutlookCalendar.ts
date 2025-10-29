import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOutlookCalendarEvents, getDateRange, OutlookEvent } from '@/services/outlookCalendarService';
import { useToast } from '@/hooks/use-toast';

type PeriodType = 'today' | 'thisWeek' | 'nextWeek';

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  isUrgent?: boolean;
}

/**
 * Hook to fetch and manage Outlook calendar events
 */
export function useOutlookCalendar(period: PeriodType) {
  const [events, setEvents] = useState<AgendaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuth();
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get access token from auth context
      const tokenResult = await getAccessToken();
      
      if (!tokenResult?.accessToken) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      // Get date range for the selected period
      const { startDateTime, endDateTime } = getDateRange(period);

      // Fetch events from Outlook
      const outlookEvents = await getOutlookCalendarEvents(
        tokenResult.accessToken,
        startDateTime,
        endDateTime
      );

      // Transform Outlook events to AgendaItem format
      const agendaItems: AgendaItem[] = outlookEvents.map((event) => {
        const startDate = new Date(event.start.dateTime);
        const endDate = new Date(event.end.dateTime);
        const now = new Date();
        
        // Check if event is urgent (within next 2 hours)
        const hoursUntilEvent = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        const isUrgent = hoursUntilEvent > 0 && hoursUntilEvent <= 2;

        // Format date
        const formattedDate = startDate.toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        // Format time
        const formattedTime = `${startDate.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })} - ${endDate.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}`;

        // Get location
        let location = '';
        if (event.isOnlineMeeting && event.onlineMeeting?.joinUrl) {
          location = 'Teams';
        } else if (event.location?.displayName) {
          location = event.location.displayName;
        }

        return {
          id: event.id,
          title: event.subject || 'Sin título',
          date: formattedDate,
          time: formattedTime,
          location,
          isUrgent,
        };
      });

      setEvents(agendaItems);
    } catch (err) {
      console.error('Error fetching Outlook calendar events:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar eventos del calendario';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [period, getAccessToken, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}
