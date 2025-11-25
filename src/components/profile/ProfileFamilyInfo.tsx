import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/types/userProfile";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { userProfileApiClient } from "@/utils/userProfileApiClient";

interface Props {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export function ProfileFamilyInfo({ profile, updateProfile }: Props) {
  const navigate = useNavigate();
  const [localData, setLocalData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const { getAccessToken } = useAuth();

  const hasChanges = useMemo(() => {
    return JSON.stringify(localData) !== JSON.stringify(profile);
  }, [localData, profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');

      await userProfileApiClient.updateFamily(token.accessToken, {
        emergencyContacts: localData.emergencyContact ? [{
          fullName: localData.emergencyContact.name,
          relationship: localData.emergencyContact.relationship,
          phone: localData.emergencyContact.phone,
        }] : [],
        importantDates: (localData.importantDates || []).map(date => ({
          name: date.name,
          date: date.date,
          type: date.type,
        })),
      });

      updateProfile(localData);
      toast.success("Información familiar actualizada");
    } catch (error) {
      console.error('Error saving family info:', error);
      toast.error('Error al guardar la información');
    } finally {
      setIsSaving(false);
    }
  };

  const addImportantDate = () => {
    const newDate = {
      id: Date.now().toString(),
      name: "",
      date: "",
      type: "birthday" as const,
    };
    setLocalData({
      ...localData,
      importantDates: [...(localData.importantDates || []), newDate],
    });
  };

  const removeImportantDate = (id: string) => {
    setLocalData({
      ...localData,
      importantDates: localData.importantDates?.filter((d) => d.id !== id),
    });
  };

  const updateImportantDate = (id: string, field: string, value: string) => {
    setLocalData({
      ...localData,
      importantDates: localData.importantDates?.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Basic Family Info */}
      <Card className="p-4 border-border/40 space-y-4">
        <h3 className="font-medium text-lg mb-4">Datos Básicos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Estado Civil</Label>
            <Select
              value={localData.maritalStatus || ""}
              onValueChange={(value: any) => setLocalData({ ...localData, maritalStatus: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu estado civil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Soltero/a</SelectItem>
                <SelectItem value="married">Casado/a</SelectItem>
                <SelectItem value="divorced">Divorciado/a</SelectItem>
                <SelectItem value="widowed">Viudo/a</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfChildren">Número de Hijos</Label>
            <Input
              id="numberOfChildren"
              type="number"
              min="0"
              value={localData.numberOfChildren || ""}
              onChange={(e) => setLocalData({ ...localData, numberOfChildren: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card className="p-4 border-border/40 space-y-4">
        <h3 className="font-medium text-lg mb-4">Contacto de Emergencia</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyName">Nombre Completo</Label>
            <Input
              id="emergencyName"
              value={localData.emergencyContact?.name || ""}
              onChange={(e) =>
                setLocalData({
                  ...localData,
                  emergencyContact: {
                    ...localData.emergencyContact,
                    name: e.target.value,
                    relationship: localData.emergencyContact?.relationship || "",
                    phone: localData.emergencyContact?.phone || "",
                  },
                })
              }
              placeholder="Nombre del contacto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyRelationship">Parentesco</Label>
            <Input
              id="emergencyRelationship"
              value={localData.emergencyContact?.relationship || ""}
              onChange={(e) =>
                setLocalData({
                  ...localData,
                  emergencyContact: {
                    ...localData.emergencyContact,
                    relationship: e.target.value,
                    name: localData.emergencyContact?.name || "",
                    phone: localData.emergencyContact?.phone || "",
                  },
                })
              }
              placeholder="Ej: Esposo/a, Padre/Madre"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Teléfono</Label>
            <Input
              id="emergencyPhone"
              value={localData.emergencyContact?.phone || ""}
              onChange={(e) =>
                setLocalData({
                  ...localData,
                  emergencyContact: {
                    ...localData.emergencyContact,
                    phone: e.target.value,
                    name: localData.emergencyContact?.name || "",
                    relationship: localData.emergencyContact?.relationship || "",
                  },
                })
              }
              placeholder="+57 300 123 4567"
            />
          </div>
        </div>
      </Card>

      {/* Important Dates */}
      <Card className="p-4 border-border/40 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-lg">Fechas Importantes</h3>
            <p className="text-sm text-muted-foreground">Cumpleaños, aniversarios, etc.</p>
          </div>
          <Button onClick={addImportantDate} size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Fecha
          </Button>
        </div>

        <div className="space-y-3">
          {localData.importantDates?.map((date) => (
            <div key={date.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
              <Input
                value={date.name}
                onChange={(e) => updateImportantDate(date.id, "name", e.target.value)}
                placeholder="Nombre"
              />
              <Input
                type="date"
                value={date.date}
                onChange={(e) => updateImportantDate(date.id, "date", e.target.value)}
              />
              <Select
                value={date.type}
                onValueChange={(value) => updateImportantDate(date.id, "type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Cumpleaños</SelectItem>
                  <SelectItem value="anniversary">Aniversario</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => removeImportantDate(date.id)} size="sm" variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(!localData.importantDates || localData.importantDates.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay fechas importantes registradas</p>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate('/perfil')}
        >
          Regresar
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
