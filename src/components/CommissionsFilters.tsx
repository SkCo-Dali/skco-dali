import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { CommissionFiltersResponse } from '@/utils/commissionsApiClient';

interface CommissionsFiltersProps {
  // Valores actuales
  periodFrom?: number;
  periodTo?: number;
  producto: string;
  plan: string;
  contrato: string;
  nit: string;
  idAgente: string;
  idSociedad: string;

  // Setters
  setPeriodFrom: (value: number | undefined) => void;
  setPeriodTo: (value: number | undefined) => void;
  setProducto: (value: string) => void;
  setPlan: (value: string) => void;
  setContrato: (value: string) => void;
  setNit: (value: string) => void;
  setIdAgente: (value: string) => void;
  setIdSociedad: (value: string) => void;

  // Opciones disponibles
  filters: CommissionFiltersResponse | null;

  // Visibilidad según rol
  canViewGlobalFilters: boolean;
  isSocio: boolean;
}

export const CommissionsFilters: React.FC<CommissionsFiltersProps> = ({
  periodFrom,
  periodTo,
  producto,
  plan,
  contrato,
  nit,
  idAgente,
  idSociedad,
  setPeriodFrom,
  setPeriodTo,
  setProducto,
  setPlan,
  setContrato,
  setNit,
  setIdAgente,
  setIdSociedad,
  filters,
  canViewGlobalFilters,
  isSocio,
}) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Periodo Desde */}
        <div className="space-y-2">
          <Label htmlFor="periodFrom">Periodo desde</Label>
          <Select
            value={periodFrom?.toString() || ''}
            onValueChange={(value) => setPeriodFrom(value ? parseInt(value) : undefined)}
          >
            <SelectTrigger id="periodFrom">
              <SelectValue placeholder="Todos los periodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {filters?.periods.map((period) => (
                <SelectItem key={period} value={period.toString()}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Periodo Hasta */}
        <div className="space-y-2">
          <Label htmlFor="periodTo">Periodo hasta</Label>
          <Select
            value={periodTo?.toString() || ''}
            onValueChange={(value) => setPeriodTo(value ? parseInt(value) : undefined)}
          >
            <SelectTrigger id="periodTo">
              <SelectValue placeholder="Todos los periodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {filters?.periods.map((period) => (
                <SelectItem key={period} value={period.toString()}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Producto */}
        <div className="space-y-2">
          <Label htmlFor="producto">Producto</Label>
          <Select value={producto} onValueChange={setProducto}>
            <SelectTrigger id="producto">
              <SelectValue placeholder="Todos los productos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {filters?.products.map((prod) => (
                <SelectItem key={prod} value={prod}>
                  {prod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plan */}
        <div className="space-y-2">
          <Label htmlFor="plan">Plan</Label>
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger id="plan">
              <SelectValue placeholder="Todos los planes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {filters?.plans.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contrato */}
        <div className="space-y-2">
          <Label htmlFor="contrato">Contrato</Label>
          <Input
            id="contrato"
            type="text"
            placeholder="Buscar por contrato..."
            value={contrato}
            onChange={(e) => setContrato(e.target.value)}
          />
        </div>

        {/* NIT */}
        <div className="space-y-2">
          <Label htmlFor="nit">NIT</Label>
          <Input
            id="nit"
            type="text"
            placeholder="Buscar por NIT..."
            value={nit}
            onChange={(e) => setNit(e.target.value)}
          />
        </div>

        {/* IdAgente - Solo visible para roles permitidos */}
        {canViewGlobalFilters && (
          <div className="space-y-2">
            <Label htmlFor="idAgente">ID Agente</Label>
            <Select value={idAgente} onValueChange={setIdAgente}>
              <SelectTrigger id="idAgente">
                <SelectValue placeholder="Todos los agentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {filters?.agents.map((agent) => (
                  <SelectItem key={agent} value={agent}>
                    {agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* IdSociedad - Visible para roles permitidos o prellenado para socio */}
        {canViewGlobalFilters && (
          <div className="space-y-2">
            <Label htmlFor="idSociedad">ID Sociedad</Label>
            <Select value={idSociedad} onValueChange={setIdSociedad}>
              <SelectTrigger id="idSociedad">
                <SelectValue placeholder="Todas las sociedades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {filters?.societies.map((society) => (
                  <SelectItem key={society} value={society}>
                    {society}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isSocio && !canViewGlobalFilters && (
          <div className="space-y-2">
            <Label htmlFor="idSociedad">ID Sociedad</Label>
            <Input id="idSociedad" type="text" value={idSociedad} disabled className="bg-muted" />
          </div>
        )}
      </div>
    </Card>
  );
};
