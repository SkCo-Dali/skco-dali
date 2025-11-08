import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, notificationCategories } from '@/types/userProfile';
import { Save, X, Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface Props {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export function ProfileNotifications({ profile, updateProfile }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(profile);

  const handleSave = () => {
    updateProfile(localData);
    setIsEditing(false);
    toast.success('Preferencias de notificaciones actualizadas');
  };

  const handleCancel = () => {
    setLocalData(profile);
    setIsEditing(false);
  };

  const toggleCategory = (category: string, enabled: boolean) => {
    const currentPref = localData.notificationPreferences?.[category as keyof typeof localData.notificationPreferences];
    const channels = (currentPref && 'channels' in currentPref) ? currentPref.channels : ['inapp'];
    const frequency = (currentPref && 'frequency' in currentPref) ? currentPref.frequency : 'immediate';
    
    setLocalData({
      ...localData,
      notificationPreferences: {
        ...localData.notificationPreferences,
        [category]: {
          enabled,
          channels,
          frequency,
        },
      },
    });
  };

  const toggleChannel = (category: string, channel: 'whatsapp' | 'email' | 'inapp') => {
    const current = localData.notificationPreferences?.[category as keyof typeof localData.notificationPreferences];
    if (!current || !('channels' in current)) return;

    const channels = current.channels.includes(channel)
      ? current.channels.filter(c => c !== channel)
      : [...current.channels, channel];

    setLocalData({
      ...localData,
      notificationPreferences: {
        ...localData.notificationPreferences,
        [category]: {
          ...current,
          channels,
        },
      },
    });
  };

  const setFrequency = (category: string, frequency: 'immediate' | 'daily' | 'weekly') => {
    const current = localData.notificationPreferences?.[category as keyof typeof localData.notificationPreferences];
    if (!current || !('frequency' in current)) return;

    setLocalData({
      ...localData,
      notificationPreferences: {
        ...localData.notificationPreferences,
        [category]: {
          ...current,
          frequency,
        },
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Preferencias de Notificaciones</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configura cómo y cuándo quieres recibir notificaciones
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
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

      {/* Notification Categories */}
      <div className="space-y-4">
        {notificationCategories.map((category) => {
          const prefs = localData.notificationPreferences?.[category.id as keyof typeof localData.notificationPreferences];
          const isEnabled = prefs?.enabled ?? category.defaultEnabled;
          const hasChannels = prefs && 'channels' in prefs;
          const hasFrequency = prefs && 'frequency' in prefs;

          return (
            <Card key={category.id} className="p-6 border-border/40">
              <div className="space-y-4">
                {/* Category Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{category.label}</Label>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => toggleCategory(category.id, checked)}
                    disabled={!isEditing}
                  />
                </div>

                {/* Channel Selection */}
                {isEnabled && hasChannels && (
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <Label className="text-sm font-medium">Canales de notificación</Label>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant={(prefs as any)?.channels?.includes('whatsapp') ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={() => toggleChannel(category.id, 'whatsapp')}
                        disabled={!isEditing}
                      >
                        <Smartphone className="h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Button
                        type="button"
                        variant={(prefs as any)?.channels?.includes('email') ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={() => toggleChannel(category.id, 'email')}
                        disabled={!isEditing}
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={(prefs as any)?.channels?.includes('inapp') ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={() => toggleChannel(category.id, 'inapp')}
                        disabled={!isEditing}
                      >
                        <MessageSquare className="h-4 w-4" />
                        In-app
                      </Button>
                    </div>

                    {/* Frequency Selection */}
                    {hasFrequency && (
                      <div className="space-y-2 pt-2">
                        <Label className="text-sm font-medium">Frecuencia</Label>
                        <Select
                          value={(prefs as any)?.frequency || 'immediate'}
                          onValueChange={(value: any) => setFrequency(category.id, value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Inmediato</SelectItem>
                            <SelectItem value="daily">Resumen diario</SelectItem>
                            <SelectItem value="weekly">Resumen semanal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quiet Hours */}
      <Card className="p-6 border-border/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Horario Silencioso</Label>
            <p className="text-sm text-muted-foreground">
              No recibir notificaciones durante este período
            </p>
          </div>
          <Switch
            checked={localData.notificationPreferences?.quietHours?.enabled || false}
            onCheckedChange={(checked) => setLocalData({
              ...localData,
              notificationPreferences: {
                ...localData.notificationPreferences,
                quietHours: {
                  enabled: checked,
                  start: localData.notificationPreferences?.quietHours?.start || '22:00',
                  end: localData.notificationPreferences?.quietHours?.end || '08:00',
                },
              },
            })}
            disabled={!isEditing}
          />
        </div>

        {localData.notificationPreferences?.quietHours?.enabled && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div className="space-y-2">
              <Label htmlFor="quietStart">Desde</Label>
              <Input
                id="quietStart"
                type="time"
                value={localData.notificationPreferences.quietHours.start}
                onChange={(e) => setLocalData({
                  ...localData,
                  notificationPreferences: {
                    ...localData.notificationPreferences,
                    quietHours: {
                      ...localData.notificationPreferences?.quietHours!,
                      start: e.target.value,
                    },
                  },
                })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quietEnd">Hasta</Label>
              <Input
                id="quietEnd"
                type="time"
                value={localData.notificationPreferences.quietHours.end}
                onChange={(e) => setLocalData({
                  ...localData,
                  notificationPreferences: {
                    ...localData.notificationPreferences,
                    quietHours: {
                      ...localData.notificationPreferences?.quietHours!,
                      end: e.target.value,
                    },
                  },
                })}
                disabled={!isEditing}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
