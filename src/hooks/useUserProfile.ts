import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types/userProfile';
import { useAuth } from '@/contexts/AuthContext';
import { profileApiClient } from '@/utils/profileApiClient';
import { UserProfileResponse } from '@/types/profileApi';
import { toast } from 'sonner';

export function useUserProfile() {
  const { accessToken } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar perfil desde el API
  const loadProfile = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await profileApiClient.getProfile(accessToken);
      setProfile(mapApiProfileToUserProfile(data));
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!accessToken || !profile) return;

    setProfile(prev => prev ? { ...prev, ...updates } : null);

    try {
      // Determinar qué sección actualizar según los campos modificados
      if ('preferredName' in updates || 'birthDate' in updates || 'gender' in updates || 
          'maritalStatus' in updates || 'childrenCount' in updates) {
        await profileApiClient.updateBasicProfile(accessToken, {
          preferredName: updates.preferredName || profile.preferredName || '',
          birthDate: updates.birthDate || profile.birthDate || null,
          gender: updates.gender || profile.gender || null,
          maritalStatus: updates.maritalStatus || profile.maritalStatus || null,
          childrenCount: updates.childrenCount ?? profile.childrenCount ?? 0,
        });
      }

      if ('jobTitle' in updates || 'department' in updates || 'hireDate' in updates ||
          'managerName' in updates || 'specialization' in updates || 'monthlyGoals' in updates ||
          'workdayStart' in updates || 'workdayEnd' in updates) {
        await profileApiClient.updateProfessional(accessToken, {
          jobTitle: updates.jobTitle || profile.jobTitle || null,
          department: updates.department || profile.department || null,
          hireDate: updates.hireDate || profile.hireDate || null,
          managerName: updates.managerName || profile.managerName || null,
          specialization: updates.specialization || profile.specialization || null,
          monthlyGoals: updates.monthlyGoals || profile.monthlyGoals || null,
          workdayStart: updates.workdayStart || profile.workdayStart || null,
          workdayEnd: updates.workdayEnd || profile.workdayEnd || null,
        });
      }

      if ('street' in updates || 'city' in updates || 'state' in updates ||
          'postalCode' in updates || 'country' in updates || 'alternateEmail' in updates ||
          'alternatePhone' in updates) {
        await profileApiClient.updateAddress(accessToken, {
          address: {
            street: updates.street || profile.street || null,
            city: updates.city || profile.city || null,
            state: updates.state || profile.state || null,
            postalCode: updates.postalCode || profile.postalCode || null,
            country: updates.country || profile.country || null,
          },
          alternate: {
            alternateEmail: updates.alternateEmail || profile.alternateEmail || null,
            alternatePhone: updates.alternatePhone || profile.alternatePhone || null,
          },
        });
      }

      toast.success('Perfil actualizado correctamente');
      await loadProfile(); // Recargar perfil completo
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
      await loadProfile(); // Recargar para revertir cambios
    }
  }, [accessToken, profile, loadProfile]);

  return {
    profile,
    isLoading,
    updateProfile,
    refreshProfile: loadProfile,
  };
}

// Función helper para mapear la respuesta del API al tipo UserProfile
function mapApiProfileToUserProfile(data: UserProfileResponse): UserProfile {
  const whatsappChannel = data.contactChannels.find(c => c.channelType === 'WhatsApp');
  const facebookChannel = data.contactChannels.find(c => c.channelType === 'Facebook');
  const instagramChannel = data.contactChannels.find(c => c.channelType === 'Instagram');
  const linkedinChannel = data.contactChannels.find(c => c.channelType === 'LinkedIn');
  const twitterChannel = data.contactChannels.find(c => c.channelType === 'Twitter' || c.channelType === 'X');
  const tiktokChannel = data.contactChannels.find(c => c.channelType === 'TikTok');

  return {
    preferredName: data.basic.preferredName,
    birthDate: data.basic.birthDate || undefined,
    gender: data.basic.gender || undefined,
    maritalStatus: data.basic.maritalStatus || undefined,
    childrenCount: data.basic.childrenCount,
    countryCode: whatsappChannel?.countryCode || undefined,
    phone: whatsappChannel?.channelValue || undefined,
    facebook: facebookChannel?.channelValue || undefined,
    instagram: instagramChannel?.channelValue || undefined,
    linkedin: linkedinChannel?.channelValue || undefined,
    xTwitter: twitterChannel?.channelValue || undefined,
    tiktok: tiktokChannel?.channelValue || undefined,
    jobTitle: data.professional.jobTitle || undefined,
    department: data.professional.department || undefined,
    hireDate: data.professional.hireDate || undefined,
    managerName: data.professional.managerName || undefined,
    specialization: data.professional.specialization || undefined,
    monthlyGoals: data.professional.monthlyGoals || undefined,
    workdayStart: data.professional.workdayStart || undefined,
    workdayEnd: data.professional.workdayEnd || undefined,
    street: data.address.street || undefined,
    city: data.address.city || undefined,
    state: data.address.state || undefined,
    postalCode: data.address.postalCode || undefined,
    country: data.address.country || undefined,
    alternateEmail: data.alternateContact.alternateEmail || undefined,
    alternatePhone: data.alternateContact.alternatePhone || undefined,
    emergencyContactName: data.emergencyContacts[0]?.fullName || undefined,
    emergencyContactRelation: data.emergencyContacts[0]?.relationship || undefined,
    emergencyContactPhone: data.emergencyContacts[0]?.phone || undefined,
    primaryAction: data.appPreferences.primaryActionRoute || undefined,
    emailSignature: data.appPreferences.emailSignatureHtml || undefined,
    singleWish: undefined, // Este campo no viene del API de perfil
  };
}
