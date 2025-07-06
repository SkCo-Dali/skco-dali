
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { Lead } from "@/types/crm";

interface DashboardChartsProps {
  leads: Lead[];
}

export function DashboardCharts({ leads }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pipeline Chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-[#00c83c]">Pipeline de Ventas</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nuevos</span>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(60, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground min-w-[20px] text-right truncate">
                  {leads.filter(l => l.stage === 'Nuevo').length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Asignados</span>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${Math.min(40, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground min-w-[20px] text-right truncate">
                  {leads.filter(l => l.stage === 'Asignado').length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Prospectos FP</span>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min(50, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground min-w-[20px] text-right truncate">
                  {leads.filter(l => l.stage === 'Localizado: Prospecto de venta FP').length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Prospectos AD</span>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${Math.min(30, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground min-w-[20px] text-right truncate">
                  {leads.filter(l => l.stage === 'Localizado: Prospecto de venta AD').length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fondeados</span>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(25, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground min-w-[20px] text-right truncate">
                  {leads.filter(l => l.stage === 'Registro de Venta (fondeado)').length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-[#00c83c]">Estadísticas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img
      src="https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_grafica_1_n.svg"
      alt="Tasa de Conversión"
      className="h-4 w-4 text-green-500"
      // Si el SVG no respeta el color vía CSS, puedes eliminar `text-green-500`
      // y usar un SVG que ya tenga el color deseado o cambiarlo directamente en el archivo SVG.
    />
                <span className="text-sm font-medium">Tasa de Conversión</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {((leads.filter(l => l.stage === 'Registro de Venta (fondeado)').length / leads.length) * 100).toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">Actividades Hoy</span>
              </div>
              <Badge variant="secondary">
                8
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Meta del Mes</span>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                75%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
