import { useState, useMemo } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
         startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, subWeeks, 
         subMonths, subQuarters, subYears, addDays, addWeeks, addMonths, addQuarters, 
         addYears, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Lead } from "@/types/crm";

interface DateFilterProps {
  column: string;
  data: Lead[];
  onFilterChange: (column: string, selectedRanges: string[]) => void;
  onClearFilter?: (column: string) => void;
  currentFilters: string[];
}

interface DateRange {
  id: string;
  label: string;
  getRange: () => { start: Date; end: Date };
}

const DATE_RANGES: DateRange[] = [
  {
    id: 'today',
    label: 'Hoy',
    getRange: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) })
  },
  {
    id: 'yesterday',
    label: 'Ayer',
    getRange: () => {
      const yesterday = subDays(new Date(), 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }
  },
  {
    id: 'this-week',
    label: 'Esta Semana',
    getRange: () => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) })
  },
  {
    id: 'last-week',
    label: 'Semana Pasada',
    getRange: () => {
      const lastWeek = subWeeks(new Date(), 1);
      return { start: startOfWeek(lastWeek, { weekStartsOn: 1 }), end: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
    }
  },
  {
    id: 'next-week',  
    label: 'Próxima Semana',
    getRange: () => {
      const nextWeek = addWeeks(new Date(), 1);
      return { start: startOfWeek(nextWeek, { weekStartsOn: 1 }), end: endOfWeek(nextWeek, { weekStartsOn: 1 }) };
    }
  },
  {
    id: 'this-month',
    label: 'Este Mes',
    getRange: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) })
  },
  {
    id: 'last-month',
    label: 'Mes Pasado',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
  },
  {
    id: 'next-month',
    label: 'Próximo Mes', 
    getRange: () => {
      const nextMonth = addMonths(new Date(), 1);
      return { start: startOfMonth(nextMonth), end: endOfMonth(nextMonth) };
    }
  },
  {
    id: 'this-quarter',
    label: 'Este Trimestre',
    getRange: () => ({ start: startOfQuarter(new Date()), end: endOfQuarter(new Date()) })
  },
  {
    id: 'last-quarter',
    label: 'Trimestre Pasado',
    getRange: () => {
      const lastQuarter = subQuarters(new Date(), 1);
      return { start: startOfQuarter(lastQuarter), end: endOfQuarter(lastQuarter) };
    }
  },
  {
    id: 'next-quarter',
    label: 'Próximo Trimestre',
    getRange: () => {
      const nextQuarter = addQuarters(new Date(), 1);
      return { start: startOfQuarter(nextQuarter), end: endOfQuarter(nextQuarter) };
    }
  },
  {
    id: 'this-year',
    label: 'Este Año',
    getRange: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) })
  },
  {
    id: 'last-year',
    label: 'Año Pasado',
    getRange: () => {
      const lastYear = subYears(new Date(), 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    }
  },
  {
    id: 'next-year',
    label: 'Próximo Año',
    getRange: () => {
      const nextYear = addYears(new Date(), 1);
      return { start: startOfYear(nextYear), end: endOfYear(nextYear) };
    }
  }
];

export function DateFilter({ 
  column, 
  data, 
  onFilterChange, 
  onClearFilter,
  currentFilters 
}: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRanges, setSelectedRanges] = useState<string[]>(currentFilters);
  const [isDateTreeOpen, setIsDateTreeOpen] = useState(true);

  // Group dates by year and month for the tree view
  const groupedDates = useMemo(() => {
    const dates = data.map(lead => {
      const dateValue = lead[column as keyof Lead] as string;
      if (!dateValue) return null;
      
      try {
        return parseISO(dateValue);
      } catch {
        return null;
      }
    }).filter(Boolean) as Date[];

    const grouped: Record<string, Record<string, Date[]>> = {};
    
    dates.forEach(date => {
      const year = date.getFullYear().toString();
      const month = format(date, 'MMMM', { locale: es });
      
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];
      grouped[year][month].push(date);
    });

    return grouped;
  }, [data, column]);

  const handleRangeChange = (rangeId: string, checked: boolean) => {
    if (checked) {
      setSelectedRanges(prev => [...prev, rangeId]);
    } else {
      setSelectedRanges(prev => prev.filter(id => id !== rangeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRanges(DATE_RANGES.map(range => range.id));
    } else {
      setSelectedRanges([]);
    }
  };

  const handleApply = () => {
    onFilterChange(column, selectedRanges);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedRanges([]);
    onFilterChange(column, []);
  };

  const handleCancel = () => {
    setSelectedRanges(currentFilters);
    setIsOpen(false);
  };

  const isAllSelected = selectedRanges.length === DATE_RANGES.length;
  const isIndeterminate = selectedRanges.length > 0 && selectedRanges.length < DATE_RANGES.length;
  const hasActiveFilters = currentFilters.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 hover:bg-gray-100 ${
            hasActiveFilters ? 'text-green-600' : 'text-gray-400'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Calendar className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-white border shadow-lg z-50" 
        align="start"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="p-4" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Filtros de Fecha</h3>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {/* Select All */}
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 border-b">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
                {...(isIndeterminate ? { "data-state": "indeterminate" } : {})}
              />
              <label className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                (Seleccionar Todo)
              </label>
            </div>

            {/* Predefined ranges */}
            {DATE_RANGES.map((range) => (
              <div key={range.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                <Checkbox
                  checked={selectedRanges.includes(range.id)}
                  onCheckedChange={(checked) => handleRangeChange(range.id, checked as boolean)}
                />
                <label className="text-sm text-gray-700 cursor-pointer flex-1 select-none">
                  {range.label}
                </label>
              </div>
            ))}

            {/* Date tree view */}
            <Collapsible open={isDateTreeOpen} onOpenChange={setIsDateTreeOpen}>
              <CollapsibleTrigger className="flex items-center space-x-2 p-2 hover:bg-gray-50 w-full text-left">
                <ChevronDown className={`h-4 w-4 transition-transform ${isDateTreeOpen ? '' : '-rotate-90'}`} />
                <span className="text-sm font-medium text-gray-700">Fechas Específicas</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4">
                {Object.entries(groupedDates)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([year, months]) => (
                    <Collapsible key={year}>
                      <CollapsibleTrigger className="flex items-center space-x-2 p-1 hover:bg-gray-50 w-full text-left">
                        <ChevronDown className="h-3 w-3" />
                        <span className="text-xs text-gray-600">{year}</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-4">
                        {Object.entries(months).map(([month, dates]) => (
                          <div key={month} className="flex items-center space-x-2 p-1 hover:bg-gray-50">
                            <span className="text-xs text-gray-500 ml-4">
                              {month} ({dates.length})
                            </span>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-gray-600"
            >
              Limpiar
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-gray-600"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}