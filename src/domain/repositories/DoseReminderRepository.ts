import { DoseReminderEntity } from '../entities';

export interface DoseReminderRepository {
  create(doseReminder: DoseReminderEntity): Promise<DoseReminderEntity>;
  findById(id: number): Promise<DoseReminderEntity | null>;
  findByScheduleId(scheduleId: number): Promise<DoseReminderEntity[]>;
  findByMedicineId(medicineId: number): Promise<DoseReminderEntity[]>;
  findPending(): Promise<DoseReminderEntity[]>;
  findOverdue(): Promise<DoseReminderEntity[]>;
  findTaken(): Promise<DoseReminderEntity[]>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<DoseReminderEntity[]>;
  update(doseReminder: DoseReminderEntity): Promise<DoseReminderEntity>;
  delete(id: number): Promise<void>;
  findAll(): Promise<DoseReminderEntity[]>;
  deleteByScheduleId(scheduleId: number): Promise<void>;
}
