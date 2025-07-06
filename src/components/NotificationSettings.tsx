
import React, { useState } from 'react';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DollarSign, Bell } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { 
    notificationTypes, 
    isLoading, 
    getSettingForType, 
    updateNotificationSetting 
  } = useNotificationSettings();
  
  const [pendingAmounts, setPendingAmounts] = useState<Record<number, string>>({});

  const handleToggleNotification = async (typeId: number, enabled: boolean) => {
    const currentSetting = getSettingForType(typeId);
    await updateNotificationSetting(
      typeId, 
      enabled, 
      currentSetting?.minimum_amount || undefined
    );
  };

  const handleAmountChange = (typeId: number, value: string) => {
    setPendingAmounts(prev => ({
      ...prev,
      [typeId]: value
    }));
  };

  const handleAmountSave = async (typeId: number) => {
    const amount = pendingAmounts[typeId];
    const currentSetting = getSettingForType(typeId);
    
    if (amount && !isNaN(Number(amount))) {
      await updateNotificationSetting(
        typeId, 
        currentSetting?.is_enabled ?? true, 
        Number(amount)
      );
      
      // Clear pending amount
      setPendingAmounts(prev => {
        const newPending = { ...prev };
        delete newPending[typeId];
        return newPending;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Bell className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="text-gray-500">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configuración de Notificaciones</h3>
        <p className="text-sm text-muted-foreground">
          Personaliza qué notificaciones quieres recibir y establece montos mínimos cuando aplique.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        {notificationTypes.map((type) => {
          const userSetting = getSettingForType(type.id);
          const isEnabled = userSetting?.is_enabled ?? true;
          const currentAmount = userSetting?.minimum_amount || 0;
          const pendingAmount = pendingAmounts[type.id];

          return (
            <Card key={type.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{type.name}</CardTitle>
                    {type.description && (
                      <CardDescription className="mt-1">
                        {type.description}
                      </CardDescription>
                    )}
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggleNotification(type.id, checked)}
                  />
                </div>
              </CardHeader>

              {type.has_amount_threshold && isEnabled && (
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label htmlFor={`amount-${type.id}`} className="text-sm">
                        Monto mínimo para notificar
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          id={`amount-${type.id}`}
                          type="number"
                          placeholder="0.00"
                          value={pendingAmount !== undefined ? pendingAmount : currentAmount}
                          onChange={(e) => handleAmountChange(type.id, e.target.value)}
                          className="w-32"
                        />
                        {pendingAmount !== undefined && (
                          <Button 
                            size="sm" 
                            onClick={() => handleAmountSave(type.id)}
                            disabled={!pendingAmount || isNaN(Number(pendingAmount))}
                          >
                            Guardar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
