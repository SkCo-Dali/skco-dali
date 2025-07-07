
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUsersApi } from "@/hooks/useUsersApi";
import { FilterX } from "lucide-react";

interface LeadsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStage: string | string[];
  setFilterStage: (stage: string | string[]) => void;
  filterPriority: string | string[];
  setFilterPriority: (priority: string | string[]) => void;
  filterAssignedTo: string | string[];
  setFilterAssignedTo: (assignedTo: string | string[]) => void;
  filterSource: string | string[];
  setFilterSource: (source: string | string[]) => void;
  filterCampaign: string | string[];
  setFilterCampaign: (campaign: string | string[]) => void;
  filterDateFrom: string;
  setFilterDateFrom: (date: string) => void;
  filterDateTo: string;
  setFilterDateTo: (date: string) => void;
  filterValueMin: string;
  setFilterValueMin: (value: string) => void;
  filterValueMax: string;
  setFilterValueMax: (value: string) => void;
  filterDuplicates: string;
  setFilterDuplicates: (duplicates: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
  uniqueStages: string[];
  uniqueSources: string[];
  uniqueCampaigns: string[];
  uniqueAssignedTo: string[];
  duplicateCount?: number;
  showClearButton?: boolean;
}

export function LeadsFilters({
  searchTerm,
  setSearchTerm,
  filterStage,
  setFilterStage,
  filterPriority,
  setFilterPriority,
  filterAssignedTo,
  setFilterAssignedTo,
  filterSource,
  setFilterSource,
  filterCampaign,
  setFilterCampaign,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  filterValueMin,
  setFilterValueMin,
  filterValueMax,
  setFilterValueMax,
  filterDuplicates,
  setFilterDuplicates,
  sortBy,
  setSortBy,
  onClearFilters,
  uniqueStages,
  uniqueSources,
  uniqueCampaigns,
  uniqueAssignedTo,
  duplicateCount = 0,
  showClearButton = true
}: LeadsFiltersProps) {
  const { users } = useUsersApi();
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({});

  const toggleDropdown = (key: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMultiSelectChange = (
    currentValue: string | string[],
    newValue: string,
    setter: (value: string | string[]) => void
  ) => {
    const currentArray = Array.isArray(currentValue) ? currentValue : (currentValue === "all" ? [] : [currentValue]);
    
    if (currentArray.includes(newValue)) {
      const updated = currentArray.filter(v => v !== newValue);
      setter(updated.length === 0 ? "all" : updated);
    } else {
      setter([...currentArray, newValue]);
    }
  };

  const getSelectedCount = (value: string | string[]) => {
    const selectedValues = Array.isArray(value) ? value : (value === "all" ? [] : [value]);
    return selectedValues.length;
  };

  const getDisplayText = (value: string | string[], placeholder: string) => {
    const count = getSelectedCount(value);
    if (count === 0) return placeholder;
    return `${count} seleccionado${count > 1 ? 's' : ''}`;
  };

  // Configuración de filtros para facilitar edición
  const filterConfig = [
    {
      key: 'stage',
      label: 'Etapa',
      value: filterStage,
      setValue: setFilterStage,
      options: uniqueStages.map(stage => ({ value: stage, label: stage })),
      placeholder: 'Seleccionar etapas'
    },
    {
      key: 'assignedTo',
      label: 'Asignado a',
      value: filterAssignedTo,
      setValue: setFilterAssignedTo,
      options: users.map(user => ({ value: user.id, label: user.name })),
      placeholder: 'Seleccionar usuarios'
    },
    {
      key: 'source',
      label: 'Fuente',
      value: filterSource,
      setValue: setFilterSource,
      options: uniqueSources.map(source => ({ value: source, label: source })),
      placeholder: 'Seleccionar fuentes'
    },
    {
      key: 'campaign',
      label: 'Campaña',
      value: filterCampaign,
      setValue: setFilterCampaign,
      options: uniqueCampaigns.map(campaign => ({ value: campaign, label: campaign })),
      placeholder: 'Seleccionar campañas'
    },
    {
      key: 'priority',
      label: 'Prioridad',
      value: filterPriority,
      setValue: setFilterPriority,
      options: [
        { value: 'low', label: 'Baja' },
        { value: 'medium', label: 'Media' },
        { value: 'high', label: 'Alta' },
        { value: 'urgent', label: 'Urgente' }
      ],
      placeholder: 'Seleccionar prioridades'
    }
  ];

  return (
    <div className="mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header con botón de limpiar filtros */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <FilterX className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>

            {/* Filtros principales con selección múltiple */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {filterConfig.map((filter) => (
                <div key={filter.key}>
                  <Label htmlFor={`${filter.key}-filter`}>{filter.label}</Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => toggleDropdown(filter.key)}
                    >
                      {getDisplayText(filter.value, filter.placeholder)}
                    </Button>
                    {openDropdowns[filter.key] && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        <div className="p-2">
                          {filter.options.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2 py-1">
                              <Checkbox
                                id={`${filter.key}-${option.value}`}
                                checked={Array.isArray(filter.value) ? filter.value.includes(option.value) : filter.value === option.value}
                                onCheckedChange={() => handleMultiSelectChange(filter.value, option.value, filter.setValue)}
                              />
                              <label 
                                htmlFor={`${filter.key}-${option.value}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Filtro de duplicados - usando Select en lugar de Button personalizado */}
              <div>
                <Label htmlFor="duplicates-filter">
                  Duplicados
                  {duplicateCount > 0 && (
                    <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">
                      {duplicateCount}
                    </span>
                  )}
                </Label>
                <Select value={filterDuplicates} onValueChange={setFilterDuplicates}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar duplicados" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="duplicates">Solo duplicados</SelectItem>
                    <SelectItem value="unique">Solo únicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros de fecha y valor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="date-from">Fecha desde</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="date-to">Fecha hasta</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="value-min">Valor mínimo</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filterValueMin}
                  onChange={(e) => setFilterValueMin(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="value-max">Valor máximo</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filterValueMax}
                  onChange={(e) => setFilterValueMax(e.target.value)}
                />
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Label htmlFor="sort-by">Ordenar por:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="updated">Última actualización</SelectItem>
                  <SelectItem value="created">Fecha de creación</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="value">Valor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
