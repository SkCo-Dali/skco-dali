import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/types/userProfile";
import { Save, X, Home } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { userProfileApiClient } from "@/utils/userProfileApiClient";

interface Props {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const availableRoutes = [
  { value: "/home", label: "Dashboard", description: "Vista general de tu actividad" },
  { value: "/leads", label: "Leads", description: "Gestión de prospectos" },
  { value: "/opportunities", label: "Oportunidades", description: "Oportunidades de venta" },
  { value: "/tasks", label: "Tareas", description: "Gestión de tareas" },
  { value: "/comisiones", label: "Comisiones", description: "Seguimiento de comisiones" },
  { value: "/informes", label: "Informes", description: "Reportes y análisis" },
  { value: "/chat-dali", label: "Chat con Dali", description: "Asistente virtual" },
];

export function ProfileAppPreferences({ profile, updateProfile }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const { getAccessToken } = useAuth();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');

      const selectedRoute = availableRoutes.find(r => r.value === localData.customHomepage);
      
      await userProfileApiClient.updatePreferences(token.accessToken, {
        primaryActionCode: selectedRoute?.label || null,
        primaryActionRoute: localData.customHomepage || null,
        emailSignatureHtml: localData.emailSignature || null,
        quietHoursFrom: localData.notificationPreferences?.quietHours?.start || null,
        quietHoursTo: localData.notificationPreferences?.quietHours?.end || null,
      });

      updateProfile(localData);
      setIsEditing(false);
      toast.success("Preferencias de aplicación actualizadas");
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar las preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(profile);
    setIsEditing(false);
  };

  // Filter routes based on user role if needed
  const filteredRoutes = availableRoutes;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Preferencias de Aplicación</h2>
          <p className="text-sm text-muted-foreground mt-1">Personaliza tu experiencia en Dali</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        )}
      </div>

      {/* Homepage Selection */}
      <Card className="p-4 border-border/40 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <Home className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-medium text-lg">Página de Inicio</h3>
              <p className="text-sm text-muted-foreground">Selecciona la página que verás al iniciar sesión</p>
            </div>
          </div>

          <Label htmlFor="customHomepage">Tu página de inicio</Label>
          <Select
            value={localData.customHomepage || localData.primaryAction?.route || "/home"}
            onValueChange={(value) => setLocalData({ ...localData, customHomepage: value })}
            disabled={!isEditing}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una página" />
            </SelectTrigger>
            <SelectContent>
              {filteredRoutes.map((route) => (
                <SelectItem key={route.value} value={route.value}>
                  <div className="flex flex-col items-start py-1">
                    <span className="font-medium">{route.label}</span>
                    <span className="text-xs text-muted-foreground">{route.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Preview */}
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/40">
            <p className="text-sm font-medium mb-2">Vista previa:</p>
            <p className="text-sm text-muted-foreground">
              Al iniciar sesión, serás dirigido a{" "}
              <span className="font-medium text-foreground">
                {
                  filteredRoutes.find(
                    (r) => r.value === (localData.customHomepage || localData.primaryAction?.route || "/home"),
                  )?.label
                }
              </span>
            </p>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 border-border/40 bg-muted/20">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">💡 Tip</h4>
          <p className="text-sm text-muted-foreground">
            Puedes cambiar tu página de inicio en cualquier momento desde aquí. Esta preferencia se sincroniza con tu
            configuración de onboarding.
          </p>
        </div>
      </Card>
    </div>
  );
}
