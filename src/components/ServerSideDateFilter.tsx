import { useState, useEffect, useMemo } from "react";
import { Calendar, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useDistinctValues } from "@/hooks/useServerSideFilters";
import { LeadsApiFilters } from "@/types/paginatedLeadsTypes";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ServerSideDateFilterProps {
  field: string;
  label: string;
  currentFilters: LeadsApiFilters;
  onFilterChange: (field: string, selectedRanges: string[]) => void;
  onClearFilter?: (field: string) => void;
}

interface GroupedDates {
  [year: string]: {
    [month: string]: {
      [day: string]: string[];
    };
  };
}

interface DateRangeCondition {
  type: 'custom';
  from?: Date;
  to?: Date;
}

export function ServerSideDateFilter({
  field,
  label,
  currentFilters,
  onFilterChange,
  onClearFilter
}: ServerSideDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'specific' | 'custom'>('specific');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState<DateRangeCondition>({ type: 'custom' });
  const [isDateTreeOpen, setIsDateTreeOpen] = useState(true);
  
  // Map UI fields to API fields for API calls
  const getApiField = (uiField: string): string => {
    const mapping: Record<string, string> = {
      'lastInteraction': 'LastInteractionAt',
      'lastGestorInteractionAt': 'LastGestorInteractionAt',
      'createdAt': 'CreatedAt',
      'updatedAt': 'UpdatedAt',
      'nextFollowUp': 'NextFollowUp'
    };
    return mapping[uiField] || uiField;
  };
  
  // Map API fields back to UI fields for filter callbacks
  const getUiField = (apiField: string): string => {
    const mapping: Record<string, string> = {
      'LastInteractionAt': 'lastInteraction',
      'LastGestorInteractionAt': 'lastGestorInteractionAt',
      'CreatedAt': 'createdAt',
      'UpdatedAt': 'updatedAt',
      'NextFollowUp': 'nextFollowUp'
    };
    return mapping[apiField] || apiField;
  };
  
  const apiField = getApiField(field);
  const uiField = getUiField(apiField);
  
  // Usar el hook para obtener valores únicos de fechas
  const {
    values: uniqueDates,
    loading,
    error,
    initialize,
    hasInitialized
  } = useDistinctValues(apiField, currentFilters);

  // Obtener valores actualmente seleccionados del filtro
  const currentSelectedDates = useMemo(() => {
    const filter = currentFilters[apiField];
    const fieldEnd = `${apiField}End`;
    const filterEnd = currentFilters[fieldEnd];
    
    if (filter && filterEnd) {
      // Si hay filtro de rango, extraer las fechas
      return [String(filter), String(filterEnd)];
    }
    return [];
  }, [currentFilters, apiField]);

  // Actualizar valores seleccionados cuando cambian los filtros externos
  useEffect(() => {
    if (currentSelectedDates.length > 0) {
      setSelectedDates(currentSelectedDates);
    }
  }, [currentSelectedDates]);

  // Agrupar fechas por año/mes/día
  const groupedDates: GroupedDates = useMemo(() => {
    const grouped: GroupedDates = {};
    
    uniqueDates.forEach(dateStr => {
      if (!dateStr) return;
      
      try {
        const date = parseISO(String(dateStr));
        const year = format(date, 'yyyy');
        const monthNum = String(date.getMonth() + 1).padStart(2, '0'); // Número del mes
        const day = String(date.getDate()).padStart(2, '0');
        
        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][monthNum]) grouped[year][monthNum] = {};
        if (!grouped[year][monthNum][day]) grouped[year][monthNum][day] = [];
        
        grouped[year][monthNum][day].push(String(dateStr));
      } catch (e) {
        console.error('Error parsing date:', dateStr, e);
      }
    });
    
    return grouped;
  }, [uniqueDates]);

  const handleDateToggle = (dateStr: string, checked: boolean) => {
    if (checked) {
      setSelectedDates(prev => [...prev, dateStr]);
    } else {
      setSelectedDates(prev => prev.filter(d => d !== dateStr));
    }
  };

  const handleYearChange = (year: string, checked: boolean) => {
    if (checked) {
      setSelectedDates(prev => [...prev, `year:${year}`]);
    } else {
      setSelectedDates(prev => prev.filter(d => d !== `year:${year}`));
    }
  };

  const handleMonthChange = (year: string, monthNum: string, checked: boolean) => {
    if (checked) {
      setSelectedDates(prev => [...prev, `month:${year}-${monthNum}`]);
    } else {
      setSelectedDates(prev => prev.filter(d => d !== `month:${year}-${monthNum}`));
    }
  };

  const handleClear = () => {
    setSelectedDates([]);
    setCustomCondition({ type: 'custom' });
    onFilterChange(uiField, []);
  };

  const handleCancel = () => {
    setSelectedDates(currentSelectedDates);
    setCustomCondition({ type: 'custom' });
    setIsOpen(false);
  };

  const handleApply = () => {
    if (activeTab === 'specific' && selectedDates.length > 0) {
      // Para fechas específicas, encontrar el rango min-max
      const sortedDates = selectedDates.sort();
      const minDate = sortedDates[0];
      const maxDate = sortedDates[sortedDates.length - 1];
      // Add time to dates for proper comparison: start of day for min, end of day for max
      const minDateWithTime = `${minDate}T00:00:00`;
      const maxDateWithTime = `${maxDate}T23:59:59`;
      onFilterChange(uiField, [minDateWithTime, maxDateWithTime]);
    } else if (activeTab === 'custom' && (customCondition.from || customCondition.to)) {
      // Para rango personalizado
      const from = customCondition.from ? format(customCondition.from, 'yyyy-MM-dd') : undefined;
      const to = customCondition.to ? format(customCondition.to, 'yyyy-MM-dd') : undefined;
      
      // Add time to dates for proper comparison
      if (from && to) {
        onFilterChange(uiField, [`${from}T00:00:00`, `${to}T23:59:59`]);
      } else if (from) {
        onFilterChange(uiField, [`${from}T00:00:00`, `${from}T23:59:59`]);
      } else if (to) {
        onFilterChange(uiField, [`${to}T00:00:00`, `${to}T23:59:59`]);
      }
    }
    setIsOpen(false);
  };

  // Inicializar valores cuando se abre el popover por primera vez
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      initialize();
    }
  }, [isOpen, hasInitialized, initialize]);

  const hasActiveFilters = currentSelectedDates.length > 0;

  return (
    <div className="flex items-center gap-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 hover:bg-gray-100 ${
              hasActiveFilters ? 'text-green-600' : 'text-gray-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Filter className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-96 p-0 bg-white border shadow-lg z-50" 
          align="start"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <h3 className="font-medium text-sm">Filtrar por {label}</h3>
            </div>

            {loading && (
              <div className="text-center py-4 text-sm text-gray-500">
                Cargando fechas...
              </div>
            )}

            {error && (
              <div className="text-center py-4 text-sm text-red-500">
                Error: {error}
              </div>
            )}

            {!loading && !error && (
              <div className="flex mb-4">
                <div className="flex bg-gray-100 rounded-xl p-1">
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
            )}

            <div className="max-h-80 overflow-y-auto space-y-2">
              {!loading && !error && activeTab === 'specific' && (
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
                          <div className="flex items-center space-x-2 p-1 hover:bg-gray-50 w-full">
                            <Checkbox
                              checked={selectedDates.includes(`year:${year}`)}
                              onCheckedChange={(checked) => handleYearChange(year, checked as boolean)}
                            />
                            <CollapsibleTrigger className="flex items-center space-x-2 flex-1 text-left">
                              <ChevronDown className="h-3 w-3" />
                              <span className="text-xs text-gray-600">{year}</span>
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent className="ml-4">
                            {Object.entries(months)
                              .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB))
                              .map(([monthNum, days]) => {
                              const monthName = format(new Date(parseInt(year), parseInt(monthNum) - 1, 1), 'MMMM', { locale: es });
                              return (
                                <Collapsible key={monthNum}>
                                  <div className="flex items-center space-x-2 p-1 hover:bg-gray-50 w-full">
                                    <Checkbox
                                      checked={selectedDates.includes(`month:${year}-${monthNum}`)}
                                      onCheckedChange={(checked) => handleMonthChange(year, monthNum, checked as boolean)}
                                    />
                                    <CollapsibleTrigger className="flex items-center space-x-2 flex-1 text-left">
                                      <ChevronDown className="h-3 w-3" />
                                      <span className="text-xs text-gray-500">{monthName}</span>
                                    </CollapsibleTrigger>
                                  </div>
                                  <CollapsibleContent className="ml-4">
                                    {Object.entries(days)
                                      .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
                                      .map(([day, dates]) => (
                                        <div key={day} className="flex items-center space-x-2 p-1 hover:bg-gray-50">
                                          <Checkbox
                                            checked={selectedDates.includes(`${year}-${monthNum}-${day}`)}
                                            onCheckedChange={(checked) => handleDateToggle(`${year}-${monthNum}-${day}`, checked as boolean)}
                                          />
                                          <label className="text-xs text-gray-600 cursor-pointer flex-1 select-none">
                                            {day}
                                          </label>
                                        </div>
                                      ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    {Object.keys(groupedDates).length === 0 && (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No se encontraron fechas
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {!loading && !error && activeTab === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Desde:</label>
                    <CalendarComponent
                      mode="single"
                      selected={customCondition.from}
                      onSelect={(date) => setCustomCondition(prev => ({ ...prev, from: date }))}
                      locale={es}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hasta:</label>
                    <CalendarComponent
                      mode="single"
                      selected={customCondition.to}
                      onSelect={(date) => setCustomCondition(prev => ({ ...prev, to: date }))}
                      locale={es}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-600"
              >
                Limpiar
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="text-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={loading}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
