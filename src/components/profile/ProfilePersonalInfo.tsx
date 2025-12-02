import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/types/userProfile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { userProfileApiClient } from "@/utils/userProfileApiClient";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parse } from "date-fns";
import { CountryPhoneSelector } from "@/components/onboarding/CountryPhoneSelector";
import { normalizarTelefonoColombia, getMotivoDescripcion } from "@/utils/whatsapp-phone";
import { countries } from "@/data/countries";

interface Props {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

export function ProfilePersonalInfo({ profile, updateProfile, onBack }: Props) {
  const [localData, setLocalData] = useState(profile);
  const [socialMediaOpen, setSocialMediaOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const { getAccessToken, updateUserProfile } = useAuth();

  // Sync localData when profile changes (after successful save)
  useEffect(() => {
    setLocalData(profile);
  }, [profile]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(localData) !== JSON.stringify(profile);
  }, [localData, profile]);

  const handleSave = async () => {
    // Validate phone before saving
    if (localData.phone) {
      const phoneWithCountry = `${localData.countryCode || "+57"}${localData.phone}`;
      const validation = normalizarTelefonoColombia(phoneWithCountry);

      if (!validation.ok) {
        setPhoneError(getMotivoDescripcion(validation.motivo || ""));
        toast.error("Por favor corrige el número de WhatsApp");
        return;
      }
      setPhoneError(undefined);
    }

    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No access token");

      // Save basic info
      await userProfileApiClient.updateBasic(token.accessToken, {
        preferredName: localData.preferredName,
        birthDate: localData.birthDate || null,
        gender: localData.gender || null,
        maritalStatus: localData.maritalStatus || null,
        childrenCount: localData.numberOfChildren || 0,
      });

      // Save contact channels
      const channels = [];
      if (localData.phone) {
        channels.push({
          channelType: "WhatsApp" as const,
          countryCode: localData.countryCode || null,
          channelValue: localData.phone,
          isPrimary: true,
          isPublic: true,
          isWhatsAppForMassEmails: true,
        });
      }
      if (localData.facebook) {
        channels.push({
          channelType: "Facebook" as const,
          channelValue: localData.facebook,
          isPrimary: false,
          isPublic: true,
          isWhatsAppForMassEmails: false,
        });
      }
      if (localData.instagram) {
        channels.push({
          channelType: "Instagram" as const,
          channelValue: localData.instagram,
          isPrimary: false,
          isPublic: true,
          isWhatsAppForMassEmails: false,
        });
      }
      if (localData.linkedin) {
        channels.push({
          channelType: "LinkedIn" as const,
          channelValue: localData.linkedin,
          isPrimary: false,
          isPublic: true,
          isWhatsAppForMassEmails: false,
        });
      }
      if (localData.xTwitter) {
        channels.push({
          channelType: "X" as const,
          channelValue: localData.xTwitter,
          isPrimary: false,
          isPublic: true,
          isWhatsAppForMassEmails: false,
        });
      }
      if (localData.tiktok) {
        channels.push({
          channelType: "TikTok" as const,
          channelValue: localData.tiktok,
          isPrimary: false,
          isPublic: true,
          isWhatsAppForMassEmails: false,
        });
      }

      await userProfileApiClient.updateContactChannels(token.accessToken, { channels });

      // Update parent profile state
      updateProfile(localData);

      // IMPORTANT: Update AuthContext user object with new WhatsApp data
      updateUserProfile({
        preferredName: localData.preferredName,
        birthDate: localData.birthDate,
        gender: localData.gender,
        maritalStatus: localData.maritalStatus,
        childrenCount: localData.numberOfChildren,
        whatsappCountryCode: localData.countryCode || null,
        whatsappPhone: localData.phone || null,
      });

      toast.success("✓ Información personal actualizada correctamente");

      // Force re-sync localData with saved values to disable Save button
      // This ensures hasChanges becomes false after successful save
    } catch (error) {
      console.error("Error saving personal info:", error);
      toast.error("Error al guardar la información");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Basic Info */}
      <Card className="p-4 border-border/40 space-y-4">
        <h3 className="font-medium text-lg mb-4">Datos Básicos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preferredName">Nombre Preferido *</Label>
            <Input
              className="text-sm"
              id="preferredName"
              value={localData.preferredName || ""}
              onChange={(e) => setLocalData({ ...localData, preferredName: e.target.value })}
              placeholder="¿Cómo quieres que te llame?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
            <DatePicker
              date={localData.birthDate ? parse(localData.birthDate, "yyyy-MM-dd", new Date()) : undefined}
              onDateChange={(date) =>
                setLocalData({
                  ...localData,
                  birthDate: date ? format(date, "yyyy-MM-dd") : undefined,
                })
              }
              placeholder="dd/MM/yyyy"
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select
              value={localData.gender || ""}
              onValueChange={(value: any) => setLocalData({ ...localData, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Femenino</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefiero no decir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* WhatsApp */}
      <Card className="p-4 border-border/40 space-y-4">
        <h3 className="font-medium text-lg mb-4">WhatsApp *</h3>
        <p className="text-sm text-muted-foreground mb-4">Este número se usará para contactarte y en correos masivos</p>
        <CountryPhoneSelector
          selectedCountryCode={countries.find((c) => c.dialCode === localData.countryCode)?.code || "CO"}
          phone={localData.phone || ""}
          onCountryChange={(countryCode, dialCode) => {
            setLocalData({ ...localData, countryCode: dialCode });
            setPhoneError(undefined);
          }}
          onPhoneChange={(phone) => {
            setLocalData({ ...localData, phone });
            setPhoneError(undefined);
          }}
          error={phoneError}
        />
      </Card>

      {/* Social Media */}
      <Card className="p-4 border-border/40 space-y-4">
        <Collapsible open={socialMediaOpen} onOpenChange={setSocialMediaOpen}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-lg">Redes Sociales</h3>
              <p className="text-sm text-muted-foreground">Opcionales - se usarán en correos masivos</p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                {socialMediaOpen ? "Ocultar" : "Mostrar"}
                <ChevronDown className={`h-4 w-4 transition-transform ${socialMediaOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={localData.facebook || ""}
                  onChange={(e) => setLocalData({ ...localData, facebook: e.target.value })}
                  placeholder="facebook.com/tu-perfil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={localData.instagram || ""}
                  onChange={(e) => setLocalData({ ...localData, instagram: e.target.value })}
                  placeholder="@usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={localData.linkedin || ""}
                  onChange={(e) => setLocalData({ ...localData, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xTwitter">X (Twitter)</Label>
                <Input
                  id="xTwitter"
                  value={localData.xTwitter || ""}
                  onChange={(e) => setLocalData({ ...localData, xTwitter: e.target.value })}
                  placeholder="@usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={localData.tiktok || ""}
                  onChange={(e) => setLocalData({ ...localData, tiktok: e.target.value })}
                  placeholder="@usuario"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
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
