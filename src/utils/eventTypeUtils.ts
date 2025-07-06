
import { convertToBogotaTime } from './dateUtils';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';

export const isCalendlyEvent = (event: CalendarEvent | CalendlyEvent): event is CalendlyEvent => {
  return 'start_time' in event;
};

export const getEventId = (event: CalendarEvent | CalendlyEvent): string => {
  return isCalendlyEvent(event) ? event.uri : event.id;
};

export const getEventTitle = (event: CalendarEvent | CalendlyEvent): string => {
  return isCalendlyEvent(event) ? event.name : event.subject;
};

export const getEventStartTime = (event: CalendarEvent | CalendlyEvent): Date => {
  if (isCalendlyEvent(event)) {
    return convertToBogotaTime(event.start_time);
  }
  return convertToBogotaTime(event.start.dateTime);
};

export const getEventEndTime = (event: CalendarEvent | CalendlyEvent): Date => {
  if (isCalendlyEvent(event)) {
    return convertToBogotaTime(event.end_time);
  }
  return convertToBogotaTime(event.end.dateTime);
};

