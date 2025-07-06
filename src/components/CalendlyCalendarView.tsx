
import React, { useState } from 'react';
import { CalendlyEventType, CalendlyFilters, CalendlyEvent } from '@/types/calendly';
import { CalendlyFilters as CalendlyFiltersComponent } from '@/components/CalendlyFilters';
import { FullCalendarView } from '@/components/FullCalendarView';
import { MonthEventsList } from '@/components/MonthEventsList';
import { EventDetailDialog } from '@/components/EventDetailDialog';
import { CalendarViewType } from '@/pages/Calendar';
import { Users } from 'lucide-react';

interface CalendlyCalendarViewProps {
  calendlyEvents: CalendlyEvent[];
  calendlyEventTypes: CalendlyEventType[];
  calendlyLoading: boolean;
  calendlyToken: string;
  calendlyFilters: CalendlyFilters;
  calendarView: CalendarViewType;
  selectedDate?: Date;
  onFiltersChange: (filters: CalendlyFilters) => void;
  onTokenChange: (token: string) => void;
  onRefresh: () => void;
  onViewChange: (view: string) => void;
  onDateSelect: (date: Date) => void;
}

// Convertir eventos de Calendly al formato de CalendarEvent para FullCalendar
const convertCalendlyToCalendarEvent = (calendlyEvent: CalendlyEvent) => {
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
        name: calendlyEvent.event_memberships?.[0]?.user_name || 'Calendly',
        address: calendlyEvent.event_memberships?.[0]?.user_email || 'calendly@meeting.com'
      }
    },
    isOnlineMeeting: true,
    onlineMeeting: {
      joinUrl: calendlyEvent.location?.type === 'zoom' ? calendlyEvent.location.location : undefined
    },
    bodyPreview: `Estado: ${calendlyEvent.status} | Invitados: ${calendlyEvent.invitees_counter?.active || 0}`,
    importance: 'normal',
    sensitivity: 'normal',
    showAs: 'busy',
    type: 'singleInstance',
    webLink: calendlyEvent.uri,
    isAllDay: false,
    isCancelled: calendlyEvent.status === 'canceled',
    extendedProps: {
      source: 'calendly',
      originalEvent: calendlyEvent
    }
  };
};

export function CalendlyCalendarView({
  calendlyEvents,
  calendlyEventTypes,
  calendlyLoading,
  calendlyToken,
  calendlyFilters,
  calendarView,
  selectedDate,
  onFiltersChange,
  onTokenChange,
  onRefresh,
  onViewChange,
  onDateSelect
}: CalendlyCalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendlyEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Convertir eventos de Calendly para FullCalendar
  const convertedEvents = calendlyEvents.map(convertCalendlyToCalendarEvent);

  const handleEventSelect = (event: any) => {
    // Buscar el evento original de Calendly
    const originalEvent = calendlyEvents.find(e => e.uri === event.id);
    if (originalEvent) {
      setSelectedEvent(originalEvent);
      setDialogOpen(true);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-80 flex-shrink-0">
        <CalendlyFiltersComponent
          eventTypes={calendlyEventTypes}
          filters={calendlyFilters}
          onFiltersChange={onFiltersChange}
          accessToken={calendlyToken}
          onAccessTokenChange={onTokenChange}
          onRefresh={onRefresh}
          loading={calendlyLoading}
        />
      </div>
      <div className="flex-1 bg-white rounded-lg border shadow-sm p-4">
        {calendlyToken ? (
          calendlyEvents.length > 0 ? (
            <div className="flex gap-6">
              <div className="flex-1">
                <FullCalendarView
                  events={convertedEvents}
                  loading={calendlyLoading}
                  view={calendarView}
                  onViewChange={onViewChange}
                  onDateSelect={onDateSelect}
                  onEventSelect={handleEventSelect}
                />
              </div>
              {calendarView === 'dayGridMonth' && (
                <MonthEventsList
                  events={convertedEvents}
                  selectedDate={selectedDate}
                  onEventClick={handleEventSelect}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay eventos de Calendly</h3>
              <p className="text-muted-foreground">
                No se encontraron eventos para el período seleccionado
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Conecta tu Calendly</h3>
            <p className="text-muted-foreground mb-4">
              Configura tu token de Calendly en el panel izquierdo para ver tus eventos
            </p>
          </div>
        )}
      </div>

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={selectedEvent}
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}
