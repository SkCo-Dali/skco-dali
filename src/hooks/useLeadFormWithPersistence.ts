import { useState, useCallback, useEffect } from 'react';
import { useFormPersistence } from './useFormPersistence';
import { SessionRestorationModal } from '@/components/SessionRestorationModal';

interface LeadFormData {
  nombre?: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  comentarios?: string;
  estado?: string;
  [key: string]: any;
}

/**
 * Hook ejemplo que muestra cómo usar la persistencia de formularios
 * para la edición de leads
 */
export const useLeadFormWithPersistence = (leadId?: string) => {
  const [formData, setFormData] = useState<LeadFormData>({});
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [hasRestoredData, setHasRestoredData] = useState(false);
  
  const formKey = leadId ? `lead_edit_${leadId}` : 'lead_create';

  const handleRestoreData = useCallback((restoredData: LeadFormData) => {
    if (!hasRestoredData && Object.keys(restoredData).length > 0) {
      setShowRestoreModal(true);
    }
  }, [hasRestoredData]);

  const {
    saveToStorage,
    restoreFromStorage,
    clearBackup,
    hasBackup,
    manualSave
  } = useFormPersistence({
    key: formKey,
    data: formData,
    enabled: true,
    autoSaveInterval: 30000, // 30 segundos
    onRestore: handleRestoreData
  });

  // Verificar backup al inicializar
  useEffect(() => {
    if (hasBackup() && !hasRestoredData) {
      const restoredData = restoreFromStorage();
      if (restoredData && Object.keys(restoredData).length > 0) {
        handleRestoreData(restoredData);
      }
    }
  }, [hasBackup, restoreFromStorage, handleRestoreData, hasRestoredData]);

  const updateFormData = useCallback((updates: Partial<LeadFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleRestore = useCallback(() => {
    const restoredData = restoreFromStorage();
    if (restoredData) {
      setFormData(restoredData);
      setHasRestoredData(true);
    }
    setShowRestoreModal(false);
  }, [restoreFromStorage]);

  const handleDiscardRestore = useCallback(() => {
    clearBackup();
    setHasRestoredData(true);
    setShowRestoreModal(false);
  }, [clearBackup]);

  const handleSuccessfulSave = useCallback(() => {
    // Limpiar backup después de guardar exitosamente
    clearBackup();
    setHasRestoredData(false);
  }, [clearBackup]);

  const resetForm = useCallback(() => {
    setFormData({});
    clearBackup();
    setHasRestoredData(false);
  }, [clearBackup]);

  return {
    formData,
    updateFormData,
    showRestoreModal,
    handleRestore,
    handleDiscardRestore,
    handleSuccessfulSave,
    resetForm,
    manualSave,
    hasUnsavedChanges: hasBackup() && !hasRestoredData
  };
};