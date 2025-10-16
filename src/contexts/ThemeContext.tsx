import React, { createContext, useContext, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useTheme as useThemeHook } from '../hooks/useTheme';
import type { ThemeMode } from '../hooks/useTheme';

interface ThemeContextType {
  themeMode: ThemeMode;
  currentTheme: 'light' | 'dark' | null | undefined;
  isDark: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  getThemeDisplayName: (mode: ThemeMode) => string;
  systemColorScheme: 'light' | 'dark' | null | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeHook = useThemeHook();
  const { setColorScheme } = useColorScheme();

  // Sincroniza o tema com o NativeWind
  useEffect(() => {
    if (!themeHook.isLoading && themeHook.isInitialized) {
      const newTheme = themeHook.currentTheme || 'light';
      console.log('🎨 [ThemeProvider] Aplicando tema:', newTheme);
      console.log('🎨 [ThemeProvider] Estado completo:', {
        themeMode: themeHook.themeMode,
        systemScheme: themeHook.systemColorScheme,
        finalTheme: newTheme,
      });

      // Aplica o tema usando NativeWind
      setColorScheme(newTheme);

      // Aplica CSS variables globais para forçar o tema
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }

      console.log('🎨 [ThemeProvider] Tema aplicado:', newTheme);
    }
  }, [
    themeHook.currentTheme,
    themeHook.isLoading,
    themeHook.isInitialized,
    setColorScheme,
  ]); // Log inicial
  useEffect(() => {
    console.log('🎨 [ThemeProvider] Inicializando com:', {
      themeMode: themeHook.themeMode,
      currentTheme: themeHook.currentTheme,
      systemTheme: themeHook.systemColorScheme,
      isLoading: themeHook.isLoading,
    });
  }, [themeHook]);

  return (
    <ThemeContext.Provider value={themeHook}>
      <>
        <StatusBar
          barStyle={themeHook.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={themeHook.isDark ? '#1f2937' : '#f9fafb'}
          translucent
        />
        {children}
      </>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
