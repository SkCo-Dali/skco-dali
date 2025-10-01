import { useState, useEffect, useMemo } from "react";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  
  // Usar el hook para obtener valores únicos de fechas
  const {
    values: uniqueDates,
    loading,
    error,
    initialize,
    hasInitialized
  } = useDistinctValues(field, currentFilters);

  // Obtener valores actualmente seleccionados del filtro
  const currentSelectedDates = useMemo(() => {
    const filter = currentFilters[field];
    const fieldEnd = `${field}End`;
    const filterEnd = currentFilters[fieldEnd];
    
    if (filter && filterEnd) {
      // Si hay filtro de rango, extraer las fechas
      return [String(filter), String(filterEnd)];
    }
    return [];
  }, [currentFilters, field]);

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
        const month = format(date, 'MMMM', { locale: es });
        const day = format(date, 'd');
        
        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][month]) grouped[year][month] = {};
        if (!grouped[year][month][day]) grouped[year][month][day] = [];
        
        grouped[year][month][day].push(String(dateStr));
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

  const handleSelectAllInGroup = (dates: string[], checked: boolean) => {
    if (checked) {
      setSelectedDates(prev => {
        const newDates = [...prev];
        dates.forEach(date => {
          if (!newDates.includes(date)) {
            newDates.push(date);
          }
        });
        return newDates;
      });
    } else {
      setSelectedDates(prev => prev.filter(d => !dates.includes(d)));
    }
  };

  const handleClear = () => {
    setSelectedDates([]);
    setCustomCondition({ type: 'custom' });
    onFilterChange(field, []);
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
      onFilterChange(field, [minDate, maxDate]);
    } else if (activeTab === 'custom' && (customCondition.from || customCondition.to)) {
      // Para rango personalizado
      const from = customCondition.from ? format(customCondition.from, 'yyyy-MM-dd') : undefined;
      const to = customCondition.to ? format(customCondition.to, 'yyyy-MM-dd') : undefined;
      
      if (from && to) {
        onFilterChange(field, [from, to]);
      } else if (from) {
        onFilterChange(field, [from, from]);
      } else if (to) {
        onFilterChange(field, [to, to]);
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
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'specific' | 'custom')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="specific">Fechas específicas</TabsTrigger>
                  <TabsTrigger value="custom">Rango personalizado</TabsTrigger>
                </TabsList>

                <TabsContent value="specific" className="mt-4">
                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {Object.entries(groupedDates).map(([year, months]) => (
                        <div key={year} className="mb-4">
                          <h4 className="font-semibold text-sm mb-2">{year}</h4>
                          {Object.entries(months).map(([month, days]) => {
                            const allDatesInMonth = Object.values(days).flat();
                            const allSelected = allDatesInMonth.every(d => selectedDates.includes(d));
                            const someSelected = allDatesInMonth.some(d => selectedDates.includes(d));

                            return (
                              <div key={`${year}-${month}`} className="ml-4 mb-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(checked) => {
                                      handleSelectAllInGroup(allDatesInMonth, checked as boolean);
                                    }}
                                    className={someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""}
                                  />
                                  <label className="text-sm font-medium capitalize cursor-pointer">
                                    {month}
                                  </label>
                                </div>
                                <div className="ml-6 space-y-1">
                                  {Object.entries(days).map(([day, dates]) => (
                                    <div key={`${year}-${month}-${day}`} className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={dates.some(d => selectedDates.includes(d))}
                                        onCheckedChange={(checked) => {
                                          dates.forEach(d => handleDateToggle(d, checked as boolean));
                                        }}
                                      />
                                      <label className="text-sm text-gray-700 cursor-pointer">
                                        Día {day} ({dates.length} registro{dates.length > 1 ? 's' : ''})
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      {Object.keys(groupedDates).length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-500">
                          No se encontraron fechas
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="custom" className="mt-4">
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
                </TabsContent>
              </Tabs>
            )}

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
