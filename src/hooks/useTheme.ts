import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_STORAGE_KEY = '@medicationalarm_theme_mode';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Determina o tema atual baseado na configuração
  const currentTheme =
    themeMode === 'auto' ? systemColorScheme || 'light' : themeMode;
  const isDark = currentTheme === 'dark';

  // Carrega a configuração salva
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Reage às mudanças do sistema quando está em modo auto
  useEffect(() => {
    if (themeMode === 'auto' && !isLoading) {
      // Força uma atualização quando o sistema muda o tema
      console.log('Sistema mudou para:', systemColorScheme);
    }
  }, [systemColorScheme, themeMode, isLoading]);

  const loadThemeMode = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['auto', 'light', 'dark'].includes(savedTheme)) {
        setThemeMode(savedTheme as ThemeMode);
        console.log('🎨 [useTheme] Tema carregado do storage:', savedTheme);
      } else {
        console.log('🎨 [useTheme] Usando tema automático (padrão do sistema)');
        setThemeMode('auto');
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      setThemeMode('auto'); // fallback para auto
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const getThemeDisplayName = (mode: ThemeMode): string => {
    switch (mode) {
      case 'auto':
        return 'Automático';
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      default:
        return 'Automático';
    }
  };

  return {
    themeMode,
    currentTheme,
    isDark,
    isLoading,
    isInitialized,
    setTheme: saveThemeMode,
    getThemeDisplayName,
    systemColorScheme,
  };
}
