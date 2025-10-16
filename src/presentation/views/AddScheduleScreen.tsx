import { Ionicons } from '@expo/vector-icons';
// Note: Using props for navigation instead of router
import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedicineEntity } from '../../domain/entities';
import { useModal } from '../../hooks/useModal';
import { DIContainer } from '../../infrastructure/di/DIContainer';

interface AddScheduleScreenProps {
  medicine: MedicineEntity;
  onGoBack?: () => void;
}

export default function AddScheduleScreen({
  medicine,
  onGoBack,
}: AddScheduleScreenProps) {
  const [intervalHours, setIntervalHours] = useState('8');
  const [durationDays, setDurationDays] = useState('7');
  const [startTime, setStartTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { Modal, showError, showSuccess } = useModal();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      console.log('Go back action not provided');
    }
  }; // Dependency Injection
  const diContainer = DIContainer.getInstance();
  const createScheduleUseCase = diContainer.createScheduleUseCase;

  // Calculate schedule preview
  const schedulePreview = useMemo(() => {
    if (!intervalHours || !durationDays || !startTime) return null;

    const interval = parseInt(intervalHours);
    const duration = parseInt(durationDays);
    const [startHour, startMinute] = startTime.split(':').map(Number);

    const dosesPerDay = Math.ceil(24 / interval);
    const totalDoses = dosesPerDay * duration;
    const schedule = [];

    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);

    for (let i = 0; i < Math.min(totalDoses, 10); i++) {
      // Limit preview to 10 doses
      const doseTime = new Date(startDate);
      doseTime.setHours(startDate.getHours() + i * interval);
      schedule.push(doseTime);
    }

    return {
      schedule,
      dosesPerDay,
      totalDoses,
      hasMore: totalDoses > 10,
    };
  }, [intervalHours, durationDays, startTime]);

  const isFormValid =
    intervalHours && durationDays && startTime && medicine?.id;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const handleSave = async () => {
    if (!isFormValid) {
      showError('Dados Incompletos', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (!medicine.id) {
      showError('Erro', 'Medicamento inválido.');
      return;
    }

    setIsLoading(true);

    try {
      await createScheduleUseCase.execute(
        medicine.id,
        parseInt(intervalHours),
        parseInt(durationDays),
        startTime,
        notes.trim() || undefined,
      );

      showSuccess(
        'Agendamento Criado',
        'O agendamento foi criado com sucesso!',
        handleGoBack,
      );
    } catch (error) {
      console.error('Error creating schedule:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      showError('Erro ao Criar Agendamento', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const presetIntervals = [
    { hours: '4', label: '4h (6x ao dia)' },
    { hours: '6', label: '6h (4x ao dia)' },
    { hours: '8', label: '8h (3x ao dia)' },
    { hours: '12', label: '12h (2x ao dia)' },
    { hours: '24', label: '24h (1x ao dia)' },
  ];

  const presetDurations = [
    { days: '3', label: '3 dias' },
    { days: '7', label: '1 semana' },
    { days: '14', label: '2 semanas' },
    { days: '30', label: '1 mês' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleGoBack} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-800">
          Novo Agendamento
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Medicine Info */}
        <View className="mx-4 mb-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-sm font-medium text-gray-600 mb-2">
            Medicamento Selecionado
          </Text>
          <Text className="text-lg font-semibold text-gray-800">
            {medicine.name}
          </Text>
          <Text className="text-orange-600 font-medium">{medicine.dosage}</Text>
          {medicine.description && (
            <Text className="text-gray-600 mt-1 text-sm">
              {medicine.description}
            </Text>
          )}
        </View>

        {/* Form Fields */}
        <View className="px-4 space-y-6">
          {/* Interval Hours */}
          <View>
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Intervalo entre Doses *
            </Text>

            {/* Preset buttons */}
            <View className="flex-row flex-wrap gap-2 mb-3">
              {presetIntervals.map(preset => (
                <TouchableOpacity
                  key={preset.hours}
                  onPress={() => setIntervalHours(preset.hours)}
                  className={`px-3 py-2 rounded-lg border ${
                    intervalHours === preset.hours
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      intervalHours === preset.hours
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={intervalHours}
              onChangeText={setIntervalHours}
              placeholder="Horas entre cada dose"
              className="bg-white rounded-xl px-4 py-4 text-gray-800 border border-gray-200"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>

          {/* Duration */}
          <View>
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Duração do Tratamento *
            </Text>

            {/* Preset buttons */}
            <View className="flex-row flex-wrap gap-2 mb-3">
              {presetDurations.map(preset => (
                <TouchableOpacity
                  key={preset.days}
                  onPress={() => setDurationDays(preset.days)}
                  className={`px-3 py-2 rounded-lg border ${
                    durationDays === preset.days
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      durationDays === preset.days
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={durationDays}
              onChangeText={setDurationDays}
              placeholder="Dias de tratamento"
              className="bg-white rounded-xl px-4 py-4 text-gray-800 border border-gray-200"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>

          {/* Start Time */}
          <View>
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Horário da Primeira Dose *
            </Text>
            <TextInput
              value={startTime}
              onChangeText={setStartTime}
              placeholder="HH:MM (ex: 08:00)"
              className="bg-white rounded-xl px-4 py-4 text-gray-800 border border-gray-200"
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
            />
          </View>

          {/* Notes */}
          <View>
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Observações
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Observações sobre o agendamento..."
              className="bg-white rounded-xl px-4 py-4 text-gray-800 border border-gray-200"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Schedule Preview */}
        {schedulePreview && (
          <View className="mx-4 mt-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Cronograma Previsto
            </Text>

            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-sm text-gray-600">Doses por dia</Text>
                <Text className="text-lg font-semibold text-orange-600">
                  {schedulePreview.dosesPerDay}x
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-600">Total de doses</Text>
                <Text className="text-lg font-semibold text-orange-600">
                  {schedulePreview.totalDoses}
                </Text>
              </View>
            </View>

            <Text className="text-sm font-medium text-gray-700 mb-2">
              Próximas doses:
            </Text>
            {schedulePreview.schedule.map((doseTime, index) => (
              <View key={index} className="flex-row items-center py-1">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-gray-700 ml-2">
                  {formatDate(doseTime)} às {formatTime(doseTime)}
                </Text>
              </View>
            ))}
            {schedulePreview.hasMore && (
              <Text className="text-gray-500 text-sm mt-2">
                ... e mais {schedulePreview.totalDoses - 10} doses
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isFormValid || isLoading}
          className={`py-4 rounded-xl flex-row items-center justify-center ${
            isFormValid && !isLoading ? 'bg-orange-500' : 'bg-gray-300'
          }`}
        >
          {isLoading ? (
            <Text className="text-white font-semibold text-base">
              Criando Agendamento...
            </Text>
          ) : (
            <>
              <Ionicons
                name="calendar"
                size={20}
                color={isFormValid ? 'white' : '#9CA3AF'}
              />
              <Text
                className={`font-semibold text-base ml-2 ${
                  isFormValid ? 'text-white' : 'text-gray-500'
                }`}
              >
                Criar Agendamento
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal />
    </SafeAreaView>
  );
}
