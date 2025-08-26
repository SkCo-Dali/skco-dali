import { useState, useMemo } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
         startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, subWeeks, 
         subMonths, subQuarters, subYears, addDays, addWeeks, addMonths, addQuarters, 
         addYears, isWithinInterval, parseISO, isSameDay, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { Lead } from "@/types/crm";

interface DateFilterProps {
  column: string;
  data: Lead[];
  onFilterChange: (column: string, selectedRanges: string[]) => void;
  onClearFilter?: (column: string) => void;
  currentFilters: string[];
}

interface DateRangeCondition {
  id: string;
  operator: string;
  startDate?: Date;
  endDate?: Date;
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
  const [activeTab, setActiveTab] = useState<'ranges' | 'specific' | 'custom'>('ranges');
  const [selectedRanges, setSelectedRanges] = useState<string[]>(currentFilters);
  const [selectedSpecificDates, setSelectedSpecificDates] = useState<string[]>([]);
  const [customConditions, setCustomConditions] = useState<DateRangeCondition[]>([]);
  const [isDateTreeOpen, setIsDateTreeOpen] = useState(true);

  // Group dates by year, month, and day for the tree view
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

    const grouped: Record<string, Record<string, Record<string, Date[]>>> = {};
    
    dates.forEach(date => {
      const year = date.getFullYear().toString();
      const month = format(date, 'MMMM', { locale: es });
      const day = format(date, 'dd', { locale: es });
      
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = {};
      if (!grouped[year][month][day]) grouped[year][month][day] = [];
      grouped[year][month][day].push(date);
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

  const handleSpecificDateChange = (dateString: string, checked: boolean) => {
    if (checked) {
      setSelectedSpecificDates(prev => [...prev, dateString]);
    } else {
      setSelectedSpecificDates(prev => prev.filter(d => d !== dateString));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (activeTab === 'ranges') {
      if (checked) {
        setSelectedRanges(DATE_RANGES.map(range => range.id));
      } else {
        setSelectedRanges([]);
      }
    }
  };

  const addCustomCondition = () => {
    setCustomConditions(prev => [...prev, {
      id: `custom-${Date.now()}`,
      operator: 'equals'
    }]);
  };

  const updateCustomCondition = (index: number, field: keyof DateRangeCondition, value: any) => {
    setCustomConditions(prev => {
      const newConditions = [...prev];
      newConditions[index] = { ...newConditions[index], [field]: value };
      return newConditions;
    });
  };

  const removeCustomCondition = (index: number) => {
    setCustomConditions(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    let finalFilters: string[] = [];
    
    if (activeTab === 'ranges') {
      finalFilters = selectedRanges;
    } else if (activeTab === 'specific') {
      finalFilters = selectedSpecificDates;
    } else if (activeTab === 'custom') {
      finalFilters = customConditions
        .filter(condition => condition.startDate || (condition.operator === 'equals' && condition.startDate))
        .map(condition => `custom:${JSON.stringify(condition)}`);
    }
    
    onFilterChange(column, finalFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedRanges([]);
    setSelectedSpecificDates([]);
    setCustomConditions([]);
    onFilterChange(column, []);
  };

  const handleCancel = () => {
    setSelectedRanges(currentFilters);
    setSelectedSpecificDates([]);
    setCustomConditions([]);
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
        className="w-200 p-0 bg-white border shadow-lg z-50" 
        align="start"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="p-4" onClick={(e) => e.stopPropagation()}>
          {/* Header with tabs */}
          <div className="flex mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('ranges');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  activeTab === 'ranges' 
                    ? 'text-white bg-green-500' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Periodos
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('specific');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  activeTab === 'specific' 
                    ? 'text-white bg-green-500' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Específicas
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('custom');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  activeTab === 'custom' 
                    ? 'text-white bg-green-500' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Rango
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {activeTab === 'ranges' && (
              <>
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
              </>
            )}

            {activeTab === 'specific' && (
              <Collapsible open={isDateTreeOpen} onOpenChange={setIsDateTreeOpen}>
                <CollapsibleTrigger className="flex items-center space-x-2 p-2 hover:bg-gray-50 w-full text-left border-b">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDateTreeOpen ? '' : '-rotate-90'}`} />
                  <span className="text-sm font-medium text-gray-700">Fechas Específicas</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-2">
                  {Object.entries(groupedDates)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                    .map(([year, months]) => (
                      <Collapsible key={year}>
                        <CollapsibleTrigger className="flex items-center space-x-2 p-1 hover:bg-gray-50 w-full text-left">
                          <ChevronDown className="h-3 w-3" />
                          <span className="text-xs text-gray-600">{year}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4">
                          {Object.entries(months).map(([month, days]) => (
                            <Collapsible key={month}>
                              <CollapsibleTrigger className="flex items-center space-x-2 p-1 hover:bg-gray-50 w-full text-left">
                                <ChevronDown className="h-3 w-3" />
                                <span className="text-xs text-gray-500">{month}</span>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="ml-4">
                                {Object.entries(days).map(([day, dates]) => (
                                  <div key={day} className="flex items-center space-x-2 p-1 hover:bg-gray-50">
                                    <Checkbox
                                      checked={selectedSpecificDates.includes(`${year}-${month}-${day}`)}
                                      onCheckedChange={(checked) => handleSpecificDateChange(`${year}-${month}-${day}`, checked as boolean)}
                                    />
                                    <label className="text-xs text-gray-600 cursor-pointer flex-1 select-none">
                                      {day} ({dates.length})
                                    </label>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-3">
                {customConditions.length === 0 && (
                  <div className="text-center text-wrap text-gray-500 text-sm py-4">
                    Haz clic en "Agregar Condición" para crear un filtro
                  </div>
                )}
                
                {customConditions.map((condition, index) => (
                  <div key={condition.id} className="border rounded p-3 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCustomCondition(index, 'operator', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-50">
                          <SelectItem value="equals">Es igual a</SelectItem>
                          <SelectItem value="after">Después de</SelectItem>
                          <SelectItem value="before">Antes de</SelectItem>
                          <SelectItem value="between">Entre</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomCondition(index);
                        }}
                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {condition.operator && (
                        <>
                          <div className="text-xs text-gray-600 font-medium">
                            {condition.operator === 'equals' ? 'Fecha:' : 
                             condition.operator === 'after' ? 'Desde:' :
                             condition.operator === 'before' ? 'Hasta:' : 'Desde:'}
                          </div>
                          <div className="bg-gray-50 rounded-md" onClick={(e) => e.stopPropagation()}>
                            <CalendarComponent
                              mode="single"
                              selected={condition.startDate}
                              onSelect={(date) => {
                                updateCustomCondition(index, 'startDate', date);
                              }}
                              className="p-3 pointer-events-auto"
                              locale={es}
                            />
                          </div>
                          
                          {condition.operator === 'between' && (
                            <>
                              <div className="text-xs text-gray-600 font-medium">Hasta:</div>
                              <div className="bg-gray-50 rounded-md" onClick={(e) => e.stopPropagation()}>
                                <CalendarComponent
                                  mode="single"
                                  selected={condition.endDate}
                                  onSelect={(date) => {
                                    updateCustomCondition(index, 'endDate', date);
                                  }}
                                  className="p-3 pointer-events-auto"
                                  locale={es}
                                  disabled={(date) => condition.startDate ? date < condition.startDate : false}
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addCustomCondition();
                  }}
                  className="w-full"
                  disabled={customConditions.length >= 5}
                >
                  + Agregar Condición
                </Button>
              </div>
            )}
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