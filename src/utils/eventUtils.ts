
import { convertToBogotaTime } from './dateUtils';

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
}

// Calcular en qué slot debe aparecer un evento
export const getEventSlot = (eventDateTime: string) => {
  const eventTime = convertToBogotaTime(eventDateTime);
  const hour = eventTime.getHours();
  const minute = eventTime.getMinutes();
  
  // Si es antes de los 30 minutos, va en el slot de la hora exacta
  // Si es después de los 30 minutos, va en el slot de media hora
  return {
    hour,
    minute: minute < 30 ? 0 : 30,
    slotIndex: hour * 2 + (minute < 30 ? 0 : 1)
  };
};

// Obtener eventos para un slot específico (día y slot de tiempo)
export const getEventsForSlot = (events: CalendarEvent[], date: Date, timeSlot: any) => {
  return events.filter((event) => {
    const eventStart = convertToBogotaTime(event.start.dateTime);
    const eventDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
    const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (eventDate.getTime() !== slotDate.getTime()) return false;

    const eventSlot = getEventSlot(event.start.dateTime);
    return eventSlot.hour === timeSlot.hour && eventSlot.minute === timeSlot.minute;
  });
};

// Encontrar el primer slot con eventos para hacer scroll automático
export const findFirstEventSlot = (events: CalendarEvent[], workingDays: Date[]) => {
  if (events.length === 0) return 16; // Default a 8AM (slot 16: 8*2)

  let earliestSlotIndex = 47; // 11:30 PM

  workingDays.forEach((date) => {
    events.forEach((event) => {
      const eventStart = convertToBogotaTime(event.start.dateTime);
      const eventDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (eventDate.getTime() === slotDate.getTime()) {
        const eventSlot = getEventSlot(event.start.dateTime);
        earliestSlotIndex = Math.min(earliestSlotIndex, eventSlot.slotIndex);
      }
    });
  });

  return earliestSlotIndex === 47 ? 16 : Math.max(0, earliestSlotIndex - 2); // 2 slots antes del primer evento
};
