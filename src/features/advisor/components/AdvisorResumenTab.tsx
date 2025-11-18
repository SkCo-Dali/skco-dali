import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  IdCard,
  User,
  MapPin,
  Network,
  TrendingUp,
  Pencil,
  Mail,
  Phone,
  Calendar,
  Building,
  Users,
} from "lucide-react";
import type { Advisor } from "@/core/api/dto";

interface Props {
  advisor: Advisor;
}

export const AdvisorResumenTab = ({ advisor }: Props) => {
  const handleEdit = () => {
    // TODO: Implementar lógica de edición
    console.log("Editar perfil del asesor");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
      {/* Left Side - Basic Info */}
      <div className="col-span-3 space-y-6">
        {/* Avatar and Name */}
        <Card className="bg-[#EDFEFA] rounded-lg">
          <CardContent className="pt-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarFallback className="bg-muted text-3xl font-semibold text-foreground">
                    {advisor.nombre
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleEdit}
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center space-y-2 w-full">
                <h2 className="text-2xl font-bold text-foreground">{advisor.nombre}</h2>
                <p className="text-sm text-muted-foreground">Perfil de asesor</p>
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
                <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
                  {advisor.estado === "activo" ? "Activo" : "Inactivo"}
                </Badge>
                <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
                  {advisor.canal || "Sin canal"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Data Card */}
        <Card className="border-border/40">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Documento */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <IdCard className="h-3.5 w-3.5" />
                  <span>Tipo y número de doc.</span>
                </div>
                <p className="text-sm font-medium text-foreground">CC {advisor.doc}</p>
              </div>

              {/* ID Asesor */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>ID Asesor</span>
                </div>
                <p className="text-sm font-medium text-foreground">{advisor.id}</p>
              </div>

              {/* Región */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Región</span>
                </div>
                <p className="text-sm font-medium text-foreground">{advisor.region}</p>
              </div>

              {/* Zona */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Zona</span>
                </div>
                <p className="text-sm font-medium text-foreground">{advisor.zona}</p>
              </div>

              {/* Jefe */}
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Network className="h-3.5 w-3.5" />
                  <span>Jefe directo</span>
                </div>
                <p className="text-sm font-medium text-foreground">{advisor.jefe || "No asignado"}</p>
              </div>

              {/* Canal */}
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Canal de distribución</span>
                </div>
                <p className="text-sm font-medium text-foreground">{advisor.canal || "No asignado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Detailed Personal Data */}
      <div className="space-y-6">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Datos personales</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              {/* Email */}
              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </div>
                <p className="text-sm font-medium text-foreground">asesor@ejemplo.com</p>
              </div>

              {/* Celular */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>Celular</span>
                </div>
                <p className="text-sm font-medium text-foreground">318 999 8901</p>
              </div>

              {/* Teléfono */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="text-sm font-medium text-foreground">601 234 5678</p>
              </div>

              {/* Género */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Género</p>
                <p className="text-sm font-medium text-foreground">Masculino</p>
              </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Fecha de nacimiento</span>
                </div>
                <p className="text-sm font-medium text-foreground">15/03/1990</p>
              </div>

              {/* Dirección */}
              <div className="space-y-1 md:col-span-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span>Dirección de residencia</span>
                </div>
                <p className="text-sm font-medium text-foreground">Calle 12A # 12 Bis - 24 Apartamento 302</p>
              </div>

              {/* País */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">País de residencia</p>
                <p className="text-sm font-medium text-foreground">Colombia</p>
              </div>

              {/* Departamento */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Departamento</p>
                <p className="text-sm font-medium text-foreground">Cundinamarca</p>
              </div>

              {/* Ciudad */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Ciudad de residencia</span>
                </div>
                <p className="text-sm font-medium text-foreground">Bogotá D.C.</p>
              </div>

              {/* Fecha de vinculación */}
              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Fecha de vinculación</span>
                </div>
                <p className="text-sm font-medium text-foreground">19/08/2024</p>
              </div>

              {/* Personas a cargo */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Personas a cargo</span>
                </div>
                <p className="text-sm font-medium text-foreground">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
