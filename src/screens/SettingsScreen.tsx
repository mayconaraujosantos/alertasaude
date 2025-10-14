import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModal } from '../hooks/useModal';

interface SettingsScreenProps {
  readonly navigation: any;
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { showSuccess, showInfo, showConfirm, Modal } = useModal();
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [reminderBeforeTime, setReminderBeforeTime] = useState(true);

  const handleLogout = () => {
    showConfirm('Sair da conta', 'Você tem certeza que deseja sair?', () => {
      // Implementar logout aqui
      console.log('Logout realizado');
    });
  };

  const handleDeleteAccount = () => {
    showConfirm(
      'Excluir conta',
      'Esta ação não pode ser desfeita. Todos os seus dados serão perdidos permanentemente.',
      () => {
        showSuccess('Conta excluída', 'Sua conta foi excluída com sucesso.');
      }
    );
  };

  const settingsSections = [
    {
      title: 'Notificações',
      items: [
        {
          id: 'notifications',
          title: 'Notificações push',
          subtitle: 'Receber lembretes de medicamentos',
          icon: 'notifications',
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'sound',
          title: 'Som',
          subtitle: 'Tocar som nos lembretes',
          icon: 'volume-high',
          type: 'toggle' as const,
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
        {
          id: 'vibration',
          title: 'Vibração',
          subtitle: 'Vibrar no lembrete',
          icon: 'phone-portrait',
          type: 'toggle' as const,
          value: vibrationEnabled,
          onToggle: setVibrationEnabled,
        },
        {
          id: 'reminder-before',
          title: 'Lembrete antecipado',
          subtitle: 'Notificar 15 min antes',
          icon: 'time',
          type: 'toggle' as const,
          value: reminderBeforeTime,
          onToggle: setReminderBeforeTime,
        },
      ],
    },
    {
      title: 'Dados e Privacidade',
      items: [
        {
          id: 'backup',
          title: 'Backup dos dados',
          subtitle: 'Fazer backup na nuvem',
          icon: 'cloud-upload',
          type: 'navigation' as const,
          onPress: () =>
            showInfo('Em breve', 'Funcionalidade em desenvolvimento'),
        },
        {
          id: 'export',
          title: 'Exportar dados',
          subtitle: 'Baixar relatório completo',
          icon: 'download',
          type: 'navigation' as const,
          onPress: () =>
            showInfo('Em breve', 'Funcionalidade em desenvolvimento'),
        },
        {
          id: 'privacy',
          title: 'Política de privacidade',
          icon: 'shield-checkmark',
          type: 'navigation' as const,
          onPress: () =>
            showInfo(
              'Política de Privacidade',
              'Seus dados são protegidos e não são compartilhados.'
            ),
        },
      ],
    },
    {
      title: 'Suporte',
      items: [
        {
          id: 'help',
          title: 'Central de ajuda',
          subtitle: 'Tutoriais e perguntas frequentes',
          icon: 'help-circle',
          type: 'navigation' as const,
          onPress: () =>
            showInfo('Em breve', 'Funcionalidade em desenvolvimento'),
        },
        {
          id: 'contact',
          title: 'Fale conosco',
          subtitle: 'Enviar feedback ou dúvidas',
          icon: 'mail',
          type: 'navigation' as const,
          onPress: () =>
            showInfo('Em breve', 'Funcionalidade em desenvolvimento'),
        },
        {
          id: 'rate',
          title: 'Avaliar app',
          subtitle: 'Deixe sua avaliação',
          icon: 'star',
          type: 'navigation' as const,
          onPress: () =>
            showSuccess(
              'Obrigado!',
              'Você será redirecionado para a loja em breve.'
            ),
        },
      ],
    },
    {
      title: 'Backup e Dados',
      items: [
        {
          id: 'backup',
          title: 'Fazer Backup',
          subtitle: 'Salvar dados para restauração',
          icon: 'cloud-upload',
          type: 'navigation' as const,
          onPress: () =>
            showInfo(
              '💾 Backup Local',
              'Seus dados ficam seguros no seu dispositivo. Use o Painel Admin para exportar se necessário.'
            ),
        },
        {
          id: 'export',
          title: 'Exportar Dados',
          subtitle: 'Gerar arquivo de backup manual',
          icon: 'download',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('Admin'),
        },
      ],
    },
    {
      title: 'Desenvolvedor',
      items: [
        {
          id: 'admin',
          title: 'Painel de Administração',
          subtitle: 'Gerenciar dados e debug',
          icon: 'settings',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('Admin'),
        },
      ],
    },
    {
      title: 'Conta',
      items: [
        {
          id: 'logout',
          title: 'Sair da conta',
          icon: 'log-out',
          type: 'action' as const,
          onPress: handleLogout,
        },
        {
          id: 'delete',
          title: 'Excluir conta',
          icon: 'trash',
          type: 'action' as const,
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingsItem, isLast: boolean) => {
    const isDestructive = item.id === 'delete';

    return (
      <TouchableOpacity
        key={item.id}
        className={`flex-row items-center justify-between py-4 px-5 ${!isLast ? 'border-b border-gray-100' : ''}`}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View className="flex-row items-center flex-1">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
              isDestructive ? 'bg-red-100' : 'bg-gray-100'
            }`}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={isDestructive ? '#ef4444' : '#6b7280'}
            />
          </View>

          <View className="flex-1">
            <Text
              className={`text-base font-medium ${
                isDestructive ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text className="text-sm text-gray-500 mt-1">
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>

        {item.type === 'toggle' && item.onToggle && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#e5e7eb', true: '#10b981' }}
            thumbColor={item.value ? '#ffffff' : '#f3f4f6'}
            ios_backgroundColor="#e5e7eb"
          />
        )}

        {item.type === 'navigation' && (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 px-6 py-8 rounded-b-3xl shadow-lg">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2 -ml-2 rounded-full bg-white bg-opacity-20 border border-white border-opacity-30"
          >
            <Ionicons name="arrow-back" size={24} color="#6366f1" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-white text-sm opacity-90 mb-1">
              Preferências
            </Text>
            <Text className="text-white text-2xl font-bold">Configurações</Text>
          </View>

          <View className="bg-white bg-opacity-30 rounded-2xl p-3 border border-white border-opacity-40">
            <Ionicons name="settings" size={24} color="white" />
          </View>
        </View>
      </View>

      {/* Settings List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} className={sectionIndex > 0 ? 'mt-8' : ''}>
            <Text className="text-lg font-bold text-gray-900 mb-3 px-1">
              {section.title}
            </Text>

            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item, itemIndex) =>
                renderSettingItem(item, itemIndex === section.items.length - 1)
              )}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="mt-8 items-center">
          <Text className="text-gray-500 text-sm mb-2">Medicine Reminder</Text>
          <Text className="text-gray-400 text-xs">Versão 1.0.0</Text>
        </View>
      </ScrollView>
      <Modal />
    </SafeAreaView>
  );
}
