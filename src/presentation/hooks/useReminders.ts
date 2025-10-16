import { useState, useCallback } from 'react';
import { DoseReminderEntity } from '../../domain/entities';
import { DoseReminderRepository } from '../../domain/repositories';

export interface UseRemindersReturn {
  todayReminders: DoseReminderEntity[];
  overdueReminders: DoseReminderEntity[];
  pendingReminders: DoseReminderEntity[];
  loading: boolean;
  error: string | null;
  loadTodayReminders: () => Promise<void>;
  markAsTaken: (reminderId: number) => Promise<void>;
  markAsSkipped: (reminderId: number) => Promise<void>;
}

export function useReminders(
  doseReminderRepository: DoseReminderRepository,
): UseRemindersReturn {
  const [todayReminders, setTodayReminders] = useState<DoseReminderEntity[]>(
    [],
  );
  const [overdueReminders, setOverdueReminders] = useState<
    DoseReminderEntity[]
  >([]);
  const [pendingReminders, setPendingReminders] = useState<
    DoseReminderEntity[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodayReminders = useCallback(async () => {
    console.log('🔵 [useReminders] Carregando lembretes do dia');
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      console.log('🔵 [useReminders] Buscando lembretes entre:', {
        startOfDay: startOfDay.toISOString(),
        tomorrow: tomorrow.toISOString(),
      });

      // Buscar lembretes do dia
      const reminders = await doseReminderRepository.findByDateRange(
        startOfDay,
        tomorrow,
      );

      console.log('🔵 [useReminders] Lembretes encontrados:', reminders.length);

      setTodayReminders(reminders);

      // Separar por categorias
      const overdue = reminders.filter(reminder => reminder.isOverdue());
      const pending = reminders.filter(reminder => reminder.isPending());

      console.log('🔵 [useReminders] Lembretes categorizados:', {
        total: reminders.length,
        overdue: overdue.length,
        pending: pending.length,
      });

      setOverdueReminders(overdue);
      setPendingReminders(pending);

      console.log('🟢 [useReminders] Lembretes carregados com sucesso');
    } catch (err) {
      console.error('🔴 [useReminders] Erro ao carregar lembretes:', err);
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar lembretes',
      );
    } finally {
      setLoading(false);
      console.log('🔵 [useReminders] Loading finalizado');
    }
  }, [doseReminderRepository]);

  const markAsTaken = useCallback(
    async (reminderId: number) => {
      console.log('🔵 [useReminders] markAsTaken iniciado, ID:', reminderId);
      try {
        console.log('🔵 [useReminders] Buscando lembrete...');
        const reminder = await doseReminderRepository.findById(reminderId);
        if (!reminder) {
          throw new Error('Lembrete não encontrado');
        }
        console.log('🔵 [useReminders] Lembrete encontrado:', reminder.id);

        console.log('🔵 [useReminders] Marcando como tomado...');
        const updatedReminder = reminder.markAsTaken();
        console.log('🔵 [useReminders] Estado após marcar:', {
          isTaken: updatedReminder.isTaken,
          isSkipped: updatedReminder.isSkipped,
          takenAt: updatedReminder.takenAt,
        });

        console.log('🔵 [useReminders] Atualizando no repositório...');
        await doseReminderRepository.update(updatedReminder);
        console.log('✅ [useReminders] Atualizado no repositório');

        console.log('🔵 [useReminders] Recarregando lembretes...');
        await loadTodayReminders();
        console.log('✅ [useReminders] markAsTaken concluído');
      } catch (err) {
        console.error('🔴 [useReminders] Erro em markAsTaken:', err);
        setError(
          err instanceof Error ? err.message : 'Erro ao marcar como tomado',
        );
      }
    },
    [doseReminderRepository, loadTodayReminders],
  );

  const markAsSkipped = useCallback(
    async (reminderId: number) => {
      console.log('🟡 [useReminders] markAsSkipped iniciado, ID:', reminderId);
      try {
        console.log('🟡 [useReminders] Buscando lembrete...');
        const reminder = await doseReminderRepository.findById(reminderId);
        if (!reminder) {
          throw new Error('Lembrete não encontrado');
        }
        console.log('🟡 [useReminders] Lembrete encontrado:', reminder.id);

        console.log('🟡 [useReminders] Marcando como pulado...');
        const updatedReminder = reminder.markAsSkipped();
        console.log('🟡 [useReminders] Estado após marcar:', {
          isTaken: updatedReminder.isTaken,
          isSkipped: updatedReminder.isSkipped,
        });

        console.log('🟡 [useReminders] Atualizando no repositório...');
        await doseReminderRepository.update(updatedReminder);
        console.log('✅ [useReminders] Atualizado no repositório');

        console.log('🟡 [useReminders] Recarregando lembretes...');
        await loadTodayReminders();
        console.log('✅ [useReminders] markAsSkipped concluído');
      } catch (err) {
        console.error('🔴 [useReminders] Erro em markAsSkipped:', err);
        setError(
          err instanceof Error ? err.message : 'Erro ao marcar como pulado',
        );
      }
    },
    [doseReminderRepository, loadTodayReminders],
  );

  return {
    todayReminders,
    overdueReminders,
    pendingReminders: pendingReminders,
    loading,
    error,
    loadTodayReminders,
    markAsTaken,
    markAsSkipped,
  };
}
