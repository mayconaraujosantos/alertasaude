import React, { useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { useReminders } from '../hooks/useReminders';
import { DIContainer } from '../../infrastructure/di/DIContainer';
import { DoseReminderEntity } from '../../domain/entities';
import UserHeader from '../components/UserHeader';

function HomeScreen() {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const { colors, styles } = useSystemTheme();

  // Dependency Injection - USANDO DRIZZLE ORM
  const diContainer = DIContainer.getInstance();
  const doseReminderRepository = diContainer.drizzleDoseReminderRepository;

  // Using the new hook with clean architecture
  const {
    todayReminders,
    overdueReminders,
    loading,
    loadTodayReminders,
    markAsTaken,
    markAsSkipped,
  } = useReminders(doseReminderRepository);

  // Função para debug simples dos dados no banco
  const debugDatabase = useCallback(async () => {
    try {
      console.log('🔍 [HomeScreen] Debug simples iniciado...');

      // Aguardar um pouco para não interferir com a migração
      await new Promise(resolve => setTimeout(resolve, 2000));

      const dbManager = DIContainer.getInstance().databaseManager;

      try {
        const db = await dbManager.getDatabase();
        console.log('🔍 [HomeScreen] Database conectado para debug');

        // Verificar se as tabelas existem
        const tables = await db.getAllAsync(
          "SELECT name FROM sqlite_master WHERE type='table'",
        );
        console.log(
          '🔍 [HomeScreen] Tabelas no banco:',
          tables.map(t => (t as { name: string }).name),
        );

        // Tentar buscar dados apenas se as tabelas existirem
        try {
          const medicineCount = await db.getFirstAsync(
            'SELECT COUNT(*) as count FROM medicines',
          );
          console.log('🔍 [HomeScreen] Total de medicamentos:', medicineCount);

          const reminderCount = await db.getFirstAsync(
            'SELECT COUNT(*) as count FROM dose_reminders',
          );
          console.log('🔍 [HomeScreen] Total de lembretes:', reminderCount);
        } catch (tableError) {
          console.log(
            '🔍 [HomeScreen] Tabelas ainda não estão prontas:',
            tableError,
          );
        }
      } catch (dbError) {
        console.log('🔍 [HomeScreen] Database ainda não está pronto:', dbError);
      }
    } catch (error) {
      console.error('🔴 [HomeScreen] Erro no debug simples:', error);
    }
  }, []);

  // Função para inserir dados de teste via SQL direto
  const insertTestData = useCallback(async () => {
    try {
      console.log('🧪 [HomeScreen] Inserindo dados de teste via SQL...');

      const dbManager = DIContainer.getInstance().databaseManager;
      const db = await dbManager.getDatabase();

      // Verificar se existem lembretes
      const existingReminders = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM dose_reminders',
      );

      if ((existingReminders as { count: number }).count > 0) {
        console.log('🧪 [HomeScreen] Dados já existem, pulando inserção');
        return;
      }

      // Buscar um medicamento existente ou criar um
      let medicine = await db.getFirstAsync('SELECT id FROM medicines LIMIT 1');

      if (!medicine) {
        console.log('🧪 [HomeScreen] Criando medicamento de teste...');
        await db.runAsync(
          `INSERT INTO medicines (name, description, dosage, quantidade, unidade, forma, createdAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'Paracetamol 500mg',
            'Analgésico e antitérmico',
            '500mg',
            '1',
            'comprimido',
            'comprimido',
            new Date().toISOString(),
          ],
        );

        medicine = await db.getFirstAsync(
          'SELECT id FROM medicines WHERE name = ?',
          ['Paracetamol 500mg'],
        );
      }

      console.log(
        '🧪 [HomeScreen] Usando medicamento ID:',
        (medicine as { id: number }).id,
      );

      // Verificar se existe schedule ou criar um
      let schedule = await db.getFirstAsync(
        'SELECT id FROM schedules WHERE medicineId = ? LIMIT 1',
        [(medicine as { id: number }).id],
      );

      if (!schedule) {
        console.log('🧪 [HomeScreen] Criando schedule...');
        await db.runAsync(
          `INSERT INTO schedules (medicineId, intervalHours, durationDays, startTime, isActive, createdAt) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            (medicine as { id: number }).id,
            8, // a cada 8 horas
            7, // por 7 dias
            '08:00',
            1, // ativo
            new Date().toISOString(),
          ],
        );

        schedule = await db.getFirstAsync(
          'SELECT id FROM schedules WHERE medicineId = ? ORDER BY id DESC LIMIT 1',
          [(medicine as { id: number }).id],
        );

        console.log(
          '🧪 [HomeScreen] Schedule criado ID:',
          (schedule as { id: number }).id,
        );
      }

      // Criar lembretes para hoje
      const today = new Date();
      const times = ['08:00', '14:00', '20:00'];

      for (const time of times) {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hours,
          minutes,
        );

        await db.runAsync(
          `INSERT INTO dose_reminders (scheduleId, medicineId, scheduledTime, taken, createdAt) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            (schedule as { id: number }).id,
            (medicine as { id: number }).id,
            scheduledTime.toISOString(),
            0,
            new Date().toISOString(),
          ],
        );

        console.log(`🧪 [HomeScreen] Lembrete criado para ${time}`);
      }

      console.log('🧪 [HomeScreen] Todos os dados de teste inseridos!');
    } catch (error) {
      console.error('🔴 [HomeScreen] Erro ao inserir dados de teste:', error);
    }
  }, []); // Use useFocusEffect to ensure reload when screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log('👁️ [HomeScreen] Screen focused, reloading reminders...');

      const initializeAndLoadData = async () => {
        try {
          // 1. Inicializar o Drizzle Database primeiro
          console.log('🔵 [HomeScreen] Inicializando Drizzle Database...');
          const drizzleDbManager =
            DIContainer.getInstance().drizzleDatabaseManager;
          await drizzleDbManager.initDatabase();
          console.log('🟢 [HomeScreen] Drizzle Database inicializado!');

          // 2. Debug do banco (usando o antigo ainda)
          await debugDatabase();

          // 3. Inserir dados de teste (usando o antigo ainda)
          await insertTestData();

          // 4. Carregar lembretes usando Drizzle
          console.log('🔵 [HomeScreen] Carregando lembretes com Drizzle...');
          await loadTodayReminders();
        } catch (error) {
          console.error('🔴 [HomeScreen] Erro na inicialização:', error);
        }
      };

      initializeAndLoadData();
    }, [loadTodayReminders, insertTestData]),
  );

  const handleMarkAsTaken = async (reminderId: number) => {
    try {
      await markAsTaken(reminderId);
    } catch (err) {
      console.error('Error marking as taken:', err);
    }
  };

  const handleMarkAsSkipped = async (reminderId: number) => {
    try {
      await markAsSkipped(reminderId);
    } catch (err) {
      console.error('Error marking as skipped:', err);
    }
  };

  const renderReminderItem = ({ item }: { item: DoseReminderEntity }) => (
    <View
      style={[
        {
          backgroundColor: colors.card,
          padding: 16,
          marginBottom: 8,
          borderRadius: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
          ]}
        >
          Medicamento #{item.medicineId}
        </Text>
        <Text style={[{ color: colors.text.secondary, fontSize: 14 }]}>
          {item.scheduledTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => handleMarkAsTaken(item.id!)}
          style={{
            backgroundColor: '#10B981',
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMarkAsSkipped(item.id!)}
          style={{
            backgroundColor: '#F59E0B',
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => {
    console.log('🎯 [HomeScreen] EmptyState sendo renderizado!');
    return (
      <View style={{ alignItems: 'center', padding: 32 }}>
        <Ionicons
          name="medical-outline"
          size={64}
          color={colors.text.secondary}
        />
        <Text
          style={[
            {
              color: colors.text.primary,
              fontSize: 18,
              fontWeight: '600',
              marginTop: 16,
            },
          ]}
        >
          Nenhum lembrete para hoje
        </Text>
        <Text
          style={[
            {
              color: colors.text.secondary,
              fontSize: 14,
              textAlign: 'center',
              marginTop: 8,
            },
          ]}
        >
          Adicione medicamentos e configure horários para receber lembretes
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Medicines')}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 16,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Ver Medicamentos
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Debug logs
  console.log('🎯 [HomeScreen] Estado atual:', {
    loading,
    todayRemindersLength: todayReminders.length,
    overdueRemindersLength: overdueReminders.length,
  });

  if (loading && todayReminders.length === 1) {
    console.log('🎯 [HomeScreen] Mostrando loading...');
    return (
      <SafeAreaView
        style={[
          { flex: 1, justifyContent: 'center', alignItems: 'center' },
          styles.container,
        ]}
      >
        <Text style={[{ color: colors.text.secondary }]}>
          Carregando lembretes...
        </Text>
      </SafeAreaView>
    );
  }

  console.log('🎯 [HomeScreen] Renderizando tela principal');

  return (
    <SafeAreaView style={[{ flex: 1 }, styles.container]}>
      <UserHeader
        title="Seus Lembretes"
        subtitle="Hoje"
        iconName="settings-outline"
        onIconPress={() => navigation.navigate('AdminScreen')}
        showAddButton={true}
        onAddPress={() => navigation.navigate('Medicines')}
      />
      <View style={{ padding: 16 }}>
        {overdueReminders.length > 0 && (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Ionicons name="warning-outline" size={20} color="#EF4444" />
              <Text
                style={{ color: '#DC2626', fontWeight: '600', marginLeft: 8 }}
              >
                {overdueReminders.length} dose(s) atrasada(s)
              </Text>
            </View>
            <Text style={{ color: '#DC2626', fontSize: 14 }}>
              Você tem doses em atraso. Marque como tomada ou pulada.
            </Text>
          </View>
        )}

        <FlatList
          data={todayReminders}
          renderItem={renderReminderItem}
          keyExtractor={item => item.id?.toString() || ''}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={todayReminders.length === 0 ? { flex: 1 } : {}}
        />
      </View>
    </SafeAreaView>
  );
}

export default HomeScreen;
