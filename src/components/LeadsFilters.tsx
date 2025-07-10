
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUsersApi } from "@/hooks/useUsersApi";
import { FilterX, Search } from "lucide-react";

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

  // Search states for each dropdown
  const [stageSearch, setStageSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");
  const [campaignSearch, setCampaignSearch] = useState("");
  const [prioritySearch, setPrioritySearch] = useState("");

  const getSelectedCount = (value: string | string[]) => {
    const selectedValues = Array.isArray(value) ? value : (value === "all" ? [] : [value]);
    return selectedValues.length;
  };

  const getDisplayText = (value: string | string[], placeholder: string, options?: any[]) => {
    if (value === "all" || (Array.isArray(value) && value.length === 0)) {
      return placeholder;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 1) {
        // Si solo hay un valor seleccionado, mostrar el nombre completo
        if (options) {
          const option = options.find(opt => opt.id === value[0] || opt.value === value[0] || opt === value[0]);
          return option?.name || option?.label || value[0];
        }
        return value[0];
      } else {
        // Si hay múltiples valores, mostrar el conteo
        return `${value.length} seleccionado${value.length > 1 ? 's' : ''}`;
      }
    } else {
      // Valor único (no array)
      if (options) {
        const option = options.find(opt => opt.id === value || opt.value === value || opt === value);
        return option?.name || option?.label || value;
      }
      return value;
    }
  };

  const getSelectValue = (value: string | string[]) => {
    if (Array.isArray(value) && value.length > 0) {
      return "multi";
    }
    return typeof value === 'string' ? value : "all";
  };

  const handleMultiSelectValue = (currentValue: string | string[], newValue: string) => {
    const currentArray = Array.isArray(currentValue) ? currentValue : (currentValue === "all" ? [] : [currentValue]);
    
    if (currentArray.includes(newValue)) {
      const updated = currentArray.filter(v => v !== newValue);
      return updated.length === 0 ? "all" : updated;
    } else {
      return [...currentArray, newValue];
    }
  };

  // Filter functions for each dropdown
  const filteredStages = uniqueStages.filter(stage => 
    stage.toLowerCase().includes(stageSearch.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredSources = uniqueSources.filter(source => 
    source.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredCampaigns = uniqueCampaigns.filter(campaign => 
    campaign.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  const priorities = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const filteredPriorities = priorities.filter(priority => 
    priority.label.toLowerCase().includes(prioritySearch.toLowerCase())
  );

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

            {/* Filtros principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Filtro de Etapa */}
              <div>
                <Label htmlFor="stage-filter">Etapa</Label>
                <Select 
                  value={getSelectValue(filterStage)} 
                  onValueChange={(value) => {
                    if (value === "all") {
                      setFilterStage("all");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {getDisplayText(filterStage, "Seleccionar etapas", uniqueStages.map(s => ({ value: s, label: s })))}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Todas las etapas</SelectItem>
                    <div className="px-2 py-2 border-b">
                      
                    </div>
                    <ScrollArea className="h-48">
                      {filteredStages.map((stage) => (
                        <div key={stage} className="flex items-center space-x-2 px-2 py-1">
                          <Checkbox
                            id={`stage-${stage}`}
                            checked={Array.isArray(filterStage) ? filterStage.includes(stage) : filterStage === stage}
                            onCheckedChange={() => setFilterStage(handleMultiSelectValue(filterStage, stage))}
                          />
                          <label htmlFor={`stage-${stage}`} className="text-sm cursor-pointer flex-1">
                            {stage}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Asignado a */}
              <div>
                <Label htmlFor="assignedTo-filter">Asignado a</Label>
                <Select 
                  value={getSelectValue(filterAssignedTo)} 
                  onValueChange={(value) => {
                    if (value === "all") {
                      setFilterAssignedTo("all");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {getDisplayText(filterAssignedTo, "Seleccionar usuarios", users)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <div className="px-2 py-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar usuario..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-8 h-8"
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-48">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 px-2 py-1">
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={Array.isArray(filterAssignedTo) ? filterAssignedTo.includes(user.id) : filterAssignedTo === user.id}
                            onCheckedChange={() => setFilterAssignedTo(handleMultiSelectValue(filterAssignedTo, user.id))}
                          />
                          <label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer flex-1">
                            {user.name}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Fuente */}
              <div>
                <Label htmlFor="source-filter">Fuente</Label>
                <Select 
                  value={getSelectValue(filterSource)} 
                  onValueChange={(value) => {
                    if (value === "all") {
                      setFilterSource("all");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {getDisplayText(filterSource, "Seleccionar fuentes", uniqueSources.map(s => ({ value: s, label: s })))}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Todas las fuentes</SelectItem>
                    <div className="px-2 py-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar fuente..."
                          value={sourceSearch}
                          onChange={(e) => setSourceSearch(e.target.value)}
                          className="pl-8 h-8"
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-48">
                      {filteredSources.map((source) => (
                        <div key={source} className="flex items-center space-x-2 px-2 py-1">
                          <Checkbox
                            id={`source-${source}`}
                            checked={Array.isArray(filterSource) ? filterSource.includes(source) : filterSource === source}
                            onCheckedChange={() => setFilterSource(handleMultiSelectValue(filterSource, source))}
                          />
                          <label htmlFor={`source-${source}`} className="text-sm cursor-pointer flex-1">
                            {source}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Campaña */}
              <div>
                <Label htmlFor="campaign-filter">Campaña</Label>
                <Select 
                  value={getSelectValue(filterCampaign)} 
                  onValueChange={(value) => {
                    if (value === "all") {
                      setFilterCampaign("all");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {getDisplayText(filterCampaign, "Seleccionar campañas", uniqueCampaigns.map(c => ({ value: c, label: c })))}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Todas las campañas</SelectItem>
                    <div className="px-2 py-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar campaña..."
                          value={campaignSearch}
                          onChange={(e) => setCampaignSearch(e.target.value)}
                          className="pl-8 h-8"
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-48">
                      {filteredCampaigns.map((campaign) => (
                        <div key={campaign} className="flex items-center space-x-2 px-2 py-1">
                          <Checkbox
                            id={`campaign-${campaign}`}
                            checked={Array.isArray(filterCampaign) ? filterCampaign.includes(campaign) : filterCampaign === campaign}
                            onCheckedChange={() => setFilterCampaign(handleMultiSelectValue(filterCampaign, campaign))}
                          />
                          <label htmlFor={`campaign-${campaign}`} className="text-sm cursor-pointer flex-1">
                            {campaign}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Prioridad */}
              <div>
                <Label htmlFor="priority-filter">Prioridad</Label>
                <Select 
                  value={getSelectValue(filterPriority)} 
                  onValueChange={(value) => {
                    if (value === "all") {
                      setFilterPriority("all");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {getDisplayText(filterPriority, "Seleccionar prioridades", priorities)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    <div className="px-2 py-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar prioridad..."
                          value={prioritySearch}
                          onChange={(e) => setPrioritySearch(e.target.value)}
                          className="pl-8 h-8"
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-48">
                      {filteredPriorities.map((priority) => (
                        <div key={priority.value} className="flex items-center space-x-2 px-2 py-1">
                          <Checkbox
                            id={`priority-${priority.value}`}
                            checked={Array.isArray(filterPriority) ? filterPriority.includes(priority.value) : filterPriority === priority.value}
                            onCheckedChange={() => setFilterPriority(handleMultiSelectValue(filterPriority, priority.value))}
                          />
                          <label htmlFor={`priority-${priority.value}`} className="text-sm cursor-pointer flex-1">
                            {priority.label}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de duplicados */}
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
