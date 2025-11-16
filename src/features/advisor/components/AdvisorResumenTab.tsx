import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IdCard, User, MapPin, Calendar, TrendingUp, Network } from "lucide-react";
import type { Advisor } from "@/core/api/dto";

interface Props {
  advisor: Advisor;
}

export const AdvisorResumenTab = ({ advisor }: Props) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with Avatar */}
      <div className="flex flex-col items-center space-y-4 pb-6">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-primary">
            <AvatarFallback className="bg-muted text-3xl font-semibold">
              {advisor.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
            <User className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{advisor.nombre}</h2>
          <p className="text-sm text-muted-foreground">Perfil de asesor</p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
            {advisor.estado}
          </Badge>
          <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
            {advisor.canal || "Canal asignado"}
          </Badge>
        </div>
      </div>

      {/* Information Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Documento */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IdCard className="h-4 w-4" />
                <span>Tipo y número de doc.</span>
              </div>
              <p className="text-sm font-medium pl-6">{advisor.doc}</p>
            </div>

            {/* ID */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-4 w-4" />
                <span>ID Asesor</span>
              </div>
              <p className="text-sm font-medium pl-6">{advisor.id}</p>
            </div>

            {/* Región */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Región</span>
              </div>
              <p className="text-sm font-medium pl-6">{advisor.region}</p>
            </div>

            {/* Zona */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Zona</span>
              </div>
              <p className="text-sm font-medium pl-6">{advisor.zona}</p>
            </div>

            {/* Jefe */}
            {advisor.jefe && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Network className="h-4 w-4" />
                  <span>Jefe</span>
                </div>
                <p className="text-sm font-medium pl-6">{advisor.jefe}</p>
              </div>
            )}

            {/* Canal */}
            {advisor.canal && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Canal</span>
                </div>
                <p className="text-sm font-medium pl-6">{advisor.canal}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs Section */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">KPIs de Desempeño</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">$12.5M</p>
              <p className="text-xs text-muted-foreground">Producción</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">32</p>
              <p className="text-xs text-muted-foreground">Negocios</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">28%</p>
              <p className="text-xs text-muted-foreground">Conversión</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">$690K</p>
              <p className="text-xs text-muted-foreground">Ticket Prom.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
