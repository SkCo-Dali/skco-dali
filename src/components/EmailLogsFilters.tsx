import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EmailLogsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  campaignFilter: string;
  onCampaignChange: (value: string) => void;
  dateFrom: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  onDateToChange: (date: Date | undefined) => void;
  campaigns: string[];
  onClearFilters: () => void;
}

export function EmailLogsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  campaignFilter,
  onCampaignChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  campaigns,
  onClearFilters,
}: EmailLogsFiltersProps) {
  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || campaignFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Icono y texto "Filtros" muy sutil */}
      <div className="flex items-center gap-1 pr-1 border-r border-border/50 mr-1">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-semibold text-[11px] text-muted-foreground">
          Filtros
        </span>
      </div>

      {/* Búsqueda */}
      <div className="relative w-full sm:w-64 md:w-72">
        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar por destinatario o asunto..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {/* Estado */}
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="h-8 text-xs w-32">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="SENT">Exitoso</SelectItem>
          <SelectItem value="ERROR">Fallido</SelectItem>
        </SelectContent>
      </Select>

      {/* Campaña */}
      <Select value={campaignFilter} onValueChange={onCampaignChange}>
        <SelectTrigger className="h-8 text-xs w-40">
          <SelectValue placeholder="Campaña" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign} value={campaign}>
              {campaign}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Fechas */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-8 text-xs px-2 w-[96px]",
                !dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {dateFrom ? format(dateFrom, "dd/MM", { locale: es }) : "Desde"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={onDateFromChange} initialFocus />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-8 text-xs px-2 w-[96px]",
                !dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {dateTo ? format(dateTo, "dd/MM", { locale: es }) : "Hasta"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={onDateToChange} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      {/* Limpiar */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 text-[11px] ml-auto"
        >
          <X className="h-3 w-3 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
