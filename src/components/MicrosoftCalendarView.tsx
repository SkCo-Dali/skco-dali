
import React from 'react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendarViewType } from '@/pages/Calendar';
import { FullCalendarView } from '@/components/FullCalendarView';
import { MonthEventsList } from '@/components/MonthEventsList';

interface MicrosoftCalendarViewProps {
  events: CalendarEvent[];
  loading: boolean;
  calendarView: CalendarViewType;
  selectedDate?: Date;
  onViewChange: (view: string) => void;
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: CalendarEvent) => void;
}

export function MicrosoftCalendarView({
  events,
  loading,
  calendarView,
  selectedDate,
  onViewChange,
  onDateSelect,
  onEventSelect
}: MicrosoftCalendarViewProps) {
  return (
    <div className="flex gap-6">
      <div className="flex-1 bg-white rounded-lg border shadow-sm p-4">
        <FullCalendarView
          events={events}
          loading={loading}
          view={calendarView}
          onViewChange={onViewChange}
          onDateSelect={onDateSelect}
          onEventSelect={onEventSelect}
        />
      </div>
      {calendarView === 'dayGridMonth' && (
        <MonthEventsList
          events={events}
          selectedDate={selectedDate}
          onEventClick={onEventSelect}
        />
      )}
    </div>
  );
}
