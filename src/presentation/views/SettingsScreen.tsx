import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModal } from '../../hooks/useModal';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { DIContainer } from '../../infrastructure/di/DIContainer';

interface SettingsScreenProps {
  readonly navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const { Modal, showError, showSuccess, showConfirm, showAlert } = useModal();
  const {
    colors,
    styles,
    isDark,
    colorScheme,
    themeMode,
    setTheme,
    getThemeDisplayName,
  } = useSystemTheme();

  // Log para debug
  console.log('🎨 [SettingsScreen] Tema atual:', {
    colorScheme,
    isDark,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // TODO: Implement settings loading from storage/database
  };

  const saveSettings = async (setting: string, value: boolean) => {
    try {
      // TODO: Implement settings saving
      console.log(`Saving ${setting}: ${value}`);
    } catch {
      showError('Erro', 'Não foi possível salvar as configurações');
    }
  };

  const handleThemeChange = () => {
    showAlert(
      'Selecionar Tema',
      'Escolha como deseja que o aplicativo apareça:',
      [
        {
          text: 'Automático (Sistema)',
          style: themeMode === 'auto' ? 'primary' : 'default',
          onPress: async () => {
            try {
              await setTheme('auto');
              showSuccess('Tema alterado', 'Tema alterado para Automático');
            } catch {
              showError('Erro', 'Não foi possível alterar o tema');
            }
          },
        },
        {
          text: 'Tema Claro',
          style: themeMode === 'light' ? 'primary' : 'default',
          onPress: async () => {
            try {
              await setTheme('light');
              showSuccess('Tema alterado', 'Tema alterado para Claro');
            } catch {
              showError('Erro', 'Não foi possível alterar o tema');
            }
          },
        },
        {
          text: 'Tema Escuro',
          style: themeMode === 'dark' ? 'primary' : 'default',
          onPress: async () => {
            try {
              await setTheme('dark');
              showSuccess('Tema alterado', 'Tema alterado para Escuro');
            } catch {
              showError('Erro', 'Não foi possível alterar o tema');
            }
          },
        },
      ],
    );
  };
  const handleResetApp = () => {
    showConfirm(
      'Resetar Aplicativo',
      'Esta ação irá apagar todos os dados do aplicativo. Esta ação não pode ser desfeita. Deseja continuar?',
      async () => {
        try {
          const diContainer = DIContainer.getInstance();
          await diContainer.databaseManager.resetDatabase();
          showSuccess('Sucesso', 'Aplicativo resetado com sucesso');
        } catch {
          showError('Erro', 'Não foi possível resetar o aplicativo');
        }
      },
    );
  };

  const renderSettingToggle = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    disabled = false,
  ) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View
          style={{
            padding: 8,
            backgroundColor: colors.border,
            borderRadius: 8,
            marginRight: 12,
          }}
        >
          <Ionicons name={icon} size={20} color={colors.text.secondary} />
        </View>
        <Text style={[styles.textPrimary, { fontWeight: '500' }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const renderActionItem = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    subtitle: string,
    onPress: () => void,
    color?: string,
  ) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View
          style={{
            padding: 8,
            backgroundColor: color ? '#fee2e2' : colors.border,
            borderRadius: 8,
            marginRight: 12,
          }}
        >
          <Ionicons
            name={icon}
            size={20}
            color={color || colors.text.secondary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.textPrimary,
              { fontWeight: '500' },
              color && { color: color },
            ]}
          >
            {label}
          </Text>
          <Text style={[styles.textSecondary, { fontSize: 14, marginTop: 4 }]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[{ flex: 1 }, styles.container]}>
      <View
        style={[
          styles.surface,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8, marginLeft: -8 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={[styles.textPrimary, { fontSize: 18, fontWeight: '600' }]}>
          Configurações
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Debug do tema */}
      <View
        style={[
          styles.surface,
          {
            margin: 16,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.textPrimary, { fontSize: 16, fontWeight: '600' }]}>
          🎨 Tema Debug
        </Text>
        <Text style={[styles.textSecondary, { marginTop: 8 }]}>
          Sistema: {colorScheme} | Dark Mode: {isDark ? 'Sim' : 'Não'}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={[
              styles.textSecondary,
              {
                fontSize: 12,
                fontWeight: '600',
                paddingHorizontal: 16,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              },
            ]}
          >
            Notificações
          </Text>
          <View
            style={[
              styles.surface,
              {
                marginHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            {renderSettingToggle(
              'notifications-outline',
              'Ativar Notificações',
              notificationsEnabled,
              value => {
                setNotificationsEnabled(value);
                saveSettings('notifications', value);
              },
            )}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginHorizontal: 16,
              }}
            />
            {renderSettingToggle(
              'volume-high-outline',
              'Som das Notificações',
              soundEnabled,
              value => {
                setSoundEnabled(value);
                saveSettings('sound', value);
              },
              !notificationsEnabled,
            )}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginHorizontal: 16,
              }}
            />
            {renderSettingToggle(
              'phone-portrait-outline',
              'Vibração',
              vibrationEnabled,
              value => {
                setVibrationEnabled(value);
                saveSettings('vibration', value);
              },
              !notificationsEnabled,
            )}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={[
              styles.textSecondary,
              {
                fontSize: 12,
                fontWeight: '600',
                paddingHorizontal: 16,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              },
            ]}
          >
            Aparência
          </Text>
          <View
            style={[
              styles.surface,
              {
                marginHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            {renderActionItem(
              'color-palette-outline',
              'Tema do Aplicativo',
              `Atual: ${getThemeDisplayName(themeMode)}`,
              handleThemeChange,
            )}
          </View>
        </View>

        {/* Backup Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={[
              styles.textSecondary,
              {
                fontSize: 12,
                fontWeight: '600',
                paddingHorizontal: 16,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              },
            ]}
          >
            Backup e Dados
          </Text>
          <View
            style={[
              styles.surface,
              {
                marginHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            {renderSettingToggle(
              'cloud-upload-outline',
              'Backup Automático',
              autoBackup,
              value => {
                setAutoBackup(value);
                saveSettings('autoBackup', value);
              },
            )}
          </View>
        </View>

        {/* Data and Info Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={[
              styles.textSecondary,
              {
                fontSize: 12,
                fontWeight: '600',
                paddingHorizontal: 16,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              },
            ]}
          >
            Dados e Informações
          </Text>
          <View
            style={[
              styles.surface,
              {
                marginHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            {renderActionItem(
              'download-outline',
              'Exportar Dados',
              'Baixar backup dos seus dados',
              () => {
                showSuccess(
                  'Em Desenvolvimento',
                  'Funcionalidade em desenvolvimento',
                );
              },
            )}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginHorizontal: 16,
              }}
            />
            {renderActionItem(
              'cloud-upload-outline',
              'Importar Dados',
              'Restaurar backup de dados',
              () => {
                showSuccess(
                  'Em Desenvolvimento',
                  'Funcionalidade em desenvolvimento',
                );
              },
            )}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginHorizontal: 16,
              }}
            />
            {renderActionItem(
              'information-circle-outline',
              'Sobre o App',
              'Versão e informações',
              () => {
                navigation.navigate('About');
              },
            )}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginHorizontal: 16,
              }}
            />
            {renderActionItem(
              'help-circle-outline',
              'Ajuda e Suporte',
              'Como usar o aplicativo',
              () => {
                navigation.navigate('Help');
              },
            )}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Text
            style={[
              { color: colors.error },
              {
                fontSize: 12,
                fontWeight: '600',
                paddingHorizontal: 16,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              },
            ]}
          >
            Zona de Perigo
          </Text>
          <View
            style={[
              styles.surface,
              {
                marginHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#fecaca',
              },
            ]}
          >
            {renderActionItem(
              'refresh-outline',
              'Resetar Aplicativo',
              'Apagar todos os dados',
              handleResetApp,
              colors.error,
            )}
          </View>
        </View>
      </ScrollView>

      <Modal />
    </SafeAreaView>
  );
}
