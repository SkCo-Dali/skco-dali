
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMicrosoftCalendar, CalendarEvent } from "@/hooks/useMicrosoftCalendar";
import { useCalendly } from "@/hooks/useCalendly";
import { CalendlyFilters } from "@/types/calendly";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarTabs } from "@/components/CalendarTabs";

export type CalendarViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

// Función para convertir eventos de Calendly al formato de CalendarEvent
const convertCalendlyToCalendarEvent = (calendlyEvent: any): CalendarEvent => {
  return {
    id: calendlyEvent.uri,
    subject: calendlyEvent.name,
    start: {
      dateTime: calendlyEvent.start_time,
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: calendlyEvent.end_time,
      timeZone: 'America/Bogota'
    },
    location: calendlyEvent.location ? {
      displayName: calendlyEvent.location.location || 'Calendly Meeting'
    } : undefined,
    organizer: {
      emailAddress: {
        name: 'Calendly',
        address: 'calendly@meeting.com'
      }
    },
    isOnlineMeeting: true,
    onlineMeeting: {
      joinUrl: calendlyEvent.location?.type === 'zoom' ? calendlyEvent.location.location : undefined
    },
    bodyPreview: `Estado: ${calendlyEvent.status} | Invitados: ${calendlyEvent.invitees_counter.active}`,
    importance: 'normal',
    sensitivity: 'normal',
    showAs: 'busy',
    type: 'singleInstance',
    webLink: calendlyEvent.uri,
    isAllDay: false,
    isCancelled: calendlyEvent.status === 'canceled',
    // Marcar como evento de Calendly
    extendedProps: {
      source: 'calendly',
      originalEvent: calendlyEvent
    }
  };
};

export default function CalendarPage() {
  const { user, isAuthenticated } = useAuth();
  
  // Desactivar Microsoft Calendar completamente
  const msEvents: CalendarEvent[] = [];
  const msLoading = false;
  const msError: string | null = null;

  const {
    events: calendlyEvents,
    eventTypes: calendlyEventTypes,
    loading: calendlyLoading,
    error: calendlyError,
    accessToken: calendlyToken,
    setAccessToken: setCalendlyToken,
    fetchEvents: fetchCalendlyEvents,
    fetchEventTypes: fetchCalendlyEventTypes
  } = useCalendly();

  const [calendarView, setCalendarView] = useState<CalendarViewType>('dayGridMonth');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [calendlyFilters, setCalendlyFilters] = useState<CalendlyFilters>({
    selectedCalendars: [],
    selectedEventTypes: [],
    status: 'active'
  });

  // Convertir eventos de Calendly al formato de CalendarEvent
  const convertedCalendlyEvents = calendlyEvents.map(convertCalendlyToCalendarEvent);

  // Solo usar eventos de Calendly para la vista unificada
  const unifiedEvents = [...convertedCalendlyEvents];

  // Remover la carga de eventos de Microsoft
  console.log('📅 Microsoft Calendar desactivado para mejorar rendimiento');

  // Cargar eventos de Calendly cuando hay token
  useEffect(() => {
    if (calendlyToken) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);
      
      fetchCalendlyEvents(startDate, endDate, calendlyFilters);
      fetchCalendlyEventTypes();
    }
  }, [calendlyToken, calendlyFilters, fetchCalendlyEvents, fetchCalendlyEventTypes]);

  const handleRefresh = () => {
    console.log('🔄 Refresh - Microsoft Calendar desactivado');
    
    if (calendlyToken) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);
      
      fetchCalendlyEvents(startDate, endDate, calendlyFilters);
    }
  };

  const handleCalendlyRefresh = () => {
    if (calendlyToken) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);
      
      fetchCalendlyEvents(startDate, endDate, calendlyFilters);
      fetchCalendlyEventTypes();
    }
  };

  const handleViewChange = (view: string) => {
    setCalendarView(view as CalendarViewType);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    console.log('Date selected:', date);
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    console.log('Event selected:', event);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-16 p-4">
        <h1 className="text-3xl font-bold mb-1 text-[#00c83c]">Calendario</h1>
        <p className="text-muted-foreground">Inicia sesión para ver tu calendario</p>
      </div>
    );
  }

  return (
    <div className="p-6 pt-20 space-y-6">
      <CalendarHeader
        userName={user?.name?.split(" ")[2]}
        msEventsCount={0}
        calendlyEventsCount={calendlyEvents.length}
        calendlyToken={calendlyToken}
        onRefresh={handleRefresh}
        isLoading={calendlyLoading}
        msError={null}
        calendlyError={calendlyError}
      />

      <CalendarTabs
        unifiedEvents={unifiedEvents}
        msEvents={msEvents}
        calendlyEvents={calendlyEvents}
        calendlyEventTypes={calendlyEventTypes}
        msLoading={msLoading}
        calendlyLoading={calendlyLoading}
        calendlyToken={calendlyToken}
        calendlyFilters={calendlyFilters}
        calendarView={calendarView}
        selectedDate={selectedDate}
        onViewChange={handleViewChange}
        onDateSelect={handleDateSelect}
        onEventSelect={handleEventSelect}
        onFiltersChange={setCalendlyFilters}
        onTokenChange={setCalendlyToken}
        onCalendlyRefresh={handleCalendlyRefresh}
      />
    </div>
  );
}
