
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AISettings, AppSettings } from '../types/settings';

interface SettingsContextType {
  aiSettings: AISettings;
  appSettings: AppSettings;
  updateAISettings: (settings: Partial<AISettings>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
}

const defaultAISettings: AISettings = {
  model: 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: 'Eres un asistente AI útil y amigable. Responde de manera clara y concisa.'
};

const defaultAppSettings: AppSettings = {
  theme: 'system',
  language: 'es',
  autoSave: true,
  soundEffects: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiSettings, setAISettings] = useState<AISettings>(defaultAISettings);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedAI = localStorage.getItem('ai-chat-ai-settings');
      const savedApp = localStorage.getItem('ai-chat-app-settings');
      
      if (savedAI) {
        setAISettings({ ...defaultAISettings, ...JSON.parse(savedAI) });
      }
      
      if (savedApp) {
        setAppSettings({ ...defaultAppSettings, ...JSON.parse(savedApp) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateAISettings = (newSettings: Partial<AISettings>) => {
    const updated = { ...aiSettings, ...newSettings };
    setAISettings(updated);
    localStorage.setItem('ai-chat-ai-settings', JSON.stringify(updated));
  };

  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...appSettings, ...newSettings };
    setAppSettings(updated);
    localStorage.setItem('ai-chat-app-settings', JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    setAISettings(defaultAISettings);
    setAppSettings(defaultAppSettings);
    localStorage.removeItem('ai-chat-ai-settings');
    localStorage.removeItem('ai-chat-app-settings');
  };

  return (
    <SettingsContext.Provider value={{
      aiSettings,
      appSettings,
      updateAISettings,
      updateAppSettings,
      resetToDefaults
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
