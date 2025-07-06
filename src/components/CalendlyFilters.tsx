
import React from 'react';
import { CalendlyEventType, type CalendlyFilters } from '@/types/calendly';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar, Clock, Key } from 'lucide-react';

interface CalendlyFiltersProps {
  eventTypes: CalendlyEventType[];
  filters: CalendlyFilters;
  onFiltersChange: (filters: CalendlyFilters) => void;
  accessToken: string;
  onAccessTokenChange: (token: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function CalendlyFilters({ 
  eventTypes, 
  filters, 
  onFiltersChange, 
  accessToken,
  onAccessTokenChange,
  onRefresh,
  loading 
}: CalendlyFiltersProps) {
  
  const handleEventTypeToggle = (eventTypeUri: string) => {
    const updated = filters.selectedEventTypes.includes(eventTypeUri)
      ? filters.selectedEventTypes.filter(uri => uri !== eventTypeUri)
      : [...filters.selectedEventTypes, eventTypeUri];
    
    onFiltersChange({
      ...filters,
      selectedEventTypes: updated
    });
  };

  const handleStatusChange = (status: 'active' | 'canceled' | 'all') => {
    onFiltersChange({
      ...filters,
      status
    });
  };

  return (
    <div className="space-y-4">
      {/* Configuración de Token */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Key className="h-4 w-4" />
            Configuración de Calendly
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Token de acceso de Calendly"
              value={accessToken}
              onChange={(e) => onAccessTokenChange(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={onRefresh} 
              disabled={loading || !accessToken}
              size="sm"
            >
              {loading ? 'Cargando...' : 'Conectar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Obtén tu token en: Calendly → Account Settings → Developer Tools → Personal Access Tokens
          </p>
        </CardContent>
      </Card>

      {/* Filtros de Estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Estado de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['all', 'active', 'canceled'] as const).map((status) => (
              <Button
                key={status}
                variant={filters.status === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(status)}
              >
                {status === 'all' ? 'Todos' : status === 'active' ? 'Activos' : 'Cancelados'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros de Tipos de Evento */}
      {eventTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Tipos de Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {eventTypes.map((eventType) => (
                <div key={eventType.uri} className="flex items-center space-x-2">
                  <Checkbox
                    id={eventType.uri}
                    checked={filters.selectedEventTypes.includes(eventType.uri)}
                    onCheckedChange={() => handleEventTypeToggle(eventType.uri)}
                  />
                  <label 
                    htmlFor={eventType.uri}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: eventType.color || '#3b82f6' }}
                    />
                    {eventType.name}
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {eventType.duration}min
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de Filtros Activos */}
      {(filters.selectedEventTypes.length > 0 || filters.status !== 'all') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filtros Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.status !== 'all' && (
                <Badge variant="outline">
                  Estado: {filters.status === 'active' ? 'Activos' : 'Cancelados'}
                </Badge>
              )}
              {filters.selectedEventTypes.length > 0 && (
                <Badge variant="outline">
                  {filters.selectedEventTypes.length} tipo(s) seleccionado(s)
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
