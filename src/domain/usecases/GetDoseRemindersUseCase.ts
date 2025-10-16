import { DoseReminderEntity } from '../entities';
import { DoseReminderRepository } from '../repositories';

interface DoseReminderWithMedicine {
  id?: number;
  scheduleId: number;
  medicineId: number;
  scheduledTime: Date;
  takenAt?: Date;
  isTaken: boolean;
  isSkipped: boolean;
  createdAt: Date;
  medicineName: string;
  dosage: string;
}

export class GetDoseRemindersUseCase {
  constructor(private doseReminderRepository: DoseReminderRepository) {}

  async execute(
    medicineId?: number,
    taken?: boolean,
    startDate?: Date,
    endDate?: Date,
  ): Promise<DoseReminderWithMedicine[]> {
    try {
      let reminders: DoseReminderEntity[] = [];

      // Apply filters based on parameters
      if (startDate && endDate) {
        reminders = await this.doseReminderRepository.findByDateRange(
          startDate,
          endDate,
        );
      } else if (medicineId) {
        reminders =
          await this.doseReminderRepository.findByMedicineId(medicineId);
      } else if (taken === true) {
        reminders = await this.doseReminderRepository.findTaken();
      } else {
        reminders = await this.doseReminderRepository.findAll();
      }

      // Apply additional filters if needed
      if (taken !== undefined && !(startDate && endDate)) {
        reminders = reminders.filter(r => r.isTaken === taken);
      }

      if (medicineId && !(startDate && endDate)) {
        reminders = reminders.filter(r => r.medicineId === medicineId);
      }

      // For now, we'll need to get medicine info for each reminder
      // This could be optimized with a join query in the future
      const remindersWithMedicine: DoseReminderWithMedicine[] = [];

      for (const reminder of reminders) {
        // For now, we'll use placeholder medicine data
        // In a real implementation, this would come from the database
        const medicineInfo = await this.getMedicineInfo(reminder.medicineId);

        remindersWithMedicine.push({
          id: reminder.id,
          scheduleId: reminder.scheduleId,
          medicineId: reminder.medicineId,
          scheduledTime: reminder.scheduledTime,
          takenAt: reminder.takenAt,
          isTaken: reminder.isTaken,
          isSkipped: reminder.isSkipped,
          createdAt: reminder.createdAt,
          medicineName: medicineInfo.name,
          dosage: medicineInfo.dosage,
        });
      } // Sort by scheduled time, most recent first
      return remindersWithMedicine.sort(
        (a, b) =>
          new Date(b.scheduledTime).getTime() -
          new Date(a.scheduledTime).getTime(),
      );
    } catch (error) {
      console.error('Error getting dose reminders:', error);
      throw new Error('Falha ao carregar o histórico de medicamentos');
    }
  }

  async getByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<DoseReminderWithMedicine[]> {
    return this.execute(undefined, undefined, startDate, endDate);
  }

  async getTakenReminders(): Promise<DoseReminderWithMedicine[]> {
    return this.execute(undefined, true);
  }

  async getSkippedReminders(): Promise<DoseReminderWithMedicine[]> {
    return this.execute(undefined, false);
  }

  private async getMedicineInfo(medicineId: number): Promise<{
    name: string;
    dosage: string;
  }> {
    // This would normally use the medicine repository
    // For now, return placeholder data
    const medicineNames = [
      'Dipirona',
      'Paracetamol',
      'Omeprazol',
      'Ibuprofeno',
    ];
    const dosages = ['500mg', '750mg', '20mg', '400mg'];

    return {
      name: medicineNames[medicineId % medicineNames.length] || 'Medicamento',
      dosage: dosages[medicineId % dosages.length] || '1 comprimido',
    };
  }
}
