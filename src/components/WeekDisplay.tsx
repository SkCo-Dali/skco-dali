
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WeekDisplayProps {
  weekDates: Date[];
  onToggleVisibility: () => void;
  isVisible: boolean;
}

export function WeekDisplay({ weekDates, onToggleVisibility, isVisible }: WeekDisplayProps) {
  const formatDateRange = () => {
    const startDate = weekDates[0].toLocaleDateString("es-CO", { 
      day: "2-digit", 
      month: "long", 
      year: "numeric" 
    });
    const endDate = weekDates[4].toLocaleDateString("es-CO", { 
      day: "2-digit", 
      month: "long", 
      year: "numeric" 
    });
    return `${startDate} • ${endDate}`;
  };

  return (
    <div className="mb-6">
      <Button 
        onClick={onToggleVisibility}
        variant="outline" 
        className="flex items-center justify-between w-auto min-w-[300px] h-10 px-4"
      >
        <span className="text-sm font-medium">
          {formatDateRange()}
        </span>
        {isVisible ? (
          <ChevronUp className="h-4 w-4 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-2" />
        )}
      </Button>
    </div>
  );
}
