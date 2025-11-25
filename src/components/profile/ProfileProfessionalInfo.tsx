import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { UserProfile } from "@/types/userProfile";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { userProfileApiClient } from "@/utils/userProfileApiClient";

interface Props {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

export function ProfileProfessionalInfo({ profile, updateProfile, onBack }: Props) {
  const [localData, setLocalData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const { getAccessToken } = useAuth();

  // Sync localData when profile changes (after successful save)
  useEffect(() => {
    setLocalData(profile);
  }, [profile]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(localData) !== JSON.stringify(profile);
  }, [localData, profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No access token");

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
      toast.success("✓ Información profesional actualizada correctamente", {
        duration: 4000,
        position: "top-center",
      });
      
      // Re-render will sync localData with updated profile prop via useEffect
    } catch (error) {
      console.error("Error saving professional info:", error);
      toast.error("Error al guardar la información");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-4 border-border/40 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Cargo/Rol</Label>
            <Input
              id="role"
              value={localData.role || ""}
              onChange={(e) => setLocalData({ ...localData, role: e.target.value })}
              placeholder="Ej: Asesor Comercial"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Departamento/Área</Label>
            <Input
              id="department"
              value={localData.department || ""}
              onChange={(e) => setLocalData({ ...localData, department: e.target.value })}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Supervisor/Manager</Label>
            <Input
              id="manager"
              value={localData.manager || ""}
              onChange={(e) => setLocalData({ ...localData, manager: e.target.value })}
              placeholder="Nombre del supervisor"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="specialization">Especialización</Label>
            <Input
              id="specialization"
              value={localData.specialization || ""}
              onChange={(e) => setLocalData({ ...localData, specialization: e.target.value })}
              placeholder="Ej: Seguros de vida, Pensiones"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="monthlyGoals">Objetivos Mensuales</Label>
            <Textarea
              id="monthlyGoals"
              value={localData.monthlyGoals || ""}
              onChange={(e) => setLocalData({ ...localData, monthlyGoals: e.target.value })}
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
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Regresar
        </Button>
        <Button variant="default" className="flex-1" onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
