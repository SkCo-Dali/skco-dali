
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Users } from 'lucide-react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent, CalendlyEventType, CalendlyFilters } from '@/types/calendly';
import { CalendarViewType } from '@/pages/Calendar';
import { UnifiedCalendarView } from '@/components/UnifiedCalendarView';
import { MicrosoftCalendarView } from '@/components/MicrosoftCalendarView';
import { CalendlyCalendarView } from '@/components/CalendlyCalendarView';

interface CalendarTabsProps {
  unifiedEvents: CalendarEvent[];
  msEvents: CalendarEvent[];
  calendlyEvents: CalendlyEvent[];
  calendlyEventTypes: CalendlyEventType[];
  msLoading: boolean;
  calendlyLoading: boolean;
  calendlyToken: string;
  calendlyFilters: CalendlyFilters;
  calendarView: CalendarViewType;
  selectedDate?: Date;
  onViewChange: (view: string) => void;
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: CalendarEvent) => void;
  onFiltersChange: (filters: CalendlyFilters) => void;
  onTokenChange: (token: string) => void;
  onCalendlyRefresh: () => void;
}

export function CalendarTabs({
  unifiedEvents,
  msEvents,
  calendlyEvents,
  calendlyEventTypes,
  msLoading,
  calendlyLoading,
  calendlyToken,
  calendlyFilters,
  calendarView,
  selectedDate,
  onViewChange,
  onDateSelect,
  onEventSelect,
  onFiltersChange,
  onTokenChange,
  onCalendlyRefresh
}: CalendarTabsProps) {
  return (
    <Tabs defaultValue="unified" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="unified" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Vista Unificada ({unifiedEvents.length})
        </TabsTrigger>
        <TabsTrigger value="microsoft" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Microsoft ({msEvents.length})
        </TabsTrigger>
        <TabsTrigger value="calendly" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Calendly ({calendlyEvents.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="unified" className="space-y-4">
        <UnifiedCalendarView
          events={unifiedEvents}
          loading={msLoading || calendlyLoading}
          calendarView={calendarView}
          selectedDate={selectedDate}
          onViewChange={onViewChange}
          onDateSelect={onDateSelect}
          onEventSelect={onEventSelect}
        />
      </TabsContent>

      <TabsContent value="microsoft" className="space-y-4">
        <MicrosoftCalendarView
          events={msEvents}
          loading={msLoading}
          calendarView={calendarView}
          selectedDate={selectedDate}
          onViewChange={onViewChange}
          onDateSelect={onDateSelect}
          onEventSelect={onEventSelect}
        />
      </TabsContent>

      <TabsContent value="calendly" className="space-y-4">
        <CalendlyCalendarView
          calendlyEvents={calendlyEvents}
          calendlyEventTypes={calendlyEventTypes}
          calendlyLoading={calendlyLoading}
          calendlyToken={calendlyToken}
          calendlyFilters={calendlyFilters}
          calendarView={calendarView}
          selectedDate={selectedDate}
          onFiltersChange={onFiltersChange}
          onTokenChange={onTokenChange}
          onRefresh={onCalendlyRefresh}
          onViewChange={onViewChange}
          onDateSelect={onDateSelect}
        />
      </TabsContent>
    </Tabs>
  );
}
