import { useState, useCallback, useEffect } from 'react';
import { CalendlyEvent, CalendlyEventType, CalendlyCalendar, CalendlyFilters } from '@/types/calendly';
import { useAuth } from '@/contexts/AuthContext';

export function useCalendly() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendlyEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<CalendlyEventType[]>([]);
  const [calendars, setCalendars] = useState<CalendlyCalendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userUri, setUserUri] = useState<string>('');

  // Token de acceso de Calendly (se guarda por usuario)
  const [accessToken, setAccessToken] = useState<string>('');

  // Cargar token guardado al inicializar
  useEffect(() => {
    if (user?.id) {
      const savedToken = localStorage.getItem(`calendly-token-${user.id}`);
      if (savedToken) {
        setAccessToken(savedToken);
      }
    }
  }, [user]);

  // Función para actualizar y guardar el token
  const updateAccessToken = useCallback((token: string) => {
    setAccessToken(token);
    if (user?.id) {
      if (token) {
        localStorage.setItem(`calendly-token-${user.id}`, token);
      } else {
        localStorage.removeItem(`calendly-token-${user.id}`);
      }
    }
  }, [user]);

  const fetchUserInfo = useCallback(async () => {
    if (!accessToken) return null;

    try {
      const response = await fetch('https://api.calendly.com/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const uri = data.resource.uri;
        setUserUri(uri);
        return uri;
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
    return null;
  }, [accessToken]);

  const fetchEvents = useCallback(async (startDate: Date, endDate: Date, filters?: CalendlyFilters) => {
    if (!accessToken) {
      setError('Token de acceso de Calendly no configurado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Primero obtener información del usuario si no la tenemos
      let currentUserUri = userUri;
      if (!currentUserUri) {
        currentUserUri = await fetchUserInfo();
        if (!currentUserUri) {
          throw new Error('No se pudo obtener información del usuario');
        }
      }

      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      
      // Construir URL con filtros incluyendo el usuario
      let url = `https://api.calendly.com/scheduled_events?user=${currentUserUri}&min_start_time=${startISO}&max_start_time=${endISO}`;
      
      if (filters?.status && filters.status !== 'all') {
        url += `&status=${filters.status}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener eventos de Calendly: ${response.statusText}`);
      }

      const data = await response.json();
      let fetchedEvents = data.collection || [];

      // Aplicar filtros locales
      if (filters?.selectedEventTypes.length) {
        fetchedEvents = fetchedEvents.filter((event: CalendlyEvent) =>
          filters.selectedEventTypes.includes(event.event_type)
        );
      }

      setEvents(fetchedEvents);
    } catch (err: any) {
      setError(err.message || 'Error desconocido al conectar con Calendly');
      console.error('Error fetching Calendly events:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, userUri, fetchUserInfo]);

  const fetchEventTypes = useCallback(async () => {
    if (!accessToken) return;

    try {
      // Primero obtener información del usuario si no la tenemos
      let currentUserUri = userUri;
      if (!currentUserUri) {
        currentUserUri = await fetchUserInfo();
        if (!currentUserUri) {
          return;
        }
      }

      const response = await fetch(`https://api.calendly.com/event_types?user=${currentUserUri}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEventTypes(data.collection || []);
      }
    } catch (err) {
      console.error('Error fetching event types:', err);
    }
  }, [accessToken, userUri, fetchUserInfo]);

  const fetchCalendars = useCallback(async () => {
    if (!accessToken) return;

    try {
      // Nota: Calendly no tiene un endpoint directo para calendarios
      // Por simplicidad, usaremos los event types como "calendarios"
      await fetchEventTypes();
    } catch (err) {
      console.error('Error fetching calendars:', err);
    }
  }, [fetchEventTypes]);

  return {
    events,
    eventTypes,
    calendars,
    loading,
    error,
    accessToken,
    setAccessToken: updateAccessToken,
    fetchEvents,
    fetchEventTypes,
    fetchCalendars,
    userUri,
  };
}
