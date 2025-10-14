import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { databaseManager } from '../database/DatabaseManager';
import { Medicine, Schedule } from '../types';

interface AddScheduleRouteParams {
  medicine: Medicine;
}

export default function AddScheduleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicine } = route.params as AddScheduleRouteParams;
  const colorScheme = useColorScheme();

  const [intervalHours, setIntervalHours] = useState('8');
  const [durationDays, setDurationDays] = useState('7');
  const [startTime, setStartTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Função para calcular o cronograma completo
  const calculateSchedule = () => {
    if (!intervalHours || !durationDays || !startTime) return null;

    const interval = parseInt(intervalHours);
    const duration = parseInt(durationDays);
    const [startHour, startMinute] = startTime.split(':').map(Number);

    const dosesPerDay = Math.ceil(24 / interval);
    const totalDoses = dosesPerDay * duration;
    const schedule = [];

    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);

    for (let i = 0; i < totalDoses; i++) {
      const doseTime = new Date(
        startDate.getTime() + i * interval * 60 * 60 * 1000
      );
      const day = Math.floor(i / dosesPerDay) + 1;
      const doseNumber = (i % dosesPerDay) + 1;

      if (day <= duration) {
        schedule.push({
          day,
          doseNumber,
          time: doseTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          date: doseTime.toLocaleDateString('pt-BR'),
          fullDate: doseTime,
        });
      }
    }

    return {
      schedule,
      dosesPerDay,
      totalDoses: schedule.length,
      startDate: startDate.toLocaleDateString('pt-BR'),
      endDate: schedule[schedule.length - 1]?.date || '',
    };
  };

  const scheduleData = calculateSchedule();

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
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header com Gradiente Adaptável */}
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-4 pb-16 shadow-2xl"
        style={{
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-3 rounded-2xl backdrop-blur-sm border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 items-center px-4">
            <View className="items-center">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 bg-white/60 rounded-full mr-2" />
                <Text className="text-white/80 text-sm font-medium tracking-wide">
                  NOVO CRONOGRAMA
                </Text>
                <View className="w-2 h-2 bg-white/60 rounded-full ml-2" />
              </View>
              <Text className="text-white text-2xl font-bold tracking-tight">
                Agendar Doses
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="p-3 rounded-2xl backdrop-blur-sm border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Indicador de progresso */}
        <View className="flex-row items-center justify-center mt-2">
          <View className="flex-row space-x-2">
            <View className="w-8 h-1 bg-white rounded-full" />
            <View className="w-4 h-1 bg-white/40 rounded-full" />
            <View className="w-4 h-1 bg-white/40 rounded-full" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 -mt-4"
        contentContainerStyle={{
          paddingTop: 24,
          paddingHorizontal: 16,
          paddingBottom: 120, // Espaço extra para o botão não ser cortado
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card do Medicamento - Design Premium */}
        <View
          className="rounded-3xl p-6 mb-6 shadow-lg border"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colorScheme === 'dark' ? '#000' : colors.primary,
            shadowOpacity: 0.1,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          {/* Header do Card */}
          <View className="flex-row items-center mb-6">
            <View className="flex-row items-center flex-1">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: colors.accent }}
              />
              <Text
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Medicamento Selecionado
              </Text>
            </View>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: `${colors.accent}20` }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: colors.accent }}
              >
                ATIVO
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            {/* Imagem do Medicamento com Design Premium */}
            <View className="mr-5">
              {medicine.imageUri ? (
                <View
                  className="w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-md"
                  style={{
                    borderColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Image
                    source={{ uri: medicine.imageUri }}
                    className="w-full h-full"
                    style={{ resizeMode: 'cover' }}
                  />
                </View>
              ) : (
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  className="w-20 h-20 rounded-2xl items-center justify-center shadow-md border-2"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Ionicons name="medical" size={32} color="white" />
                </LinearGradient>
              )}
            </View>

            {/* Informações do Medicamento */}
            <View className="flex-1">
              <Text
                className="text-2xl font-bold mb-2 leading-tight"
                style={{ color: colors.text }}
              >
                {medicine.name}
              </Text>

              <View className="flex-row items-center mb-3">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: colors.warning }}
                />
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  {medicine.dosage}
                </Text>
              </View>

              {/* Status Badge Premium */}
              <View
                className="self-start px-4 py-2 rounded-full flex-row items-center"
                style={{ backgroundColor: `${colors.accent}15` }}
              >
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: colors.accent }}
                />
                <Text
                  className="text-sm font-bold"
                  style={{ color: colors.accent }}
                >
                  Pronto para cronograma
                </Text>
              </View>
            </View>
          </View>

          {medicine.description && (
            <View
              className="mt-6 p-4 rounded-2xl border"
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  className="text-sm font-bold ml-2"
                  style={{ color: colors.primary }}
                >
                  DESCRIÇÃO
                </Text>
              </View>
              <Text
                className="text-base leading-6"
                style={{ color: colors.textSecondary }}
              >
                {medicine.description}
              </Text>
            </View>
          )}
        </View>

        {/* Formulário Premium */}
        <View
          className="rounded-3xl p-6 mb-6 shadow-xl border"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colorScheme === 'dark' ? '#000' : colors.secondary,
            shadowOpacity: 0.1,
            shadowRadius: 25,
            shadowOffset: { width: 0, height: 10 },
            elevation: 10,
          }}
        >
          {/* Header do Formulário */}
          <View className="flex-row items-center mb-8">
            <LinearGradient
              colors={colors.gradientSecondary}
              className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
            >
              <Ionicons name="settings" size={24} color="white" />
            </LinearGradient>
            <View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                Configuração
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Defina os horários do tratamento
              </Text>
            </View>
          </View>

          {/* Intervalo entre doses - Design Premium */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Ionicons name="time" size={16} color={colors.primary} />
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Intervalo entre doses
              </Text>
              <Text
                className="text-sm font-medium ml-2 px-2 py-1 rounded-md"
                style={{
                  color: colors.error,
                  backgroundColor: `${colors.error}15`,
                }}
              >
                *
              </Text>
            </View>

            <View
              className="flex-row items-center rounded-2xl px-5 py-4 border-2 shadow-sm"
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Ionicons name="timer" size={20} color={colors.primary} />
              </View>
              <TextInput
                className="flex-1 text-lg font-semibold"
                style={{ color: colors.text }}
                value={intervalHours}
                onChangeText={setIntervalHours}
                keyboardType="numeric"
                placeholder="8"
                placeholderTextColor={colors.textMuted}
              />
              <Text
                className="text-base font-bold px-3 py-2 rounded-lg"
                style={{
                  color: colors.primary,
                  backgroundColor: `${colors.primary}10`,
                }}
              >
                horas
              </Text>
            </View>

            <View
              className="mt-3 p-3 rounded-xl flex-row items-center"
              style={{ backgroundColor: `${colors.accent}10` }}
            >
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.accent}
              />
              <Text
                className="text-sm font-medium ml-2"
                style={{ color: colors.accent }}
              >
                Exemplo: 8 = tomar de 8 em 8 horas
              </Text>
            </View>
          </View>

          {/* Duração do tratamento - Design Premium */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.secondary}20` }}
              >
                <Ionicons name="calendar" size={16} color={colors.secondary} />
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Duração total
              </Text>
              <Text
                className="text-sm font-medium ml-2 px-2 py-1 rounded-md"
                style={{
                  color: colors.error,
                  backgroundColor: `${colors.error}15`,
                }}
              >
                *
              </Text>
            </View>

            <View
              className="flex-row items-center rounded-2xl px-5 py-4 border-2 shadow-sm"
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.secondary}15` }}
              >
                <Ionicons
                  name="calendar-number"
                  size={20}
                  color={colors.secondary}
                />
              </View>
              <TextInput
                className="flex-1 text-lg font-semibold"
                style={{ color: colors.text }}
                value={durationDays}
                onChangeText={setDurationDays}
                keyboardType="numeric"
                placeholder="7"
                placeholderTextColor={colors.textMuted}
              />
              <Text
                className="text-base font-bold px-3 py-2 rounded-lg"
                style={{
                  color: colors.secondary,
                  backgroundColor: `${colors.secondary}10`,
                }}
              >
                dias
              </Text>
            </View>
          </View>

          {/* Horário de início - Design Premium */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.warning}20` }}
              >
                <Ionicons name="alarm" size={16} color={colors.warning} />
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Primeiro horário
              </Text>
            </View>

            <View
              className="flex-row items-center rounded-2xl px-5 py-4 border-2 shadow-sm"
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.warning}15` }}
              >
                <Ionicons name="time" size={20} color={colors.warning} />
              </View>
              <TextInput
                className="flex-1 text-lg font-semibold"
                style={{ color: colors.text }}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="08:00"
                placeholderTextColor={colors.textMuted}
              />
              <View
                className="px-3 py-2 rounded-lg"
                style={{ backgroundColor: `${colors.warning}10` }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: colors.warning }}
                >
                  24h
                </Text>
              </View>
            </View>

            <View
              className="mt-3 p-3 rounded-xl flex-row items-center"
              style={{ backgroundColor: `${colors.warning}10` }}
            >
              <Ionicons name="bulb" size={16} color={colors.warning} />
              <Text
                className="text-sm font-medium ml-2"
                style={{ color: colors.warning }}
              >
                Use formato 24h: HH:MM (ex: 08:30)
              </Text>
            </View>
          </View>

          {/* Notas - Design Elegante */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.textSecondary}20` }}
              >
                <Ionicons
                  name="document-text"
                  size={16}
                  color={colors.textSecondary}
                />
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Observações
              </Text>
              <View
                className="ml-2 px-2 py-1 rounded-md"
                style={{ backgroundColor: `${colors.textMuted}15` }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textMuted }}
                >
                  Opcional
                </Text>
              </View>
            </View>

            <View
              className="rounded-2xl p-5 border-2 shadow-sm min-h-24"
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
            >
              <TextInput
                className="text-base leading-6"
                style={{
                  color: colors.text,
                  textAlignVertical: 'top',
                }}
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Instruções especiais, lembretes importantes..."
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Cronograma Completo Dinâmico */}
        {scheduleData && (
          <View
            className="rounded-3xl p-6 mb-6 shadow-xl border"
            style={{
              backgroundColor: colors.surface,
              borderColor: `${colors.accent}40`,
              shadowColor: colors.accent,
              shadowOpacity: 0.15,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 12,
            }}
          >
            {/* Header do Cronograma */}
            <View className="flex-row items-center mb-6">
              <LinearGradient
                colors={[colors.accent, '#059669']}
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
              >
                <Ionicons name="calendar-number" size={24} color="white" />
              </LinearGradient>
              <View>
                <Text
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  Cronograma de Administração
                </Text>
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.accent }}
                >
                  {medicine.name} - {medicine.dosage}
                </Text>
              </View>
            </View>

            {/* Informações Gerais */}
            <View className="mb-6">
              <View
                className="p-4 rounded-2xl border-l-4"
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text
                  className="text-base font-bold mb-2"
                  style={{ color: colors.text }}
                >
                  📋 Informações do Tratamento
                </Text>
                <Text
                  className="text-sm leading-6"
                  style={{ color: colors.textSecondary }}
                >
                  <Text className="font-semibold">Posologia:</Text> Administrar{' '}
                  {medicine.dosage} a cada {intervalHours} horas (
                  {scheduleData.dosesPerDay === 1
                    ? 'uma vez'
                    : scheduleData.dosesPerDay === 2
                      ? 'duas vezes'
                      : `${scheduleData.dosesPerDay} vezes`}{' '}
                  ao dia) por {durationDays} dias.
                </Text>
                <Text
                  className="text-sm mt-2"
                  style={{ color: colors.textSecondary }}
                >
                  <Text className="font-semibold">Período:</Text>{' '}
                  {scheduleData.startDate} até {scheduleData.endDate}
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  <Text className="font-semibold">Total de doses:</Text>{' '}
                  {scheduleData.totalDoses} doses
                </Text>
              </View>
            </View>

            {/* Cronograma Diário Sugerido */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.warning}20` }}
                >
                  <Ionicons name="time" size={16} color={colors.warning} />
                </View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Horários Diários Sugeridos
                </Text>
              </View>

              {Array.from({ length: scheduleData.dosesPerDay }, (_, index) => {
                const doseTime = scheduleData.schedule.find(
                  s => s.doseNumber === index + 1
                )?.time;
                return (
                  <View
                    key={index}
                    className="flex-row items-center p-3 mb-2 rounded-xl"
                    style={{ backgroundColor: colors.surfaceSecondary }}
                  >
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: colors.warning }}
                    >
                      <Text className="text-white text-sm font-bold">
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      className="text-base font-semibold"
                      style={{ color: colors.text }}
                    >
                      Dose {index + 1}: {doseTime}{' '}
                      {index === 0 ? '(manhã)' : index === 1 ? '(noite)' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Cronograma Completo por Dias */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.secondary}20` }}
                >
                  <Ionicons name="list" size={16} color={colors.secondary} />
                </View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Cronograma Completo
                </Text>
              </View>

              <ScrollView
                className="max-h-64"
                showsVerticalScrollIndicator={false}
              >
                {Array.from(
                  { length: parseInt(durationDays) },
                  (_, dayIndex) => {
                    const dayNumber = dayIndex + 1;
                    const dayDoses = scheduleData.schedule.filter(
                      s => s.day === dayNumber
                    );

                    return (
                      <View key={dayNumber} className="mb-4">
                        <View
                          className="p-3 rounded-t-xl"
                          style={{ backgroundColor: `${colors.primary}15` }}
                        >
                          <Text
                            className="text-sm font-bold"
                            style={{ color: colors.primary }}
                          >
                            DIA {dayNumber} - {dayDoses[0]?.date}
                          </Text>
                        </View>
                        <View
                          className="p-3 rounded-b-xl border-l-2"
                          style={{
                            backgroundColor: colors.surfaceSecondary,
                            borderLeftColor: colors.primary,
                          }}
                        >
                          {dayDoses.map((dose, index) => (
                            <View
                              key={index}
                              className="flex-row items-center mb-2 last:mb-0"
                            >
                              <View
                                className="w-6 h-6 rounded-full items-center justify-center mr-3"
                                style={{ backgroundColor: colors.accent }}
                              >
                                <Text className="text-white text-xs font-bold">
                                  {dose.doseNumber}
                                </Text>
                              </View>
                              <Text
                                className="text-sm font-medium"
                                style={{ color: colors.text }}
                              >
                                {dose.time} - Dose {dose.doseNumber}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  }
                )}
              </ScrollView>
            </View>

            {/* Instruções Importantes */}
            <View
              className="p-4 rounded-2xl border"
              style={{
                backgroundColor: `${colors.warning}10`,
                borderColor: `${colors.warning}40`,
              }}
            >
              <View className="flex-row items-center mb-3">
                <Ionicons name="warning" size={20} color={colors.warning} />
                <Text
                  className="text-base font-bold ml-2"
                  style={{ color: colors.warning }}
                >
                  INSTRUÇÕES IMPORTANTES
                </Text>
              </View>
              <View className="space-y-2">
                <Text
                  className="text-sm leading-5"
                  style={{ color: colors.text }}
                >
                  • Para suspensões: Agite bem o frasco antes de cada uso
                </Text>
                <Text
                  className="text-sm leading-5"
                  style={{ color: colors.text }}
                >
                  • Utilize o copinho dosador ou seringa oral para medir com
                  precisão
                </Text>
                <Text
                  className="text-sm leading-5"
                  style={{ color: colors.text }}
                >
                  • Pode ser administrado com alimentos para reduzir desconforto
                </Text>
                <Text
                  className="text-sm leading-5"
                  style={{ color: colors.text }}
                >
                  • Mantenha intervalos regulares entre as doses
                </Text>
              </View>
            </View>

            {/* Estatística Final */}
            <View
              className="mt-6 p-4 rounded-2xl border-2 border-dashed"
              style={{
                backgroundColor: `${colors.accent}10`,
                borderColor: `${colors.accent}40`,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="items-center">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: colors.accent }}
                  >
                    {scheduleData.dosesPerDay}
                  </Text>
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    doses/dia
                  </Text>
                </View>
                <View className="items-center">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: colors.secondary }}
                  >
                    {durationDays}
                  </Text>
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    dias
                  </Text>
                </View>
                <View className="items-center">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {scheduleData.totalDoses}
                  </Text>
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    total
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Botão Salvar Premium */}
        <View className="mt-8">
          <TouchableOpacity
            onPress={handleSaveSchedule}
            disabled={isLoading}
            activeOpacity={0.8}
            style={{
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <LinearGradient
              colors={isLoading ? ['#9ca3af', '#6b7280'] : colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-6 shadow-2xl"
              style={{
                shadowColor: isLoading ? '#000' : colors.primary,
                shadowOpacity: 0.3,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
                elevation: 15,
              }}
            >
              <View className="flex-row items-center justify-center">
                {isLoading ? (
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full border-2 border-white border-t-transparent mr-3"
                      style={{
                        transform: [{ rotate: '0deg' }],
                      }}
                    />
                    <Text className="text-white text-lg font-bold">
                      Salvando...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <Ionicons name="rocket" size={24} color="white" />
                    </View>
                    <View>
                      <Text className="text-white text-xl font-bold">
                        Criar Cronograma
                      </Text>
                      <Text className="text-white/80 text-sm font-medium">
                        Iniciar tratamento
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
