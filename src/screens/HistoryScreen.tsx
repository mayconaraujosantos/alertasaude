import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DoseReminder } from '../types';

interface HistoryScreenProps {
  readonly navigation: any;
}

interface ExtendedDoseReminder extends DoseReminder {
  medicineName?: string;
  dosage?: string;
}

interface GroupedHistory {
  date: string;
  reminders: ExtendedDoseReminder[];
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [history, setHistory] = useState<GroupedHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'taken' | 'skipped'>('all');
  const colorScheme = useColorScheme();

  // Sistema de cores dinâmico baseado no tema
  const colors = {
    primary: '#ff6b35',
    primaryLight: '#ff8c61',
    primaryDark: '#e85a2b',
    secondary: '#6366f1',
    accent: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',

    // Cores adaptáveis ao tema
    background: colorScheme === 'dark' ? '#0f172a' : '#f8fafc',
    surface: colorScheme === 'dark' ? '#1e293b' : '#ffffff',
    surfaceSecondary: colorScheme === 'dark' ? '#334155' : '#f1f5f9',
    border: colorScheme === 'dark' ? '#475569' : '#e2e8f0',
    text: colorScheme === 'dark' ? '#f1f5f9' : '#1e293b',
    textSecondary: colorScheme === 'dark' ? '#94a3b8' : '#64748b',
    textMuted: colorScheme === 'dark' ? '#64748b' : '#94a3b8',

    // Gradientes
    gradient:
      colorScheme === 'dark' ? ['#1e293b', '#334155'] : ['#ff6b35', '#f7931e'],
    gradientSecondary:
      colorScheme === 'dark' ? ['#374151', '#4b5563'] : ['#6366f1', '#8b5cf6'],
  };

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // Por enquanto vamos usar dados mock até implementar no database
      const mockHistory = generateMockHistory();
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico');
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistory = (): GroupedHistory[] => {
    const today = new Date();
    const historyData: GroupedHistory[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const reminders: ExtendedDoseReminder[] = [
        {
          id: i * 10 + 1,
          medicineId: 1,
          scheduleId: 1,
          scheduledTime: new Date(date.setHours(8, 0)).toISOString(),
          isTaken: Math.random() > 0.3,
          isSkipped: Math.random() > 0.7,
          takenAt:
            Math.random() > 0.3
              ? new Date(date.setHours(8, 15)).toISOString()
              : undefined,
          createdAt: new Date(date.setHours(8, 0)).toISOString(),
          medicineName: 'Dipirona',
          dosage: '500mg',
        },
        {
          id: i * 10 + 2,
          medicineId: 2,
          scheduleId: 2,
          scheduledTime: new Date(date.setHours(14, 0)).toISOString(),
          isTaken: Math.random() > 0.2,
          isSkipped: Math.random() > 0.8,
          takenAt:
            Math.random() > 0.2
              ? new Date(date.setHours(14, 10)).toISOString()
              : undefined,
          createdAt: new Date(date.setHours(14, 0)).toISOString(),
          medicineName: 'Paracetamol',
          dosage: '750mg',
        },
        {
          id: i * 10 + 3,
          medicineId: 3,
          scheduleId: 3,
          scheduledTime: new Date(date.setHours(20, 0)).toISOString(),
          isTaken: Math.random() > 0.4,
          isSkipped: Math.random() > 0.6,
          takenAt:
            Math.random() > 0.4
              ? new Date(date.setHours(20, 5)).toISOString()
              : undefined,
          createdAt: new Date(date.setHours(20, 0)).toISOString(),
          medicineName: 'Omeprazol',
          dosage: '20mg',
        },
      ];

      // Aplicar filtro
      let filteredReminders = reminders;
      if (filter === 'taken') {
        filteredReminders = reminders.filter(r => r.isTaken);
      } else if (filter === 'skipped') {
        filteredReminders = reminders.filter(r => r.isSkipped);
      }

      if (filteredReminders.length > 0) {
        historyData.push({
          date: date.toISOString(),
          reminders: filteredReminders,
        });
      }
    }

    return historyData;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (reminder: ExtendedDoseReminder) => {
    if (reminder.isTaken)
      return { icon: 'checkmark-circle', color: colors.accent };
    if (reminder.isSkipped)
      return { icon: 'play-forward-circle', color: colors.warning };
    return { icon: 'time', color: colors.textSecondary };
  };

  const getStatusText = (reminder: ExtendedDoseReminder) => {
    if (reminder.isTaken) return 'Tomado';
    if (reminder.isSkipped) return 'Pulado';
    return 'Perdido';
  };

  const getEmptyStateText = () => {
    if (filter === 'taken') return 'Nenhuma dose foi tomada ainda.';
    if (filter === 'skipped') return 'Nenhuma dose foi pulada.';
    return 'Seu histórico aparecerá aqui.';
  };

  const renderReminderItem = ({ item }: { item: ExtendedDoseReminder }) => {
    const status = getStatusIcon(item);

    return (
      <View
        className="rounded-2xl p-4 mb-3 shadow-sm border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-2">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: status.color }}
              />
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.text }}
              >
                {item.medicineName}
              </Text>
            </View>

            <Text
              className="text-sm mb-1"
              style={{ color: colors.textSecondary }}
            >
              {item.dosage}
            </Text>

            <View className="flex-row items-center">
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text
                className="text-sm ml-1"
                style={{ color: colors.textSecondary }}
              >
                Agendado: {formatTime(item.scheduledTime)}
              </Text>
            </View>

            {item.takenAt && (
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.accent}
                />
                <Text className="text-xs ml-1" style={{ color: colors.accent }}>
                  Tomado às {formatTime(item.takenAt)}
                </Text>
              </View>
            )}
          </View>

          <View className="items-center">
            <Ionicons
              name={status.icon as any}
              size={32}
              color={status.color}
            />
            <Text
              className="text-xs font-medium mt-1"
              style={{ color: colors.textSecondary }}
            >
              {getStatusText(item)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDaySection = ({ item }: { item: GroupedHistory }) => (
    <View className="mb-6">
      <View className="flex-row items-center mb-4">
        <Text
          className="text-lg font-bold flex-1"
          style={{ color: colors.text }}
        >
          {formatDate(item.date)}
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          {item.reminders.length}{' '}
          {item.reminders.length === 1 ? 'dose' : 'doses'}
        </Text>
      </View>

      {item.reminders.map(reminder => (
        <View key={`${reminder.id}-${reminder.scheduledTime}`}>
          {renderReminderItem({ item: reminder })}
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg" style={{ color: colors.textSecondary }}>
            Carregando histórico...
          </Text>
        </View>
      );
    }

    if (history.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-8">
          <View
            className="rounded-3xl p-8 shadow-sm border items-center"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <Ionicons
                name="time-outline"
                size={48}
                color={colors.textSecondary}
              />
            </View>

            <Text
              className="text-2xl font-bold text-center mb-2"
              style={{ color: colors.text }}
            >
              Nenhum registro encontrado
            </Text>

            <Text
              className="text-base text-center"
              style={{ color: colors.textSecondary }}
            >
              {getEmptyStateText()}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <FlatList
        data={history}
        renderItem={renderDaySection}
        keyExtractor={item => item.date}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header com Gradiente */}
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-8 rounded-b-3xl shadow-lg"
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2 -ml-2 rounded-full border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-white text-sm opacity-90 mb-1">
              Acompanhamento
            </Text>
            <Text className="text-white text-2xl font-bold">
              Histórico de Medicamentos
            </Text>
          </View>

          <View className="bg-white bg-opacity-30 rounded-2xl p-3 border border-white border-opacity-40">
            <Ionicons name="time" size={24} color="white" />
          </View>
        </View>

        {/* Filtros */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="px-4 py-3 rounded-2xl flex-1 items-center shadow-sm"
            style={{
              backgroundColor:
                filter === 'all' ? colors.surface : 'rgba(255, 255, 255, 0.15)',
              borderWidth: filter === 'all' ? 2 : 1,
              borderColor:
                filter === 'all' ? colors.primary : 'rgba(255, 255, 255, 0.3)',
            }}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              className="font-bold text-sm"
              style={{
                color: filter === 'all' ? colors.primary : 'white',
              }}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-4 py-3 rounded-2xl flex-1 items-center shadow-sm"
            style={{
              backgroundColor:
                filter === 'taken'
                  ? colors.surface
                  : 'rgba(255, 255, 255, 0.15)',
              borderWidth: filter === 'taken' ? 2 : 1,
              borderColor:
                filter === 'taken' ? colors.accent : 'rgba(255, 255, 255, 0.3)',
            }}
            onPress={() => setFilter('taken')}
            activeOpacity={0.8}
          >
            <Text
              className="font-bold text-sm"
              style={{
                color: filter === 'taken' ? colors.accent : 'white',
              }}
            >
              Tomados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-4 py-3 rounded-2xl flex-1 items-center shadow-sm"
            style={{
              backgroundColor:
                filter === 'skipped'
                  ? colors.surface
                  : 'rgba(255, 255, 255, 0.15)',
              borderWidth: filter === 'skipped' ? 2 : 1,
              borderColor:
                filter === 'skipped'
                  ? colors.warning
                  : 'rgba(255, 255, 255, 0.3)',
            }}
            onPress={() => setFilter('skipped')}
            activeOpacity={0.8}
          >
            <Text
              className="font-bold text-sm"
              style={{
                color: filter === 'skipped' ? colors.warning : 'white',
              }}
            >
              Pulados
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Lista do Histórico */}
      {renderContent()}
    </SafeAreaView>
  );
}
