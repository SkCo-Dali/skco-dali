import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Save } from 'lucide-react';
import type { WhatsAppUserInfo } from '@/types/whatsapp';

interface WhatsAppUserInfoProps {
  userInfo: WhatsAppUserInfo;
  onUpdateUserInfo: (userInfo: WhatsAppUserInfo) => Promise<boolean>;
  isLoading?: boolean;
}

export function WhatsAppUserInfo({
  userInfo,
  onUpdateUserInfo,
  isLoading = false
}: WhatsAppUserInfoProps) {
  const [editedInfo, setEditedInfo] = useState<WhatsAppUserInfo>(userInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{ phoneNumber?: string; fullName?: string }>({});

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone) return 'El número es requerido';
    if (!/^\d+$/.test(phone)) return 'Solo se permiten números';
    if (phone.length !== 10) return 'Debe tener exactamente 10 dígitos';
    if (!phone.startsWith('3')) return 'Debe comenzar con el número 3';
    return null;
  };

  const validateFullName = (name: string): string | null => {
    if (!name.trim()) return 'El nombre es requerido';
    if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    return null;
  };

  const handleInputChange = (field: keyof WhatsAppUserInfo, value: string) => {
    setEditedInfo(prev => ({ ...prev, [field]: value }));
    
    // Validación en tiempo real
    const newErrors = { ...errors };
    if (field === 'phoneNumber') {
      const error = validatePhoneNumber(value);
      if (error) {
        newErrors.phoneNumber = error;
      } else {
        delete newErrors.phoneNumber;
      }
    } else if (field === 'fullName') {
      const error = validateFullName(value);
      if (error) {
        newErrors.fullName = error;
      } else {
        delete newErrors.fullName;
      }
    }
    setErrors(newErrors);
  };

  const handleSave = async () => {
    // Validar antes de guardar
    const phoneError = validatePhoneNumber(editedInfo.phoneNumber);
    const nameError = validateFullName(editedInfo.fullName);
    
    if (phoneError || nameError) {
      setErrors({
        phoneNumber: phoneError || undefined,
        fullName: nameError || undefined
      });
      return;
    }

    const success = await onUpdateUserInfo(editedInfo);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedInfo(userInfo);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información del Remitente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            {isEditing ? (
              <div>
                <Input
                  id="fullName"
                  value={editedInfo.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                )}
              </div>
            ) : (
              <p className="text-sm p-2 bg-gray-50 rounded">{userInfo.fullName || 'No especificado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Número de WhatsApp
            </Label>
            {isEditing ? (
              <div>
                <Input
                  id="phoneNumber"
                  value={editedInfo.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="3001234567"
                  maxLength={10}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Debe tener 10 dígitos y comenzar con 3
                </p>
              </div>
            ) : (
              <p className="text-sm p-2 bg-gray-50 rounded">{userInfo.phoneNumber || 'No especificado'}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isLoading || Object.keys(errors).length > 0}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              Editar Información
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
