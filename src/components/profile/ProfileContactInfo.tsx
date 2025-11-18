import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { UserProfile } from "@/types/userProfile";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export function ProfileContactInfo({ profile, updateProfile }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(profile);

  const handleSave = () => {
    updateProfile(localData);
    setIsEditing(false);
    toast.success("Información de contacto actualizada");
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
          <h2 className="text-2xl font-semibold">Datos de Contacto</h2>
          <p className="text-sm text-muted-foreground mt-1">Dirección y contactos alternativos</p>
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
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        )}
      </div>

      {/* Address */}
      <Card className="p-4 border-border/40 space-y-4">
        <h3 className="font-medium text-lg mb-4">Dirección</h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="street">Dirección/Calle</Label>
            <Input
              id="street"
              value={localData.street || ""}
              onChange={(e) => setLocalData({ ...localData, street: e.target.value })}
              disabled={!isEditing}
              placeholder="Calle 123 #45-67"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={localData.city || ""}
                onChange={(e) => setLocalData({ ...localData, city: e.target.value })}
                disabled={!isEditing}
                placeholder="Bogotá"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Departamento/Estado</Label>
              <Input
                id="state"
                value={localData.state || ""}
                onChange={(e) => setLocalData({ ...localData, state: e.target.value })}
                disabled={!isEditing}
                placeholder="Cundinamarca"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input
                id="postalCode"
                value={localData.postalCode || ""}
                onChange={(e) => setLocalData({ ...localData, postalCode: e.target.value })}
                disabled={!isEditing}
                placeholder="110111"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={localData.country || ""}
                onChange={(e) => setLocalData({ ...localData, country: e.target.value })}
                disabled={!isEditing}
                placeholder="Colombia"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Alternative Contacts */}
      <Card className="p-4 border-border/40 space-y-4">
        <h3 className="font-medium text-lg mb-4">Contactos Alternativos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="landline">Teléfono Fijo</Label>
            <Input
              id="landline"
              value={localData.landline || ""}
              onChange={(e) => setLocalData({ ...localData, landline: e.target.value })}
              disabled={!isEditing}
              placeholder="+57 1 234 5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternativeEmail">Correo Alternativo</Label>
            <Input
              id="alternativeEmail"
              type="email"
              value={localData.alternativeEmail || ""}
              onChange={(e) => setLocalData({ ...localData, alternativeEmail: e.target.value })}
              disabled={!isEditing}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
