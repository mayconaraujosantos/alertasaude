import { ScheduleEntity, Schedule } from '../../domain/entities';
import { ScheduleRepository } from '../../domain/repositories';
import { DatabaseManager } from '../../infrastructure/database/DatabaseManager';

export class SQLiteScheduleRepository implements ScheduleRepository {
  constructor(private databaseManager: DatabaseManager) {}

  async create(schedule: ScheduleEntity): Promise<ScheduleEntity> {
    const db = await this.databaseManager.getDatabase();

    const result = await db.runAsync(
      `INSERT INTO schedules (medicineId, intervalHours, durationDays, startTime, notes, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        schedule.medicineId,
        schedule.intervalHours,
        schedule.durationDays,
        schedule.startTime,
        schedule.notes || null,
        schedule.isActive ? 1 : 0,
        schedule.createdAt.toISOString(),
      ],
    );

    const scheduleData: Schedule = {
      id: result.lastInsertRowId,
      medicineId: schedule.medicineId,
      intervalHours: schedule.intervalHours,
      durationDays: schedule.durationDays,
      startTime: schedule.startTime,
      notes: schedule.notes,
      isActive: schedule.isActive,
      createdAt: schedule.createdAt,
    };

    return ScheduleEntity.fromPersistence(scheduleData);
  }

  async findById(id: number): Promise<ScheduleEntity | null> {
    const db = await this.databaseManager.getDatabase();

    const result = (await db.getFirstAsync(
      'SELECT * FROM schedules WHERE id = ?',
      [id],
    )) as Schedule | null;

    return result ? ScheduleEntity.fromPersistence(result) : null;
  }

  async findByMedicineId(medicineId: number): Promise<ScheduleEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM schedules WHERE medicineId = ? ORDER BY createdAt DESC',
      [medicineId],
    )) as Schedule[];

    return results.map(schedule => ScheduleEntity.fromPersistence(schedule));
  }

  async update(schedule: ScheduleEntity): Promise<ScheduleEntity> {
    if (!schedule.id) {
      throw new Error('Schedule ID is required for update');
    }

    const db = await this.databaseManager.getDatabase();

    await db.runAsync(
      `UPDATE schedules 
       SET medicineId = ?, intervalHours = ?, durationDays = ?, 
           startTime = ?, notes = ?, isActive = ?
       WHERE id = ?`,
      [
        schedule.medicineId,
        schedule.intervalHours,
        schedule.durationDays,
        schedule.startTime,
        schedule.notes || null,
        schedule.isActive ? 1 : 0,
        schedule.id,
      ],
    );

    return schedule;
  }

  async delete(id: number): Promise<void> {
    const db = await this.databaseManager.getDatabase();

    await db.runAsync('DELETE FROM schedules WHERE id = ?', [id]);
  }

  async findAll(): Promise<ScheduleEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM schedules ORDER BY createdAt DESC',
    )) as Schedule[];

    return results.map(schedule => ScheduleEntity.fromPersistence(schedule));
  }

  async findActive(): Promise<ScheduleEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM schedules WHERE isActive = 1 ORDER BY createdAt DESC',
    )) as Schedule[];

    return results.map(schedule => ScheduleEntity.fromPersistence(schedule));
  }

  async findExpired(): Promise<ScheduleEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(`
      SELECT * FROM schedules 
      WHERE datetime(date(createdAt, '+' || durationDays || ' days')) < datetime('now')
      ORDER BY createdAt DESC
    `)) as Schedule[];

    return results.map(schedule => ScheduleEntity.fromPersistence(schedule));
  }
}
