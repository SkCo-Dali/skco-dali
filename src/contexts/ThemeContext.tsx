
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
  // TEMPORALMENTE FORZAR LIGHT MODE - deshabilitar dark mode
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Forzar siempre light mode
    setIsDark(false);
    document.documentElement.classList.remove('dark');
    
    // Guardar en localStorage que siempre sea light
    localStorage.setItem('themeMode', 'light');
  }, []);

  // Funciones deshabilitadas temporalmente pero mantenidas para compatibilidad
  const toggleTheme = () => {
    // No hacer nada - dark mode deshabilitado
    console.log('Dark mode está temporalmente deshabilitado');
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
