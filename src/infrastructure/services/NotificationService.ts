import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar como as notificações devem ser tratadas quando o app está em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  // Configurar permissões de notificação
  static async setupNotifications(): Promise<boolean> {
    try {
      console.log('🔔 [NotificationService] Setting up notifications...');

      // Solicitar permissões
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ [NotificationService] Permission denied');
        return false;
      }

      console.log('✅ [NotificationService] Permission granted');

      // Configurar canal de notificação para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(
          'medication-reminders',
          {
            name: 'Lembretes de Medicamento',
            description: 'Notificações para lembrar de tomar medicamentos',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
          },
        );
        console.log('📱 [NotificationService] Android channel configured');
      }

      return true;
    } catch (error) {
      console.error('❌ [NotificationService] Setup error:', error);
      return false;
    }
  }

  // Agendar notificação para um lembrete específico
  static async scheduleMedicationReminder(reminderData: {
    id: number;
    medicineName: string;
    dosage: string;
    scheduledTime: string;
  }): Promise<string | null> {
    try {
      const scheduledDate = new Date(reminderData.scheduledTime);
      const now = new Date();

      // Só agendar se a data for no futuro
      if (scheduledDate <= now) {
        console.log(
          '⏰ [NotificationService] Scheduled time is in the past, skipping',
        );
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Hora do Medicamento!',
          body: `${reminderData.medicineName} - ${reminderData.dosage}`,
          data: {
            type: 'medication_reminder',
            reminderId: reminderData.id,
            medicineName: reminderData.medicineName,
            dosage: reminderData.dosage,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { date: scheduledDate } as Notifications.DateTriggerInput,
      });

      console.log(
        `🔔 [NotificationService] Scheduled notification ${notificationId} for ${reminderData.medicineName} at ${scheduledDate.toLocaleString()}`,
      );
      return notificationId;
    } catch (error) {
      console.error(
        '❌ [NotificationService] Error scheduling notification:',
        error,
      );
      return null;
    }
  }

  // Cancelar uma notificação específica
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(
        `🔕 [NotificationService] Cancelled notification ${notificationId}`,
      );
    } catch (error) {
      console.error(
        '❌ [NotificationService] Error cancelling notification:',
        error,
      );
    }
  }

  // Cancelar todas as notificações pendentes
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🔕 [NotificationService] Cancelled all notifications');
    } catch (error) {
      console.error(
        '❌ [NotificationService] Error cancelling all notifications:',
        error,
      );
    }
  }

  // Listar todas as notificações agendadas
  static async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      console.log(
        `📋 [NotificationService] Found ${notifications.length} scheduled notifications`,
      );
      return notifications;
    } catch (error) {
      console.error(
        '❌ [NotificationService] Error getting scheduled notifications:',
        error,
      );
      return [];
    }
  }

  // Enviar notificação imediata (para testes)
  static async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Enviar imediatamente
      });

      console.log(
        `🔔 [NotificationService] Sent immediate notification: ${title}`,
      );
      return notificationId;
    } catch (error) {
      console.error(
        '❌ [NotificationService] Error sending immediate notification:',
        error,
      );
      throw error;
    }
  }

  // Agendar lembrete antecipado (15 minutos antes)
  static async scheduleEarlyReminder(reminderData: {
    id: number;
    medicineName: string;
    dosage: string;
    scheduledTime: string;
  }): Promise<string | null> {
    try {
      const scheduledDate = new Date(reminderData.scheduledTime);
      const earlyReminderDate = new Date(
        scheduledDate.getTime() - 15 * 60 * 1000,
      ); // 15 minutos antes
      const now = new Date();

      // Só agendar se a data for no futuro
      if (earlyReminderDate <= now) {
        console.log(
          '⏰ [NotificationService] Early reminder time is in the past, skipping',
        );
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Lembrete Antecipado',
          body: `Em 15 minutos: ${reminderData.medicineName} - ${reminderData.dosage}`,
          data: {
            type: 'early_reminder',
            reminderId: reminderData.id,
            medicineName: reminderData.medicineName,
            dosage: reminderData.dosage,
          },
          sound: 'default',
        },
        trigger: { date: earlyReminderDate } as Notifications.DateTriggerInput,
      });

      console.log(
        `⏰ [NotificationService] Scheduled early reminder for ${reminderData.medicineName} at ${earlyReminderDate.toLocaleString()}`,
      );
      return notificationId;
    } catch (error) {
      console.error(
        '❌ [NotificationService] Error scheduling early reminder:',
        error,
      );
      return null;
    }
  }
}
