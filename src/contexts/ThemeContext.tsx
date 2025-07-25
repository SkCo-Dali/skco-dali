
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light'); // Cambiar default a 'light'
  const [isDark, setIsDark] = useState(false);

  // Función para obtener si el sistema prefiere modo oscuro
  const getSystemPreference = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Función para calcular si debe estar oscuro basado en el modo
  const calculateIsDark = (mode: ThemeMode) => {
    switch (mode) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'system':
        return getSystemPreference();
      default:
        return false;
    }
  };

  useEffect(() => {
    // Cargar preferencias guardadas
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      setThemeMode(savedMode);
    } else {
      // Default a modo claro en lugar de system
      setThemeMode('light');
    }
  }, []);

  useEffect(() => {
    // Actualizar isDark cuando cambie el modo
    const newIsDark = calculateIsDark(themeMode);
    setIsDark(newIsDark);
    
    // Aplicar tema inmediatamente
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    // Escuchar cambios en las preferencias del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (themeMode === 'system') {
        const newIsDark = getSystemPreference();
        setIsDark(newIsDark);
        
        // Aplicar tema inmediatamente
        if (newIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode]);

  useEffect(() => {
    // Guardar preferencias
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']; // Reordenar para empezar con light
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeMode(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
