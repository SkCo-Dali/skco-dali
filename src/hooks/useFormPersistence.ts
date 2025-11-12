import { useEffect, useRef, useCallback } from 'react';

interface FormPersistenceOptions {
  key: string;
  data: any;
  enabled?: boolean;
  autoSaveInterval?: number; // en milisegundos
  onRestore?: (data: any) => void;
}

export const useFormPersistence = ({
  key,
  data,
  enabled = true,
  autoSaveInterval = 30000, // 30 segundos por defecto
  onRestore
}: FormPersistenceOptions) => {
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  const saveToStorage = useCallback((dataToSave: any) => {
    if (!enabled) return;

    try {
      const serializedData = JSON.stringify(dataToSave);
      
      // Solo guardar si los datos han cambiado
      if (serializedData === lastSavedDataRef.current) return;
      
      const storageData = {
        data: dataToSave,
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorage.setItem(`form_backup_${key}`, JSON.stringify(storageData));
      lastSavedDataRef.current = serializedData;
      
      console.log(`💾 FormPersistence: Datos guardados automáticamente para ${key}`);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [key, enabled]);

  const restoreFromStorage = useCallback(() => {
    if (!enabled) return null;

    try {
      const saved = localStorage.getItem(`form_backup_${key}`);
      if (!saved) return null;

      const parsedData = JSON.parse(saved);
      
      // Verificar que los datos no sean muy antiguos (más de 24 horas)
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      if (Date.now() - parsedData.timestamp > maxAge) {
        clearBackup();
        return null;
      }

      console.log(`🔄 FormPersistence: Datos restaurados para ${key}`);
      return parsedData.data;
    } catch (error) {
      console.error('Error restoring form data:', error);
      return null;
    }
  }, [key, enabled]);

  const clearBackup = useCallback(() => {
    try {
      localStorage.removeItem(`form_backup_${key}`);
      lastSavedDataRef.current = '';
      console.log(`🗑️ FormPersistence: Backup eliminado para ${key}`);
    } catch (error) {
      console.error('Error clearing backup:', error);
    }
  }, [key]);

  const hasBackup = useCallback(() => {
    try {
      const saved = localStorage.getItem(`form_backup_${key}`);
      return saved !== null;
    } catch {
      return false;
    }
  }, [key]);

  // Auto-guardar cuando cambian los datos
  useEffect(() => {
    if (!enabled || !data) return;

    // Cancelar timeout anterior
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Programar nuevo auto-guardado
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToStorage(data);
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [data, enabled, autoSaveInterval, saveToStorage]);

  // Restaurar datos al inicializar si hay callback
  useEffect(() => {
    if (enabled && onRestore) {
      const restoredData = restoreFromStorage();
      if (restoredData) {
        onRestore(restoredData);
      }
    }
  }, [enabled, onRestore, restoreFromStorage]);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveToStorage,
    restoreFromStorage,
    clearBackup,
    hasBackup,
    manualSave: () => saveToStorage(data)
  };
};