import {
  MedicineRepository,
  ScheduleRepository,
  DoseReminderRepository,
} from '../repositories';

export class ClearDatabaseUseCase {
  constructor(
    private medicineRepository: MedicineRepository,
    private scheduleRepository: ScheduleRepository,
    private doseReminderRepository: DoseReminderRepository,
  ) {}

  async execute(): Promise<void> {
    try {
      // Get all data first
      const [medicines, schedules, reminders] = await Promise.all([
        this.medicineRepository.findAll(),
        this.scheduleRepository.findAll(),
        this.doseReminderRepository.findAll(),
      ]);

      // Delete dose reminders first (due to foreign key constraints)
      for (const reminder of reminders) {
        if (reminder.id) {
          await this.doseReminderRepository.delete(reminder.id);
        }
      }

      // Delete schedules next
      for (const schedule of schedules) {
        if (schedule.id) {
          await this.scheduleRepository.delete(schedule.id);
        }
      }

      // Delete medicines last
      for (const medicine of medicines) {
        if (medicine.id) {
          await this.medicineRepository.delete(medicine.id);
        }
      }

      console.log('Database cleared successfully');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw new Error('Falha ao limpar banco de dados');
    }
  }

  async clearMedicinesOnly(): Promise<void> {
    try {
      const medicines = await this.medicineRepository.findAll();

      for (const medicine of medicines) {
        if (medicine.id) {
          // This should cascade delete related schedules and reminders
          await this.medicineRepository.delete(medicine.id);
        }
      }

      console.log('Medicines cleared successfully');
    } catch (error) {
      console.error('Error clearing medicines:', error);
      throw new Error('Falha ao limpar medicamentos');
    }
  }

  async clearSchedulesOnly(): Promise<void> {
    try {
      const schedules = await this.scheduleRepository.findAll();

      for (const schedule of schedules) {
        if (schedule.id) {
          // This should cascade delete related reminders
          await this.scheduleRepository.delete(schedule.id);
        }
      }

      console.log('Schedules cleared successfully');
    } catch (error) {
      console.error('Error clearing schedules:', error);
      throw new Error('Falha ao limpar agendamentos');
    }
  }
}
