
import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { EventDetailDialog } from '@/components/EventDetailDialog';
import { CalendarStyles } from '@/components/CalendarStyles';
import { createEventRenderer } from '@/components/CalendarEventRenderer';
import { CALENDAR_CONFIG, TIME_CONFIG } from '@/components/CalendarConfig';
import { formatCompactTime, createValidRange } from '@/utils/calendarUtils';

interface FullCalendarViewProps {
  events: CalendarEvent[];
  loading: boolean;
  view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  onViewChange?: (view: string) => void;
  onDateSelect?: (date: Date) => void;
  onEventSelect?: (event: CalendarEvent) => void;
}

export function FullCalendarView({ 
  events, 
  loading, 
  view,
  onViewChange,
  onDateSelect,
  onEventSelect 
}: FullCalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fullCalendarEvents = events.map(event => {
    const startDate = new Date(event.start.dateTime);
    const endDate = new Date(event.end.dateTime);

    // Ajustar a Bogotá (UTC-5) solo para eventos de Microsoft
    const isCalendlyEvent = event.extendedProps?.source === 'calendly';
    if (!isCalendlyEvent) {
      startDate.setHours(startDate.getHours() - 5);
      endDate.setHours(endDate.getHours() - 5);
    }

    const displayTime = formatCompactTime(startDate);

    const title = view === 'dayGridMonth' 
      ? `<b>${displayTime}</b> ${event.subject}`
      : event.subject;

    // Diferentes colores según la fuente
    const eventColors = isCalendlyEvent ? {
      backgroundColor: '#3b82f6',
      borderColor: '#1d4ed8',
      textColor: '#ffffff'
    } : {
      backgroundColor: '#ffffff',
      borderColor: '#00a632',
      textColor: '#3f3f3f'
    };

    return {
      id: event.id,
      title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      ...eventColors,
      extendedProps: {
        location: event.location?.displayName,
        organizer: event.organizer?.emailAddress,
        originalEvent: event,
        displayTime,
        source: isCalendlyEvent ? 'calendly' : 'microsoft'
      }
    };
  });

  const validRange = createValidRange();

  const handleEventClick = (info: any) => {
    if (info.event.extendedProps.originalEvent) {
      setSelectedEvent(info.event.extendedProps.originalEvent as CalendarEvent);
      setDialogOpen(true);
      if (onEventSelect) {
        onEventSelect(info.event.extendedProps.originalEvent as CalendarEvent);
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="w-full h-full relative">
      <CalendarStyles />
      
      <FullCalendar
        eventContent={createEventRenderer()}
        buttonText={CALENDAR_CONFIG.buttonText}
        locale={CALENDAR_CONFIG.locale}
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={CALENDAR_CONFIG.headerToolbar}
        events={fullCalendarEvents}
        height="auto"
        timeZone={TIME_CONFIG.timeZone}
        slotLabelFormat={CALENDAR_CONFIG.slotLabelFormat}
        slotMinTime={TIME_CONFIG.slotMinTime}
        slotMaxTime={TIME_CONFIG.slotMaxTime}
        allDaySlot={false}
        weekends={true}
        businessHours={CALENDAR_CONFIG.businessHours}
        eventDisplay="block"
        dayMaxEvents={view === 'dayGridMonth' ? 3 : false}
        moreLinkClick="popover"
        eventOverlap={false}
        slotEventOverlap={false}
        eventClick={handleEventClick}
        dateClick={(info) => {
          if (onDateSelect) {
            onDateSelect(info.date);
          }
        }}
        viewDidMount={(info) => {
          if (onViewChange) {
            onViewChange(info.view.type);
          }
        }}
        loading={(isLoading) => {
          console.log('Calendar loading state:', isLoading);
        }}
        eventDidMount={(info) => {
          const time = info.event.extendedProps.displayTime;
          const location = info.event.extendedProps.location;
          const source = info.event.extendedProps.source;
          const sourceLabel = source === 'calendly' ? '📅 Calendly' : '📧 Microsoft';
          const tooltip = `${sourceLabel}\n${time} - ${info.event.title}${location ? `\n📍 ${location}` : ''}`;
          info.el.setAttribute('title', tooltip);
        }}
        validRange={validRange}
      />

      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c83c]"></div>
        </div>
      )}

      <EventDetailDialog
        event={selectedEvent}
        isOpen={dialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
}
