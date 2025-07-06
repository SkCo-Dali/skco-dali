import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeekDisplay } from '@/components/WeekDisplay';
import { CalendarView } from '@/components/CalendarView';
import { YearMonthSelector } from '@/components/YearMonthSelector';
import { WeekNavigation } from '@/components/WeekNavigation';
import { getWeekDates, getMondayOfWeek } from '@/utils/weekSelectorUtils';

interface WeekSelectorProps {
  selectedWeekMonday: Date;
  onWeekChange: (monday: Date) => void;
}

export function WeekSelector({ selectedWeekMonday, onWeekChange }: WeekSelectorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedWeekMonday));
  const containerRef = useRef<HTMLDivElement>(null);

  // Asegurar 5 días laborales siempre (desde selectedWeekMonday)
  const ensureFiveWorkingDays = (startDate: Date): Date[] => {
    const dates: Date[] = [];
    let date = new Date(startDate);

    while (dates.length < 5) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeekMonday);
  const displayedWorkingDays = ensureFiveWorkingDays(selectedWeekMonday);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(new Date(currentYear - 1, currentMonth, 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(currentYear + 1, currentMonth, 1));
  };

  const handleDayClick = (clickedDate: Date) => {
    const monday = getMondayOfWeek(clickedDate);
    onWeekChange(monday);
    setIsVisible(false); // ocultar al seleccionar día
  };

  const handleMonthSelect = (month: number) => {
    setViewDate(new Date(currentYear, month, 1));
  };

  // Toggle para abrir/cerrar selector
  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  // Cerrar selector al click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isVisible &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  return (
    <div className="relative mb-6" ref={containerRef}>
      {/* Botón y semana visible */}
      <WeekDisplay 
        weekDates={weekDates}
        onToggleVisibility={toggleVisibility}
        isVisible={isVisible}
      />

      {/* Selector debajo del botón */}
      {isVisible && (
        <div className="absolute top-full left-0 mt-2 z-[100]" style={{ minWidth: '350px' }}>
          <Card className="shadow-lg border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selector de calendario */}
                <CalendarView
                  viewDate={viewDate}
                  selectedWeekMonday={selectedWeekMonday}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onDayClick={handleDayClick}
                />

                {/* Selector de año */}
                <YearMonthSelector
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  onPrevYear={handlePrevYear}
                  onNextYear={handleNextYear}
                  onMonthSelect={handleMonthSelect}
                />
              </div>

              {/* Navegación rápida */}
              <WeekNavigation
                selectedWeekMonday={selectedWeekMonday}
                onWeekChange={onWeekChange}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


