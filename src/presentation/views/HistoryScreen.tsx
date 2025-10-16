import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModal } from '../../hooks/useModal';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { DIContainer } from '../../infrastructure/di/DIContainer';

interface DoseReminderWithMedicine {
  id?: number;
  scheduleId: number;
  medicineId: number;
  scheduledTime: Date;
  takenAt?: Date;
  isTaken: boolean;
  isSkipped: boolean;
  createdAt: Date;
  medicineName: string;
  dosage: string;
}

interface GroupedHistory {
  date: string;
  reminders: DoseReminderWithMedicine[];
}

interface HistoryScreenProps {
  onGoBack?: () => void;
}

export default function HistoryScreen({ onGoBack }: HistoryScreenProps) {
  const [history, setHistory] = useState<GroupedHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'taken' | 'skipped'>('all');

  const { Modal, showError } = useModal();
  const { colors } = useSystemTheme();

  // Dependency Injection
  const diContainer = DIContainer.getInstance();
  const getDoseRemindersUseCase = diContainer.getDoseRemindersUseCase;

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      console.log('Go back action not provided');
    }
  };

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);

      let reminders: DoseReminderWithMedicine[] = [];

      // Get reminders based on filter
      if (filter === 'taken') {
        reminders = await getDoseRemindersUseCase.getTakenReminders();
      } else if (filter === 'skipped') {
        reminders = await getDoseRemindersUseCase.getSkippedReminders();
      } else {
        // Get last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        reminders = await getDoseRemindersUseCase.getByDateRange(
          startDate,
          endDate,
        );
      }

      // Group by date
      const grouped = groupRemindersByDate(reminders);
      setHistory(grouped);
    } catch (error) {
      console.error('Error loading history:', error);
      showError('Erro', 'Não foi possível carregar o histórico');
    } finally {
      setLoading(false);
    }
  };

  const groupRemindersByDate = (
    reminders: DoseReminderWithMedicine[],
  ): GroupedHistory[] => {
    const grouped: { [key: string]: DoseReminderWithMedicine[] } = {};

    reminders.forEach(reminder => {
      const dateKey = reminder.scheduledTime.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(reminder);
    });

    // Convert to array and sort by date (most recent first)
    return Object.entries(grouped)
      .map(([date, reminders]) => ({
        date,
        reminders: reminders.sort(
          (a, b) =>
            new Date(a.scheduledTime).getTime() -
            new Date(b.scheduledTime).getTime(),
        ),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (reminder: DoseReminderWithMedicine) => {
    if (reminder.isTaken) return { icon: 'checkmark-circle', color: '#10b981' }; // green color for taken
    if (reminder.isSkipped)
      return { icon: 'play-forward-circle', color: colors.warning };
    return { icon: 'time', color: colors.text.secondary };
  };

  const getStatusText = (reminder: DoseReminderWithMedicine) => {
    if (reminder.isTaken) return 'Tomado';
    if (reminder.isSkipped) return 'Pulado';
    return 'Perdido';
  };

  const getEmptyStateText = () => {
    if (filter === 'taken') return 'Nenhuma dose foi tomada ainda.';
    if (filter === 'skipped') return 'Nenhuma dose foi pulada.';
    return 'Seu histórico aparecerá aqui.';
  };

  const renderHistoryItem = ({ item }: { item: GroupedHistory }) => (
    <View className="mb-6">
      {/* Date Header */}
      <View className="mb-3">
        <Text
          className="text-lg font-bold"
          style={{ color: colors.text.primary }}
        >
          {formatDate(item.date)}
        </Text>
      </View>

      {/* Reminders for this date */}
      {item.reminders.map(reminder => {
        const statusIcon = getStatusIcon(reminder);
        return (
          <View
            key={reminder.id}
            className="mb-3 rounded-2xl p-4 shadow-sm border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name={
                      statusIcon.icon as
                        | 'checkmark-circle'
                        | 'play-forward-circle'
                        | 'time'
                    }
                    size={20}
                    color={statusIcon.color}
                  />
                  <Text
                    className="ml-2 font-semibold text-base"
                    style={{ color: colors.text.primary }}
                  >
                    {reminder.medicineName}
                  </Text>
                </View>

                <Text
                  className="text-sm mb-1"
                  style={{ color: colors.text.secondary }}
                >
                  {reminder.dosage}
                </Text>

                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-sm"
                    style={{ color: colors.text.muted }}
                  >
                    Agendado: {formatTime(reminder.scheduledTime)}
                  </Text>

                  <View className="flex-row items-center">
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: statusIcon.color,
                      }}
                    >
                      {getStatusText(reminder)}
                    </Text>
                    {reminder.takenAt && (
                      <Text
                        className="text-xs ml-2"
                        style={{ color: colors.text.muted }}
                      >
                        às {formatTime(reminder.takenAt)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Ionicons
        name="time-outline"
        size={64}
        color={colors.text.muted}
        className="mb-4"
      />
      <Text
        className="text-lg font-medium text-center mb-2"
        style={{ color: colors.text.primary }}
      >
        Nenhum histórico encontrado
      </Text>
      <Text
        className="text-center text-base"
        style={{ color: colors.text.secondary }}
      >
        {getEmptyStateText()}
      </Text>
    </View>
  );
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={['top']}
    >
      {/* Header */}
      <LinearGradient
        colors={colors.headerGradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 py-6"
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handleGoBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-white">Histórico</Text>

          <View className="w-10" />
        </View>

        {/* Filter Buttons */}
        <View className="flex-row justify-center items-center">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'taken', label: 'Tomados' },
            { key: 'skipped', label: 'Pulados' },
          ].map((filterOption, index) => (
            <TouchableOpacity
              key={filterOption.key}
              onPress={() =>
                setFilter(filterOption.key as 'all' | 'taken' | 'skipped')
              }
              className={`px-4 py-2 rounded-full ${
                filter === filterOption.key
                  ? 'bg-white bg-opacity-20'
                  : 'bg-transparent'
              } ${index > 0 ? 'ml-2' : ''}`}
            >
              <Text
                style={{
                  fontWeight: '500',
                  color:
                    filter === filterOption.key
                      ? colors.text.primary
                      : 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            className="mt-4 text-base"
            style={{ color: colors.text.secondary }}
          >
            Carregando histórico...
          </Text>
        </View>
      ) : history.length > 0 ? (
        <FlatList
          data={history}
          keyExtractor={item => item.date}
          renderItem={renderHistoryItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}

      <Modal />
    </SafeAreaView>
  );
}
