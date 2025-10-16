import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModal } from '../../hooks/useModal';
import { DIContainer } from '../../infrastructure/di/DIContainer';

interface DatabaseStats {
  medicines: number;
  schedules: number;
  doseReminders: number;
  todayReminders?: number;
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
          name={icon as keyof typeof Ionicons.glyphMap}
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

interface AdminScreenProps {
  onGoBack?: () => void;
  onNavigateToDebug?: () => void;
}

export default function AdminScreen({
  onGoBack,
  onNavigateToDebug,
}: AdminScreenProps) {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);

  const { Modal, showError, showSuccess, showConfirm } = useModal();

  // Dependency Injection
  const diContainer = DIContainer.getInstance();
  const getDatabaseStatsUseCase = diContainer.getDatabaseStatsUseCase;
  const exportDatabaseUseCase = diContainer.exportDatabaseUseCase;
  const clearDatabaseUseCase = diContainer.clearDatabaseUseCase;

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      console.log('Go back action not provided');
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await getDatabaseStatsUseCase.getTodayStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      showError('Erro', 'Não foi possível carregar as estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const exportToConsole = async () => {
    try {
      setLoading(true);

      const exportData = await exportDatabaseUseCase.execute();

      console.log('📦 BACKUP DATA:');
      console.log('=====================================');
      console.log(JSON.stringify(exportData, null, 2));
      console.log('=====================================');

      showSuccess('✅ Exportado', 'Dados exportados para o console!');
    } catch (error) {
      console.error('Error exporting:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      showError('❌ Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    showConfirm(
      '🗑️ Limpar Dados',
      'Deletar todos os medicamentos e agendamentos? Esta ação não pode ser desfeita.',
      async () => {
        try {
          setLoading(true);
          await clearDatabaseUseCase.execute();
          showSuccess('✅ Concluído', 'Dados removidos com sucesso');
          await loadStats(); // Refresh stats
        } catch (error) {
          console.error('Error clearing data:', error);
          const errorMessage =
            error instanceof Error ? error.message : 'Erro desconhecido';
          showError('❌ Erro', errorMessage);
        } finally {
          setLoading(false);
        }
      },
    );
  };

  const debugDatabase = async () => {
    try {
      setLoading(true);

      console.log(
        '🔍 ================== DEBUG DATABASE START ==================',
      );

      // Export data for debugging
      const exportData = await exportDatabaseUseCase.execute();
      const statsData = await getDatabaseStatsUseCase.execute();

      console.log('📊 Database Stats:', statsData);
      console.log('💊 Medicines:', exportData.data.medicines);
      console.log('📅 Schedules:', exportData.data.schedules);
      console.log('⏰ Reminders:', exportData.data.doseReminders);

      console.log(
        '🔍 ================== DEBUG DATABASE END ==================',
      );

      showSuccess(
        '🔍 Database Debug',
        'Informações exportadas para o console! Verifique o terminal para ver os dados.',
      );

      // Navigate to debug screen if handler provided
      if (onNavigateToDebug) {
        onNavigateToDebug();
      }
    } catch (error) {
      console.error('Debug error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      showError('❌ Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportBackupJSON = async () => {
    try {
      setLoading(true);
      const jsonData = await exportDatabaseUseCase.exportAsJSON();

      console.log('📦 BACKUP JSON:');
      console.log('=====================================');
      console.log(jsonData);
      console.log('=====================================');

      showSuccess(
        '📦 Backup Exportado',
        'Backup completo exportado para o console. Copie o JSON para restaurar em outro dispositivo.',
      );
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      showError('❌ Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      // For now, just show a test notification via alert
      showSuccess('🧪 Teste', 'Notificação de teste executada!');
    } catch (error) {
      console.error('Test notification error:', error);
      showError('❌ Erro', 'Erro no teste de notificação');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
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
                <Text style={styles.statLabel}>Hoje</Text>
                <Text style={styles.statValue}>
                  {stats.todayReminders || 0}
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

      <Modal />
    </SafeAreaView>
  );
}

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
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  normalCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dangerCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  normalTitle: {
    color: '#374151',
  },
  dangerTitle: {
    color: '#dc2626',
  },
  subtitle: {
    fontSize: 14,
  },
  normalSubtitle: {
    color: '#6b7280',
  },
  dangerSubtitle: {
    color: '#991b1b',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
  },
});
