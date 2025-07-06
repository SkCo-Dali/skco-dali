

export const convertToBogotaTime = (dateTimeString: string): Date => {
  const utcDate = new Date(dateTimeString);

  // Restar 5 horas (UTC-5)
  utcDate.setHours(utcDate.getHours()-5);

  console.log('Date conversion (UTC-5 fixed):', {
    original: dateTimeString,
    adjusted: utcDate.toISOString(),
    display: utcDate.toLocaleString('es-CO', { hour12: true })
  });

  return utcDate;
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
