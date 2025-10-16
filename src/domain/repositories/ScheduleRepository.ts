import { ScheduleEntity } from '../entities';

export interface ScheduleRepository {
  create(schedule: ScheduleEntity): Promise<ScheduleEntity>;
  findById(id: number): Promise<ScheduleEntity | null>;
  findByMedicineId(medicineId: number): Promise<ScheduleEntity[]>;
  update(schedule: ScheduleEntity): Promise<ScheduleEntity>;
  delete(id: number): Promise<void>;
  findAll(): Promise<ScheduleEntity[]>;
  findActive(): Promise<ScheduleEntity[]>;
  findExpired(): Promise<ScheduleEntity[]>;
}
