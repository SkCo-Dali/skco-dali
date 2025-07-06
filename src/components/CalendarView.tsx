
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MONTHS, DAYS, getDaysInMonth, getMondayOfWeek } from '@/utils/weekSelectorUtils';

interface CalendarViewProps {
  viewDate: Date;
  selectedWeekMonday: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: Date) => void;
}

export function CalendarView({ 
  viewDate, 
  selectedWeekMonday, 
  onPrevMonth, 
  onNextMonth, 
  onDayClick 
}: CalendarViewProps) {
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const days = getDaysInMonth(viewDate);

  const isInSelectedWeek = (date: Date) => {
    const monday = getMondayOfWeek(date);
    return monday.getTime() === selectedWeekMonday.getTime();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{MONTHS[currentMonth]} {currentYear}</h4>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {days.map((dayInfo, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 font-normal",
              !dayInfo.isCurrentMonth && "text-muted-foreground",
              isInSelectedWeek(dayInfo.date) && "bg-[#00c83c] text-white hover:bg-[#00c83c]/90"
            )}
            onClick={() => onDayClick(dayInfo.date)}
          >
            {dayInfo.day}
          </Button>
        ))}
      </div>
    </div>
  );
}
