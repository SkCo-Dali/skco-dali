
import { useState } from "react";
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
    <div className="space-y-4 p-4 w-80">
      {/* Header con botón de limpiar filtros */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Filtros</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="flex items-center gap-1 text-xs px-2 py-1 h-7"
        >
          <FilterX className="h-3 w-3" />
          Limpiar filtros
        </Button>
      </div>

      {/* Filtros principales en columna única */}
      <div className="space-y-3">
        {/* Filtro de Etapa */}
        <div className="space-y-1">
          <Label htmlFor="stage-filter" className="text-sm">Etapa</Label>
          <Select 
            value={getSelectValue(filterStage)} 
            onValueChange={(value) => {
              if (value === "all") {
                setFilterStage("all");
              }
            }}
          >
            <SelectTrigger className="w-full h-8 text-sm">
              <SelectValue>
                {getDisplayText(filterStage, "S...", uniqueStages.map(s => ({ value: s, label: s })))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Todas las etapas</SelectItem>
              <ScrollArea className="h-32">
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
        <div className="space-y-1">
          <Label htmlFor="assignedTo-filter" className="text-sm">Asignado a</Label>
          <Select 
            value={getSelectValue(filterAssignedTo)} 
            onValueChange={(value) => {
              if (value === "all") {
                setFilterAssignedTo("all");
              }
            }}
          >
            <SelectTrigger className="w-full h-8 text-sm">
              <SelectValue>
                {getDisplayText(filterAssignedTo, "S...", users)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Todos los usuarios</SelectItem>
              <div className="px-2 py-2 border-b">
                <div className="relative">
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    placeholder="Buscar usuario..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 h-6 text-xs"
                  />
                </div>
              </div>
              <ScrollArea className="h-32">
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
        <div className="space-y-1">
          <Label htmlFor="source-filter" className="text-sm">Fuente</Label>
          <Select 
            value={getSelectValue(filterSource)} 
            onValueChange={(value) => {
              if (value === "all") {
                setFilterSource("all");
              }
            }}
          >
            <SelectTrigger className="w-full h-8 text-sm">
              <SelectValue>
                {getDisplayText(filterSource, "S...", uniqueSources.map(s => ({ value: s, label: s })))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Todas las fuentes</SelectItem>
              <div className="px-2 py-2 border-b">
                <div className="relative">
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    placeholder="Buscar fuente..."
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    className="pl-8 h-6 text-xs"
                  />
                </div>
              </div>
              <ScrollArea className="h-32">
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
        <div className="space-y-1">
          <Label htmlFor="campaign-filter" className="text-sm">Campaña</Label>
          <Select 
            value={getSelectValue(filterCampaign)} 
            onValueChange={(value) => {
              if (value === "all") {
                setFilterCampaign("all");
              }
            }}
          >
            <SelectTrigger className="w-full h-8 text-sm">
              <SelectValue>
                {getDisplayText(filterCampaign, "S...", uniqueCampaigns.map(c => ({ value: c, label: c })))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Todas las campañas</SelectItem>
              <div className="px-2 py-2 border-b">
                <div className="relative">
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    placeholder="Buscar campaña..."
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    className="pl-8 h-6 text-xs"
                  />
                </div>
              </div>
              <ScrollArea className="h-32">
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
        <div className="space-y-1">
          <Label htmlFor="priority-filter" className="text-sm">Prioridad</Label>
          <Select 
            value={getSelectValue(filterPriority)} 
            onValueChange={(value) => {
              if (value === "all") {
                setFilterPriority("all");
              }
            }}
          >
            <SelectTrigger className="w-full h-8 text-sm">
              <SelectValue>
                {getDisplayText(filterPriority, "S...", priorities)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <ScrollArea className="h-32">
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
        <div className="space-y-1">
          <Label htmlFor="duplicates-filter" className="text-sm">
            Duplicados
            {duplicateCount > 0 && (
              <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">
                {duplicateCount}
              </span>
            )}
          </Label>
          <Select value={filterDuplicates} onValueChange={setFilterDuplicates}>
            <SelectTrigger className="w-full h-8 text-sm">
              <SelectValue placeholder="To..." />
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
      <div className="space-y-3 pt-3 border-t">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="date-from" className="text-sm">Fecha desde</Label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="h-8 text-sm"
              placeholder="mm/dd/aaaa"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="date-to" className="text-sm">Fecha hasta</Label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="h-8 text-sm"
              placeholder="mm/dd/aaaa"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="value-min" className="text-sm">Valor mínimo</Label>
            <Input
              type="number"
              placeholder="0"
              value={filterValueMin}
              onChange={(e) => setFilterValueMin(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="value-max" className="text-sm">Valor máximo</Label>
            <Input
              type="number"
              placeholder="∞"
              value={filterValueMax}
              onChange={(e) => setFilterValueMax(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
