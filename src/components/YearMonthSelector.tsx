
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MONTHS } from '@/utils/weekSelectorUtils';

interface YearMonthSelectorProps {
  currentYear: number;
  currentMonth: number;
  onPrevYear: () => void;
  onNextYear: () => void;
  onMonthSelect: (month: number) => void;
}

export function YearMonthSelector({ 
  currentYear, 
  currentMonth, 
  onPrevYear, 
  onNextYear, 
  onMonthSelect 
}: YearMonthSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{currentYear}</h4>
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={onNextYear}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onPrevYear}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid de meses */}
      <div className="grid grid-cols-3 gap-2">
        {MONTHS.map((month, index) => (
          <Button
            key={month}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 text-sm",
              index === currentMonth && "bg-[#00c83c] text-white hover:bg-[#00c83c]/90"
            )}
            onClick={() => onMonthSelect(index)}
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  );
}
