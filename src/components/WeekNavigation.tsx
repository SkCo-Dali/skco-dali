
import React from 'react';
import { Button } from '@/components/ui/button';
import { getMondayOfWeek } from '@/utils/weekSelectorUtils';

interface WeekNavigationProps {
  selectedWeekMonday: Date;
  onWeekChange: (monday: Date) => void;
}

export function WeekNavigation({ selectedWeekMonday, onWeekChange }: WeekNavigationProps) {
  return (
    <div className="flex gap-2 mt-6 justify-center">
      <Button 
        onClick={() => onWeekChange(new Date(selectedWeekMonday.getTime() - 7 * 24 * 60 * 60 * 1000))} 
        variant="outline" 
        size="sm"
      >
        ← Semana Anterior
      </Button>
      <Button 
        onClick={() => onWeekChange(getMondayOfWeek(new Date()))} 
        variant="outline" 
        size="sm"
      >
        Semana Actual
      </Button>
      <Button 
        onClick={() => onWeekChange(new Date(selectedWeekMonday.getTime() + 7 * 24 * 60 * 60 * 1000))} 
        variant="outline" 
        size="sm"
      >
        Semana Siguiente →
      </Button>
    </div>
  );
}
