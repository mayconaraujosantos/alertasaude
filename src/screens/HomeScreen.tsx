import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseManager } from '../database/DatabaseManager';
import { DoseReminder } from '../types';

interface ExtendedDoseReminder extends DoseReminder {
  medicineName?: string;
  dosage?: string;
}

export default function HomeScreen() {
  const [todayReminders, setTodayReminders] = useState<ExtendedDoseReminder[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTodayReminders();
  }, []);

  const loadTodayReminders = async () => {
    try {
      const reminders = await databaseManager.getTodayReminders();
      setTodayReminders(reminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Erro', 'Não foi possível carregar os lembretes');
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
    try {
      await databaseManager.markDoseAsTaken(reminderId);
      await loadTodayReminders();
      Alert.alert('✅ Dose Tomada', 'Medicamento marcado como tomado!');
    } catch (error) {
      console.error('Error marking dose as taken:', error);
      Alert.alert('Erro', 'Não foi possível marcar como tomado');
    }
  };

  const markAsSkipped = async (reminderId: number) => {
    try {
      await databaseManager.markDoseAsSkipped(reminderId);
      await loadTodayReminders();
      Alert.alert('⏭️ Dose Pulada', 'Medicamento marcado como pulado');
    } catch (error) {
      console.error('Error marking dose as skipped:', error);
      Alert.alert('Erro', 'Não foi possível marcar como pulado');
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
    <View
      style={{
        backgroundColor: 'white',
        margin: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(item),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginRight: 8,
              }}
            >
              {item.medicineName}
            </Text>
            <Text style={{ fontSize: 24 }}>{getStatusIcon(item)}</Text>
          </View>

          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
            Dosagem: {item.dosage}
          </Text>

          <Text style={{ fontSize: 16, color: '#374151', fontWeight: '500' }}>
            🕐 {formatTime(item.scheduledTime)}
          </Text>

          {item.takenAt && (
            <Text style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>
              Tomado às {formatTime(item.takenAt)}
            </Text>
          )}
        </View>
      </View>

      {!item.isTaken && !item.isSkipped && (
        <View
          style={{
            flexDirection: 'row',
            marginTop: 12,
            gap: 8,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#10b981',
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => markAsTaken(item.id!)}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>✅ Tomei</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#f59e0b',
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => markAsSkipped(item.id!)}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>⏭️ Pular</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}
      >
        <Text style={{ fontSize: 18, color: '#6b7280' }}>
          Carregando lembretes...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View
        style={{
          padding: 16,
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
          💊 Seus Medicamentos Hoje
        </Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 4 }}>
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* Botões de Debug - remover depois */}
        <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
            onPress={async () => {
              await databaseManager.debugDatabaseState();
            }}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>Debug DB</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#10b981',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
            onPress={loadTodayReminders}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#f59e0b',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
            onPress={async () => {
              await databaseManager.createTestReminders();
              await loadTodayReminders();
              Alert.alert('✅', 'Lembretes de teste criados!');
            }}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>Test Reminders</Text>
          </TouchableOpacity>
        </View>
      </View>

      {todayReminders.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={64} color="#10b981" />
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#1f2937',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Nenhum lembrete para hoje!
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#6b7280',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Você está em dia com seus medicamentos
          </Text>
        </View>
      ) : (
        <FlatList
          data={todayReminders}
          renderItem={renderReminderItem}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          contentContainerStyle={{ paddingBottom: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
