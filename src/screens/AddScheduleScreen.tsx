import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseManager } from '../database/DatabaseManager';
import { Medicine, Schedule } from '../types';

interface AddScheduleRouteParams {
  medicine: Medicine;
}

export default function AddScheduleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicine } = route.params as AddScheduleRouteParams;

  const [intervalHours, setIntervalHours] = useState('8');
  const [durationDays, setDurationDays] = useState('7');
  const [startTime, setStartTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSchedule = async () => {
    if (!intervalHours || !durationDays || !startTime) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const intervalValue = parseInt(intervalHours);
    const durationValue = parseInt(durationDays);

    if (isNaN(intervalValue) || intervalValue <= 0 || intervalValue > 24) {
      Alert.alert('Erro', 'Intervalo deve ser entre 1 e 24 horas.');
      return;
    }

    if (isNaN(durationValue) || durationValue <= 0 || durationValue > 365) {
      Alert.alert('Erro', 'Duração deve ser entre 1 e 365 dias.');
      return;
    }

    if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(startTime)) {
      Alert.alert('Erro', 'Horário deve estar no formato HH:MM (ex: 08:00).');
      return;
    }

    setIsLoading(true);

    try {
      // Criar uma data completa para o primeiro horário
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDateTime = new Date();
      startDateTime.setHours(hours, minutes, 0, 0);

      console.log(
        'Creating schedule with startTime:',
        startTime,
        'converted to:',
        startDateTime.toISOString()
      );

      const schedule: Omit<Schedule, 'id'> = {
        medicineId: medicine.id!,
        intervalHours: intervalValue,
        durationDays: durationValue,
        startTime: startDateTime.toISOString(),
        notes,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      await databaseManager.addSchedule(schedule);

      Alert.alert('Sucesso!', 'Cronograma criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving schedule:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o cronograma.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151' }}>
          Agendar Doses
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Medicamento Info */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 4,
            }}
          >
            {medicine.name}
          </Text>
          <Text style={{ color: '#6b7280', marginBottom: 2 }}>
            Dosagem: {medicine.dosage}mg
          </Text>
          {medicine.description && (
            <Text style={{ color: '#6b7280' }}>{medicine.description}</Text>
          )}
        </View>

        {/* Formulário */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* Intervalo entre doses */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8,
              }}
            >
              Intervalo entre doses (horas) *
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#f9fafb',
              }}
              value={intervalHours}
              onChangeText={setIntervalHours}
              keyboardType="numeric"
              placeholder="Ex: 8 (de 8 em 8 horas)"
            />
          </View>

          {/* Duração do tratamento */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8,
              }}
            >
              Duração do tratamento (dias) *
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#f9fafb',
              }}
              value={durationDays}
              onChangeText={setDurationDays}
              keyboardType="numeric"
              placeholder="Ex: 7 (por 7 dias)"
            />
          </View>

          {/* Horário de início */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8,
              }}
            >
              Primeiro horário do dia
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#f9fafb',
              }}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="Ex: 08:00"
            />
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              Formato: HH:MM (24 horas)
            </Text>
          </View>

          {/* Notas */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8,
              }}
            >
              Notas (opcional)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#f9fafb',
                height: 80,
                textAlignVertical: 'top',
              }}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Instruções especiais, observações..."
            />
          </View>
        </View>

        {/* Preview do cronograma */}
        {intervalHours && durationDays && (
          <View
            style={{
              backgroundColor: '#f0f9ff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#0ea5e9',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Ionicons name="information-circle" size={20} color="#0ea5e9" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#0369a1',
                  marginLeft: 8,
                }}
              >
                Resumo do Tratamento
              </Text>
            </View>

            <Text style={{ color: '#0369a1', marginBottom: 4 }}>
              • Tomar de {intervalHours} em {intervalHours} horas
            </Text>
            <Text style={{ color: '#0369a1', marginBottom: 4 }}>
              • Por {durationDays} dias
            </Text>
            <Text style={{ color: '#0369a1', marginBottom: 4 }}>
              • Primeiro horário: {startTime}
            </Text>
            <Text style={{ color: '#0369a1' }}>
              • Total de doses por dia:{' '}
              {Math.ceil(24 / parseInt(intervalHours || '8'))}
            </Text>
          </View>
        )}

        {/* Botão Salvar */}
        <TouchableOpacity
          style={{
            backgroundColor: isLoading ? '#9ca3af' : '#10b981',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginBottom: 32,
          }}
          onPress={handleSaveSchedule}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? 'Salvando...' : 'Criar Cronograma'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
