import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Filter, X, Search, SlidersHorizontal } from "lucide-react";
import {
  OpportunityFilters,
  SortOption,
  OPPORTUNITY_TYPE_LABELS,
  OpportunityType,
  Priority,
} from "@/types/opportunities";
import { opportunitiesService } from "@/services/opportunitiesService";

interface OpportunityFiltersProps {
  filters: OpportunityFilters;
  sortBy: SortOption;
  onFiltersChange: (filters: OpportunityFilters) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
}

export const OpportunityFiltersComponent: React.FC<OpportunityFiltersProps> = ({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const filterOptions = opportunitiesService.getFilterOptions();

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    const currentTypes = filters.type || [];
    const newTypes = checked ? [...currentTypes, type as OpportunityType] : currentTypes.filter((t) => t !== type);

    onFiltersChange({
      ...filters,
      type: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = checked
      ? [...currentPriorities, priority as Priority]
      : currentPriorities.filter((p) => p !== priority);

    onFiltersChange({
      ...filters,
      priority: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const handleCustomerCountChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      customerCount: { min: value[0], max: value[1] },
    });
  };

  const handleCommissionChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      potentialCommission: { min: value[0], max: value[1] },
    });
  };

  const handleFavoritesToggle = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      onlyFavorites: checked || undefined,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.customerCount) count++;
    if (filters.potentialCommission) count++;
    if (filters.onlyFavorites) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const FilterContent = () => (
    <div className="space-y-3">
      {/* Only Favorites */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Filtros especiales</Label>
        <div className="flex items-center space-x-2">
          <Checkbox id="favorites" checked={filters.onlyFavorites || false} onCheckedChange={handleFavoritesToggle} />
          <Label htmlFor="favorites" className="text-sm">
            Solo favoritas
          </Label>
        </div>
      </div>

      {/* Type Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tipo de oportunidad</Label>
        <div className="space-y-1.5">
          {filterOptions.types.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.type?.includes(type) || false}
                onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm">
                {OPPORTUNITY_TYPE_LABELS[type]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Prioridad</Label>
        <div className="space-y-1.5">
          {filterOptions.priorities.map((priority) => (
            <div key={priority} className="flex items-center space-x-2">
              <Checkbox
                id={`priority-${priority}`}
                checked={filters.priority?.includes(priority) || false}
                onCheckedChange={(checked) => handlePriorityChange(priority, checked as boolean)}
              />
              <Label htmlFor={`priority-${priority}`} className="text-sm capitalize">
                {priority}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Count Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Número de clientes: {filters.customerCount?.min || 0} - {filters.customerCount?.max || 1500}
        </Label>
        <Slider
          value={[filters.customerCount?.min || 0, filters.customerCount?.max || 1500]}
          onValueChange={handleCustomerCountChange}
          max={1500}
          min={0}
          step={50}
          className="w-full"
        />
      </div>

      {/* Potential Commission Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Comisión potencial: ${filters.potentialCommission?.min || 0} - ${filters.potentialCommission?.max || 50000000}
        </Label>
        <Slider
          value={[filters.potentialCommission?.min || 0, filters.potentialCommission?.max || 50000000]}
          onValueChange={handleCommissionChange}
          max={50000000}
          min={0}
          step={1000}
          className="w-full"
        />
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={() => {
            onClearFilters();
            setIsOpen(false);
          }}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Input
          placeholder="Buscar oportunidades..."
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 items-center">
        {/* Sort Dropdown */}
        <span className="text-sm text-muted-foreground">Ordenar por:</span>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevancia</SelectItem>
            <SelectItem value="customers">Más clientes</SelectItem>
            <SelectItem value="recent">Más reciente</SelectItem>
            <SelectItem value="expiring">Próximos a vencer</SelectItem>
          </SelectContent>
        </Select>

        {/* Mobile Filters */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden relative">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-3 h-full">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="hidden lg:flex relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-3 h-full">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
