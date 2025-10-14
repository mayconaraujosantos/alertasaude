import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserHeader from '../components/UserHeader';
import { databaseManager } from '../database/DatabaseManager';
import { useModal } from '../hooks/useModal';
import { DoseReminder } from '../types';

const { width: _width } = Dimensions.get('window');

interface ExtendedDoseReminder extends DoseReminder {
  medicineName?: string;
  dosage?: string;
  timeCategory?: 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'next';
  timeLeft?: string;
}

interface HomeScreenProps {
  readonly navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [todayReminders, setTodayReminders] = useState<ExtendedDoseReminder[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { Modal, showError, showSuccess, showConfirm } = useModal();

  useEffect(() => {
    loadTodayReminders();
  }, []);

  // Usar useFocusEffect para garantir reload quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      console.log('👁️ [HomeScreen] Screen focused, reloading reminders...');
      loadTodayReminders();
    }, [])
  );

  const loadTodayReminders = async () => {
    try {
      console.log('🔄 [HomeScreen] Loading today reminders...');
      setLoading(true);

      const reminders = await databaseManager.getTodayReminders();
      console.log(
        `✅ [HomeScreen] Loaded ${reminders.length} reminders for today`
      );

      // Log detalhado dos lembretes
      if (reminders.length > 0) {
        console.log(
          '📋 [HomeScreen] Reminders details:',
          reminders.map(r => ({
            id: r.id,
            medicineName: (r as any).medicineName,
            scheduledTime: r.scheduledTime,
            isTaken: r.isTaken,
          }))
        );
      } else {
        console.log('📋 [HomeScreen] No reminders found for today');
      }

      setTodayReminders(reminders);
    } catch (error) {
      console.error('❌ [HomeScreen] Error loading reminders:', error);
      showError('Erro', 'Não foi possível carregar os lembretes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTodayReminders();
  };

  const markAsTaken = async (reminderId: number) => {
    showConfirm(
      'Confirmar Medicamento',
      'Você realmente tomou este medicamento agora?',
      async () => {
        try {
          // Usar o novo método que cancela as notificações automaticamente
          await databaseManager.markReminderAsTaken(reminderId);
          await loadTodayReminders();
          showSuccess(
            '✅ Dose Tomada',
            'Medicamento marcado como tomado e notificações canceladas!'
          );
        } catch (error) {
          console.error('Error marking dose as taken:', error);
          showError('Erro', 'Não foi possível marcar como tomado');
        }
      }
    );
  };

  const markAsSkipped = async (reminderId: number) => {
    showConfirm(
      'Pular Medicamento',
      'Tem certeza que deseja pular este medicamento? Esta ação não pode ser desfeita.',
      async () => {
        try {
          // Usar o novo método que cancela as notificações automaticamente
          await databaseManager.skipReminder(reminderId);
          await loadTodayReminders();
          showSuccess(
            '⏭️ Dose Pulada',
            'Medicamento marcado como pulado e notificações canceladas'
          );
        } catch (error) {
          console.error('Error marking dose as skipped:', error);
          showError('Erro', 'Não foi possível marcar como pulado');
        }
      }
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (reminder: ExtendedDoseReminder) => {
    if (reminder.isTaken) return '✅';
    if (reminder.isSkipped) return '⏭️';
    return '⏰';
  };

  const getStatusColor = (reminder: ExtendedDoseReminder) => {
    if (reminder.isTaken) return '#10b981'; // green
    if (reminder.isSkipped) return '#f59e0b'; // amber
    return '#3b82f6'; // blue
  };

  const renderReminderItem = ({ item }: { item: ExtendedDoseReminder }) => (
    <View className="bg-white mx-4 mb-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Status bar colorida no topo */}
      <View
        className="h-1 w-full"
        style={{ backgroundColor: getStatusColor(item) }}
      />

      <View className="p-6">
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-2">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: getStatusColor(item) }}
              />
              <Text className="text-xl font-bold text-gray-900">
                {item.medicineName}
              </Text>
            </View>

            <Text className="text-sm text-gray-600 mb-2">{item.dosage}</Text>

            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="text-base font-semibold text-gray-800 ml-2">
                {formatTime(item.scheduledTime)}
              </Text>
            </View>

            {item.takenAt && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text className="text-xs text-green-600 ml-1">
                  Tomado às {formatTime(item.takenAt)}
                </Text>
              </View>
            )}
          </View>

          <View className="items-center">
            <Text className="text-3xl mb-1">{getStatusIcon(item)}</Text>
            <Text className="text-xs font-medium text-gray-500">
              {(() => {
                if (item.isTaken) return 'Tomado';
                if (item.isSkipped) return 'Pulado';
                return 'Pendente';
              })()}
            </Text>
          </View>
        </View>

        {!item.isTaken && !item.isSkipped && (
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-green-500 py-3 rounded-xl items-center flex-row justify-center"
              onPress={() => markAsTaken(item.id!)}
            >
              <Ionicons name="checkmark" size={18} color="white" />
              <Text className="text-white font-bold ml-2">Tomei</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-amber-500 py-3 rounded-xl items-center flex-row justify-center"
              onPress={() => markAsSkipped(item.id!)}
            >
              <Ionicons name="play-forward" size={18} color="white" />
              <Text className="text-white font-bold ml-2">Pular</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-500">Carregando lembretes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <UserHeader
        backgroundColor="bg-blue-500"
        title="Seus Medicamentos Hoje"
        subtitle={`${todayReminders.length} ${todayReminders.length === 1 ? 'lembrete' : 'lembretes'} para hoje`}
        iconName="medical"
        iconColor="#3b82f6"
        navigation={navigation}
      />

      {/* Botões de Debug - apenas em desenvolvimento */}

      {todayReminders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8 -mt-20">
          <View className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 items-center">
            <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#10b981" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              Tudo em dia!
            </Text>

            <Text className="text-base text-gray-600 text-center leading-6">
              Você não tem nenhum medicamento agendado para hoje.
            </Text>

            <View className="bg-green-50 rounded-2xl p-4 mt-6 w-full">
              <Text className="text-green-800 text-center font-medium">
                ✨ Continue cuidando da sua saúde!
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={todayReminders}
          renderItem={renderReminderItem}
          keyExtractor={(item: { id?: number }) =>
            item.id?.toString() || Math.random().toString()
          }
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: 120, // Espaço para tab bar flutuante
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <Modal />
    </SafeAreaView>
  );
}
