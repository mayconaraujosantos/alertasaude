import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseManager } from '../database/DatabaseManager';
import { BackupService } from '../services/BackupService';
import { NotificationService } from '../services/NotificationService';

interface DatabaseStats {
  medicines: number;
  schedules: number;
  doseReminders: number;
  scheduledNotifications: number;
}

interface AdminCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}

const AdminCard: React.FC<AdminCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
}) => (
  <TouchableOpacity
    style={[styles.card, danger ? styles.dangerCard : styles.normalCard]}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <View
        style={[
          styles.iconContainer,
          danger ? styles.dangerIconBg : styles.normalIconBg,
        ]}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={danger ? '#ef4444' : '#3b82f6'}
        />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            danger ? styles.dangerTitle : styles.normalTitle,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            danger ? styles.dangerSubtitle : styles.normalSubtitle,
          ]}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </View>
  </TouchableOpacity>
);

const AdminScreen = ({ navigation }: { navigation: any }) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const medicines = await databaseManager.getAllMedicines();
      const schedules = await databaseManager.getAllSchedules();
      const reminders = await databaseManager.getTodayReminders();
      const notifications =
        await NotificationService.getScheduledNotifications();

      setStats({
        medicines: medicines.length,
        schedules: schedules.length,
        doseReminders: reminders.length,
        scheduledNotifications: notifications.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToConsole = async () => {
    try {
      setLoading(true);

      const medicines = await databaseManager.getAllMedicines();
      const schedules = await databaseManager.getAllSchedules();
      const allReminders = await databaseManager.getAllDoseReminders();

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: { medicines, schedules, doseReminders: allReminders },
        stats: stats,
      };

      console.log('📦 BACKUP DATA:');
      console.log('=====================================');
      console.log(JSON.stringify(exportData, null, 2));
      console.log('=====================================');

      Alert.alert('✅ Exportado', 'Dados exportados para o console!');
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert('❌ Erro', 'Não foi possível exportar');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      '🗑️ Limpar Dados',
      'Deletar todos os medicamentos e agendamentos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => {
            (async () => {
              try {
                setLoading(true);
                await NotificationService.cancelAllNotifications();
                await databaseManager.clearAllData();
                Alert.alert('✅ Concluído', 'Dados removidos');
                await loadStats();
              } catch (error: any) {
                console.error('Error clearing data:', error);
                Alert.alert('❌ Erro', 'Não foi possível limpar');
              } finally {
                setLoading(false);
              }
            })();
          },
        },
      ]
    );
  };

  const debugDatabase = async () => {
    try {
      setLoading(true);

      console.log(
        '🔍 ================== DEBUG DATABASE START =================='
      );

      // Informações do banco de dados
      const dbPath = databaseManager.getDatabasePath();
      console.log('📂 Database Path:', dbPath);

      // Informações das tabelas
      await databaseManager.getTableInfo();

      // Dados das tabelas
      const medicines = await databaseManager.getAllMedicines();
      const schedules = await databaseManager.getAllSchedules();
      const reminders = await databaseManager.getAllDoseReminders();
      const notifications =
        await NotificationService.getScheduledNotifications();

      console.log('💊 Medicines (' + medicines.length + '):', medicines);
      console.log('📅 Schedules (' + schedules.length + '):', schedules);
      console.log('⏰ Reminders (' + reminders.length + '):', reminders);
      console.log(
        '🔔 Notifications (' + notifications.length + '):',
        notifications
      );

      console.log(
        '🔍 ================== DEBUG DATABASE END =================='
      );

      Alert.alert(
        '🔍 Database Debug',
        `Informações exportadas para o console!\n\n📂 Caminho do banco:\n${dbPath}\n\n💡 Para visualizar no VS Code:\n1. Instale a extensão "SQLite Viewer"\n2. Abra o arquivo .db do caminho acima`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Debug error:', error);
      Alert.alert('❌ Erro', 'Erro no debug');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      await NotificationService.sendImmediateNotification(
        '🧪 Teste',
        'Notificação de teste!'
      );
      Alert.alert('✅ Enviado', 'Teste enviado!');
    } catch (error: any) {
      console.error('Test notification error:', error);
      Alert.alert('❌ Erro', 'Erro no teste');
    }
  };

  const createBackup = async () => {
    try {
      setLoading(true);
      const backupData = await BackupService.createLocalBackup();

      Alert.alert(
        '✅ Backup Criado',
        `Backup local criado com sucesso!\n\nData: ${new Date(backupData.createdAt).toLocaleString()}\nVersão: ${backupData.version}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Backup error:', error);
      Alert.alert('❌ Erro', 'Não foi possível criar backup');
    } finally {
      setLoading(false);
    }
  };

  const exportBackupJSON = async () => {
    try {
      setLoading(true);
      const jsonData = await BackupService.exportBackupAsJSON();

      console.log('📦 BACKUP JSON:');
      console.log('=====================================');
      console.log(jsonData);
      console.log('=====================================');

      Alert.alert(
        '📦 Backup Exportado',
        'Backup completo exportado para o console. Copie o JSON para restaurar em outro dispositivo.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Export error:', error);
      Alert.alert('❌ Erro', 'Não foi possível exportar backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administração</Text>
        <TouchableOpacity onPress={loadStats}>
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Estatísticas</Text>
          {stats ? (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Medicamentos</Text>
                <Text style={styles.statValue}>{stats.medicines}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Agendamentos</Text>
                <Text style={styles.statValue}>{stats.schedules}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Lembretes</Text>
                <Text style={styles.statValue}>{stats.doseReminders}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Notificações</Text>
                <Text style={styles.statValue}>
                  {stats.scheduledNotifications}
                </Text>
              </View>
            </View>
          ) : (
            <ActivityIndicator color="white" />
          )}
        </View>

        <Text style={styles.sectionTitle}>🛠️ Ferramentas</Text>

        <AdminCard
          icon="download"
          title="Exportar para Console"
          subtitle="Exportar dados do banco para console"
          onPress={exportToConsole}
        />

        <AdminCard
          icon="bug"
          title="Debug Database"
          subtitle="Visualizar informações no console"
          onPress={debugDatabase}
        />

        <AdminCard
          icon="notifications"
          title="Testar Notificação"
          subtitle="Enviar notificação de teste"
          onPress={testNotification}
        />

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
          💾 Backup Local
        </Text>

        <AdminCard
          icon="cloud-upload"
          title="Criar Backup Local"
          subtitle="Salvar dados no dispositivo"
          onPress={createBackup}
        />

        <AdminCard
          icon="share"
          title="Exportar Backup JSON"
          subtitle="Gerar backup para transferir"
          onPress={exportBackupJSON}
        />

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
          ⚠️ Zona Perigosa
        </Text>

        <AdminCard
          icon="trash"
          title="Limpar Todos os Dados"
          subtitle="Remove tudo do banco"
          onPress={clearAllData}
          danger={true}
        />
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Processando...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    backgroundColor: '#3b82f6',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  statsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    marginBottom: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  normalCard: {
    backgroundColor: '#f9fafb',
  },
  dangerCard: {
    backgroundColor: '#fef2f2',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  normalIconBg: {
    backgroundColor: '#dbeafe',
  },
  dangerIconBg: {
    backgroundColor: '#fee2e2',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  normalTitle: {
    color: '#374151',
  },
  dangerTitle: {
    color: '#dc2626',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  normalSubtitle: {
    color: '#6b7280',
  },
  dangerSubtitle: {
    color: '#dc2626',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 8,
  },
});

export default AdminScreen;
