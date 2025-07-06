
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  organizer?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  isOnlineMeeting?: boolean;
  onlineMeeting?: {
    joinUrl?: string;
  };
  bodyPreview?: string;
  importance?: string;
  sensitivity?: string;
  showAs?: string;
  type?: string;
  webLink?: string;
  isAllDay?: boolean;
  isCancelled?: boolean;
  extendedProps?: {
    source?: string;
    originalEvent?: any;
    [key: string]: any;
  };
}

export function useMicrosoftCalendar() {
  const { getAccessToken } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No se pudo obtener el token de acceso');

      // Si no se proporcionan fechas, usar un rango limitado por defecto
      let queryStartDate: Date;
      let queryEndDate: Date;

      if (startDate && endDate) {
        queryStartDate = startDate;
        queryEndDate = endDate;
      } else {
        // Rango limitado: 30 días atrás hasta 60 días adelante
        const now = new Date();
        queryStartDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 días atrás
        queryEndDate = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 días adelante
      }

      // Asegurar que incluimos todo el último día del rango
      queryEndDate.setHours(23, 59, 59, 999);

      // Convertir fechas a ISO string para Microsoft Graph
      const startISO = queryStartDate.toISOString();
      const endISO = queryEndDate.toISOString();

      console.log('Fetching events from Microsoft Graph with limited range:', {
        startDate: startISO,
        endDate: endISO,
        rangeInDays: Math.ceil((queryEndDate.getTime() - queryStartDate.getTime()) / (1000 * 60 * 60 * 24))
      });

      // Obtener eventos del calendario con el rango limitado
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startISO}&endDateTime=${endISO}&$orderby=start/dateTime&$top=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener eventos: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('Microsoft Graph response with limited range:', {
        eventsCount: data.value?.length || 0,
        dateRange: {
          start: startISO,
          end: endISO
        },
        sampleEvents: data.value?.slice(0, 3).map((e: any) => ({
          subject: e.subject,
          start: e.start.dateTime,
          end: e.end.dateTime
        }))
      });

      setEvents(data.value || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  return {
    events,
    loading,
    error,
    fetchEvents,
  };
}
