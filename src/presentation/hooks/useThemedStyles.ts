import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, Theme } from '../../shared/ThemeContext';

// Hook para criar estilos com tema
export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  createStyles: (theme: Theme) => T,
): T => {
  const { theme } = useTheme();

  return useMemo(() => createStyles(theme), [theme, createStyles]);
};

// Estilos globais comuns
export const createGlobalStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.dark ? 0.3 : 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: theme.dark ? 1 : 0,
      borderColor: theme.colors.border,
    },
    surface: {
      backgroundColor: theme.colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    text: {
      color: theme.colors.text,
    },
    textSecondary: {
      color: theme.colors.textSecondary,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    primaryButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 16,
    },
    overlay: {
      backgroundColor: theme.colors.overlay,
    },
    modal: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 20,
      margin: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  });

// Hook para estilos globais
export const useGlobalStyles = () => {
  const { theme } = useTheme();
  return useMemo(() => createGlobalStyles(theme), [theme]);
};
