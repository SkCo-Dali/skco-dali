
// Función para obtener el lunes de una semana dada
export const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  // Establecer a inicio del día para evitar problemas de zona horaria
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Función para obtener las fechas de una semana (lunes a viernes) - CORREGIDA
export const getWeekDates = (monday: Date) => {
  const dates = [];
  
  // Asegurar que sea lunes y establecer a inicio del día
  const mondayAdjusted = getMondayOfWeek(monday);
  
  // Generar exactamente 5 días laborales (lunes a viernes)
  for (let i = 0; i < 5; i++) {
    const date = new Date(mondayAdjusted);
    date.setDate(mondayAdjusted.getDate() + i);
    date.setHours(0, 0, 0, 0); // Establecer a inicio del día
    dates.push(date);
  }
  
  console.log('Generated week dates (fixed):', {
    inputMonday: monday.toDateString(),
    adjustedMonday: mondayAdjusted.toDateString(),
    dates: dates.map(d => ({ 
      date: d.toDateString(), 
      index: dates.indexOf(d),
      dayOfWeek: d.getDay(),
      dayName: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()]
    })),
    totalDays: dates.length
  });
  
  return dates;
};

// Función para formatear fecha a string YYYY-MM-DD - ADDED SAFETY CHECK
export const formatDateToISO = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('formatDateToISO: Invalid date provided:', date);
    return new Date().toISOString().slice(0, 10); // fallback to today
  }
  return date.toISOString().slice(0, 10);
};

// Generar días del mes para la vista de calendario
export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
  const firstDayOfWeek = firstDay.getDay();
  const startDate = firstDay.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);
  
  const days = [];
  
  // Días del mes anterior
  if (startDate < 1) {
    const prevMonth = new Date(year, month - 1, 0);
    const prevDaysInMonth = prevMonth.getDate();
    for (let i = prevDaysInMonth + startDate; i <= prevDaysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, i)
      });
    }
  }
  
  // Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }
  
  // Días del siguiente mes para completar la grilla
  const remainingDays = 42 - days.length; // 6 semanas * 7 días
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }
  
  return days;
};

export const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
