import {
  MedicineRepository,
  ScheduleRepository,
  DoseReminderRepository,
} from '../repositories';

export interface DatabaseStats {
  medicines: number;
  schedules: number;
  doseReminders: number;
  totalUsers?: number;
}

export class GetDatabaseStatsUseCase {
  constructor(
    private medicineRepository: MedicineRepository,
    private scheduleRepository: ScheduleRepository,
    private doseReminderRepository: DoseReminderRepository,
  ) {}

  async execute(): Promise<DatabaseStats> {
    try {
      // Get all data to calculate statistics
      const [medicines, schedules, reminders] = await Promise.all([
        this.medicineRepository.findAll(),
        this.scheduleRepository.findAll(),
        this.doseReminderRepository.findAll(),
      ]);

      return {
        medicines: medicines.length,
        schedules: schedules.length,
        doseReminders: reminders.length,
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw new Error('Falha ao obter estatísticas do banco de dados');
    }
  }

  async getTodayStats(): Promise<DatabaseStats & { todayReminders: number }> {
    try {
      const baseStats = await this.execute();

      // Get today's reminders
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const todayReminders = await this.doseReminderRepository.findByDateRange(
        startOfDay,
        endOfDay,
      );

      return {
        ...baseStats,
        todayReminders: todayReminders.length,
      };
    } catch (error) {
      console.error('Error getting today stats:', error);
      throw new Error('Falha ao obter estatísticas de hoje');
    }
  }
}
