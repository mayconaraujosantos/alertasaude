import {
  MedicineRepository,
  ScheduleRepository,
  DoseReminderRepository,
} from '../repositories';

export interface ExportData {
  exportDate: string;
  version: string;
  data: {
    medicines: any[];
    schedules: any[];
    doseReminders: any[];
  };
  stats: {
    medicines: number;
    schedules: number;
    doseReminders: number;
  };
}

export class ExportDatabaseUseCase {
  constructor(
    private medicineRepository: MedicineRepository,
    private scheduleRepository: ScheduleRepository,
    private doseReminderRepository: DoseReminderRepository,
  ) {}

  async execute(): Promise<ExportData> {
    try {
      // Get all data from repositories
      const [medicines, schedules, reminders] = await Promise.all([
        this.medicineRepository.findAll(),
        this.scheduleRepository.findAll(),
        this.doseReminderRepository.findAll(),
      ]);

      // Convert entities to persistence format
      const medicineData = medicines.map(medicine => medicine.toPersistence());
      const scheduleData = schedules.map(schedule => schedule.toPersistence());
      const reminderData = reminders.map(reminder => reminder.toPersistence());

      const exportData: ExportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: {
          medicines: medicineData,
          schedules: scheduleData,
          doseReminders: reminderData,
        },
        stats: {
          medicines: medicines.length,
          schedules: schedules.length,
          doseReminders: reminders.length,
        },
      };

      return exportData;
    } catch (error) {
      console.error('Error exporting database:', error);
      throw new Error('Falha ao exportar dados do banco');
    }
  }

  async exportAsJSON(): Promise<string> {
    try {
      const exportData = await this.execute();
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting as JSON:', error);
      throw new Error('Falha ao exportar como JSON');
    }
  }
}
