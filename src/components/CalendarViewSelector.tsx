
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, Grid3X3 } from 'lucide-react';
import { CalendarViewType } from '@/pages/Calendar';

interface CalendarViewSelectorProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

export function CalendarViewSelector({ currentView, onViewChange }: CalendarViewSelectorProps) {
  const views = [
    { id: 'day' as CalendarViewType, label: 'Día', icon: Calendar },
    { id: 'week' as CalendarViewType, label: 'Semana', icon: CalendarDays },
    { id: 'month' as CalendarViewType, label: 'Mes', icon: Grid3X3 },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-md w-fit">
      {views.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={currentView === id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(id)}
          className="flex items-center gap-2"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}
