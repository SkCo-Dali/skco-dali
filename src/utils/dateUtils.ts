
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// Zona horaria de Bogotá (UTC-5)
const BOGOTA_TIMEZONE = 'America/Bogota';

// Normaliza cadenas de fecha sin zona horaria explícita como UTC
const parseAsUtc = (dateTimeString: string): Date => {
  if (!dateTimeString) return new Date(NaN);
  const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(dateTimeString);
  if (hasTimezone) return new Date(dateTimeString);
  const normalized = dateTimeString.includes('T') ? dateTimeString : dateTimeString.replace(' ', 'T');
  return new Date(`${normalized}Z`);
};

export const convertToBogotaTime = (dateTimeString: string): Date => {
  const utcDate = parseAsUtc(dateTimeString);
  return toZonedTime(utcDate, BOGOTA_TIMEZONE);
};

// Formatear fecha y hora en zona horaria de Bogotá
export const formatBogotaDateTime = (dateTimeString: string, formatPattern: string = "dd/MM/yyyy HH:mm"): string => {
  return formatInTimeZone(parseAsUtc(dateTimeString), BOGOTA_TIMEZONE, formatPattern, { locale: es });
};

// Formatear solo fecha en zona horaria de Bogotá
export const formatBogotaDate = (dateTimeString: string): string => {
  return formatBogotaDateTime(dateTimeString, "dd/MM/yyyy");
};

// Formatear solo hora en zona horaria de Bogotá
export const formatBogotaTime = (dateTimeString: string): string => {
  return formatBogotaDateTime(dateTimeString, "HH:mm");
};

// Formatear hora con AM/PM en zona horaria de Bogotá
export const formatBogotaTimeAmPm = (dateTimeString: string): string => {
  return formatInTimeZone(parseAsUtc(dateTimeString), BOGOTA_TIMEZONE, 'hh:mm a', { locale: es });
};

// Formatear distancia relativa al tiempo actual (hace X tiempo) en zona horaria de Bogotá
export const formatBogotaDistanceToNow = (dateTimeString: string): string => {
  const bogotaDate = convertToBogotaTime(dateTimeString);
  return formatDistanceToNow(bogotaDate, { addSuffix: true, locale: es });
};


export const generateWorkingDaysRange = (startDate: string, endDate: string): Date[] => {
  const dates: Date[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Iterar desde la fecha de inicio hasta la fecha de fin (INCLUSIVO para incluir el último día)
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // Solo agregar días laborales (lunes=1 a viernes=5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log('generateWorkingDaysRange - Fixed:', {
    startDate,
    endDate,
    generatedDates: dates.map(d => ({ 
      date: d.toDateString(), 
      dayOfWeek: d.getDay(),
      dayName: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()]
    })),
    totalDays: dates.length
  });

  return dates;
};
