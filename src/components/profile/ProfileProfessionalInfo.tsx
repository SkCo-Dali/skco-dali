import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { UserProfile } from "@/types/userProfile";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { userProfileApiClient } from "@/utils/userProfileApiClient";

interface Props {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export function ProfileProfessionalInfo({ profile, updateProfile }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const { getAccessToken } = useAuth();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');

      await userProfileApiClient.updateProfessional(token.accessToken, {
        jobTitle: localData.role || null,
        department: localData.department || null,
        hireDate: localData.startDate || null,
        managerName: localData.manager || null,
        specialization: localData.specialization || null,
        monthlyGoals: localData.monthlyGoals || null,
        workdayStart: localData.workSchedule?.start || null,
        workdayEnd: localData.workSchedule?.end || null,
      });

      updateProfile(localData);
      setIsEditing(false);
      toast.success("Información profesional actualizada");
    } catch (error) {
      console.error('Error saving professional info:', error);
      toast.error('Error al guardar la información');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(profile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Información Profesional</h2>
          <p className="text-sm text-muted-foreground mt-1">Datos laborales y objetivos</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
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

      <Card className="p-4 border-border/40 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Cargo/Rol</Label>
            <Input
              id="role"
              value={localData.role || ""}
              onChange={(e) => setLocalData({ ...localData, role: e.target.value })}
              disabled={!isEditing}
              placeholder="Ej: Asesor Comercial"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Departamento/Área</Label>
            <Input
              id="department"
              value={localData.department || ""}
              onChange={(e) => setLocalData({ ...localData, department: e.target.value })}
              disabled={!isEditing}
              placeholder="Ej: Ventas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de Ingreso</Label>
            <Input
              id="startDate"
              type="date"
              value={localData.startDate || ""}
              onChange={(e) => setLocalData({ ...localData, startDate: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Supervisor/Manager</Label>
            <Input
              id="manager"
              value={localData.manager || ""}
              onChange={(e) => setLocalData({ ...localData, manager: e.target.value })}
              disabled={!isEditing}
              placeholder="Nombre del supervisor"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="specialization">Especialización</Label>
            <Input
              id="specialization"
              value={localData.specialization || ""}
              onChange={(e) => setLocalData({ ...localData, specialization: e.target.value })}
              disabled={!isEditing}
              placeholder="Ej: Seguros de vida, Pensiones"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="monthlyGoals">Objetivos Mensuales</Label>
            <Textarea
              id="monthlyGoals"
              value={localData.monthlyGoals || ""}
              onChange={(e) => setLocalData({ ...localData, monthlyGoals: e.target.value })}
              disabled={!isEditing}
              placeholder="Describe tus metas mensuales..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workStart">Horario de Inicio</Label>
            <Input
              id="workStart"
              type="time"
              value={localData.workSchedule?.start || ""}
              onChange={(e) =>
                setLocalData({
                  ...localData,
                  workSchedule: {
                    ...localData.workSchedule,
                    start: e.target.value,
                    end: localData.workSchedule?.end || "",
                  },
                })
              }
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workEnd">Horario de Fin</Label>
            <Input
              id="workEnd"
              type="time"
              value={localData.workSchedule?.end || ""}
              onChange={(e) =>
                setLocalData({
                  ...localData,
                  workSchedule: {
                    ...localData.workSchedule,
                    end: e.target.value,
                    start: localData.workSchedule?.start || "",
                  },
                })
              }
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
