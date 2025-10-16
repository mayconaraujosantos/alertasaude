import { useTheme } from './useTheme';

export function useSystemTheme() {
  const { currentTheme, isDark, themeMode, setTheme, getThemeDisplayName } =
    useTheme();
  const colorScheme = currentTheme;

  // Cores dinâmicas baseadas no tema do sistema
  const colors = {
    // Backgrounds
    background: isDark ? '#0f172a' : '#f9fafb', // slate-900/gray-50 - Fundo principal mais escuro
    surface: isDark ? '#1e293b' : '#ffffff', // slate-800/white - Superfícies com melhor contraste
    card: isDark ? '#334155' : '#ffffff', // slate-700/white - Cards com cor mais clara para destacar

    // Textos
    text: {
      primary: isDark ? '#ffffff' : '#111827', // white/gray-900 - Texto principal mais brilhante no escuro
      secondary: isDark ? '#e5e7eb' : '#6b7280', // gray-200/gray-500 - Texto secundário mais visível
      muted: isDark ? '#d1d5db' : '#9ca3af', // gray-300/gray-400 - Texto menos importante mais legível
    },

    // Bordas
    border: isDark ? '#475569' : '#e5e7eb', // slate-600/gray-200 - Bordas mais visíveis no escuro

    // Status colors
    primary: '#f97316', // orange-500
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500

    // Gradients for UserHeader
    headerGradient: isDark
      ? (['#1e293b', '#334155'] as const) // slate-800 to slate-700 - Gradiente mais elegante
      : (['#f97316', '#ea580c'] as const), // orange-500 to orange-600
  };

  const styles = {
    // Container styles
    container: {
      backgroundColor: colors.background,
    },

    surface: {
      backgroundColor: colors.surface,
    },

    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },

    // Text styles
    textPrimary: {
      color: colors.text.primary,
    },

    textSecondary: {
      color: colors.text.secondary,
    },

    textMuted: {
      color: colors.text.muted,
    },

    // Button styles
    button: {
      backgroundColor: colors.primary,
    },

    buttonSecondary: {
      backgroundColor: isDark ? '#374151' : '#f3f4f6',
      borderColor: colors.border,
    },
  };

  return {
    isDark,
    colorScheme,
    colors,
    styles,
    themeMode,
    setTheme,
    getThemeDisplayName,
  };
}
