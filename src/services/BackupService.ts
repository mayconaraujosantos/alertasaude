/**
 * Serviço de Backup - Estratégia Híbrida
 *
 * Mantém SQLite como principal mas oferece opções de backup/restauração
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { databaseManager } from '../database/DatabaseManager';
import { NotificationService } from './NotificationService';

export interface BackupData {
  version: string;
  createdAt: string;
  deviceInfo: {
    platform: string;
    version: string;
  };
  data: {
    medicines: any[];
    schedules: any[];
    doseReminders: any[];
  };
  settings: {
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
}

export class BackupService {
  private static readonly BACKUP_KEY = 'medication_backup';
  private static readonly VERSION = '1.0.0';

  /**
   * Cria backup completo dos dados locais
   */
  static async createLocalBackup(): Promise<BackupData> {
    try {
      console.log('📦 Creating local backup...');

      // Exportar dados do SQLite
      const medicines = await databaseManager.getAllMedicines();
      const schedules = await databaseManager.getAllSchedules();
      const doseReminders = await databaseManager.getAllDoseReminders();

      // Exportar configurações do AsyncStorage
      const settings = {
        notificationsEnabled:
          (await AsyncStorage.getItem('notificationsEnabled')) === 'true',
        soundEnabled: (await AsyncStorage.getItem('soundEnabled')) !== 'false',
        vibrationEnabled:
          (await AsyncStorage.getItem('vibrationEnabled')) !== 'false',
      };

      const backupData: BackupData = {
        version: this.VERSION,
        createdAt: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: this.VERSION,
        },
        data: {
          medicines,
          schedules,
          doseReminders,
        },
        settings,
      };

      // Salvar backup local
      await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData));
      console.log('✅ Local backup created successfully');

      return backupData;
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      throw new Error('Não foi possível criar o backup');
    }
  }

  /**
   * Restaura backup local
   */
  static async restoreLocalBackup(): Promise<boolean> {
    try {
      console.log('🔄 Restoring local backup...');

      const backupString = await AsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupString) {
        throw new Error('Nenhum backup local encontrado');
      }

      const backupData: BackupData = JSON.parse(backupString);

      // Validar versão do backup
      if (!this.isBackupCompatible(backupData)) {
        throw new Error('Backup incompatível com esta versão do app');
      }

      // Limpar dados existentes
      await NotificationService.cancelAllNotifications();
      await databaseManager.clearAllData();

      // Restaurar dados
      await databaseManager.importData(backupData.data);

      // Restaurar configurações
      await AsyncStorage.setItem(
        'notificationsEnabled',
        backupData.settings.notificationsEnabled.toString()
      );
      await AsyncStorage.setItem(
        'soundEnabled',
        backupData.settings.soundEnabled.toString()
      );
      await AsyncStorage.setItem(
        'vibrationEnabled',
        backupData.settings.vibrationEnabled.toString()
      );

      console.log('✅ Local backup restored successfully');
      return true;
    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      throw error;
    }
  }

  /**
   * Exporta backup como JSON para compartilhamento
   */
  static async exportBackupAsJSON(): Promise<string> {
    try {
      const backupData = await this.createLocalBackup();
      return JSON.stringify(backupData, null, 2);
    } catch (error) {
      console.error('❌ Error exporting backup as JSON:', error);
      throw error;
    }
  }

  /**
   * Importa backup de JSON
   */
  static async importBackupFromJSON(jsonString: string): Promise<boolean> {
    try {
      const backupData: BackupData = JSON.parse(jsonString);

      if (!this.isBackupCompatible(backupData)) {
        throw new Error('Backup incompatível');
      }

      // Salvar como backup local e depois restaurar
      await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData));
      return await this.restoreLocalBackup();
    } catch (error) {
      console.error('❌ Error importing backup from JSON:', error);
      throw error;
    }
  }

  /**
   * Verifica se há backup local disponível
   */
  static async hasLocalBackup(): Promise<boolean> {
    try {
      const backup = await AsyncStorage.getItem(this.BACKUP_KEY);
      return backup !== null;
    } catch {
      return false;
    }
  }

  /**
   * Obtém informações do backup local
   */
  static async getLocalBackupInfo(): Promise<{
    createdAt: string;
    version: string;
  } | null> {
    try {
      const backupString = await AsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupString) return null;

      const backup: BackupData = JSON.parse(backupString);
      return {
        createdAt: backup.createdAt,
        version: backup.version,
      };
    } catch {
      return null;
    }
  }

  /**
   * Remove backup local
   */
  static async clearLocalBackup(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.BACKUP_KEY);
      console.log('🗑️ Local backup cleared');
    } catch (error) {
      console.error('❌ Error clearing local backup:', error);
    }
  }

  /**
   * Verifica compatibilidade do backup
   */
  private static isBackupCompatible(backup: BackupData): boolean {
    // Verificar se tem estrutura mínima
    if (!backup.data || !backup.version) {
      return false;
    }

    // Verificar se tem arrays necessários
    if (
      !Array.isArray(backup.data.medicines) ||
      !Array.isArray(backup.data.schedules)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Backup automático silencioso (executar periodicamente)
   */
  static async createAutoBackup(): Promise<void> {
    try {
      // Verificar se passou tempo suficiente desde último backup
      const lastBackup = await this.getLocalBackupInfo();
      const now = new Date();
      const daysSinceBackup = lastBackup
        ? Math.floor(
            (now.getTime() - new Date(lastBackup.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 999;

      // Fazer backup automático a cada 7 dias
      if (daysSinceBackup >= 7) {
        await this.createLocalBackup();
        console.log('🔄 Auto backup completed');
      }
    } catch (error) {
      console.error('❌ Auto backup failed:', error);
      // Não mostrar erro para usuário em backup automático
    }
  }
}
