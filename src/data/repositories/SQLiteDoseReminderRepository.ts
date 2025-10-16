import { DoseReminderEntity, DoseReminder } from '../../domain/entities';
import { DoseReminderRepository } from '../../domain/repositories';
import { DatabaseManager } from '../../infrastructure/database/DatabaseManager';

export class SQLiteDoseReminderRepository implements DoseReminderRepository {
  constructor(private databaseManager: DatabaseManager) {}

  async create(doseReminder: DoseReminderEntity): Promise<DoseReminderEntity> {
    const db = await this.databaseManager.getDatabase();

    const result = await db.runAsync(
      `INSERT INTO dose_reminders (scheduleId, medicineId, scheduledTime, takenAt, isTaken, isSkipped, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        doseReminder.scheduleId,
        doseReminder.medicineId,
        doseReminder.scheduledTime.toISOString(),
        doseReminder.takenAt?.toISOString() || null,
        doseReminder.isTaken ? 1 : 0,
        doseReminder.isSkipped ? 1 : 0,
        doseReminder.createdAt.toISOString(),
      ],
    );

    const doseData: DoseReminder = {
      id: result.lastInsertRowId,
      scheduleId: doseReminder.scheduleId,
      medicineId: doseReminder.medicineId,
      scheduledTime: doseReminder.scheduledTime,
      takenAt: doseReminder.takenAt,
      isTaken: doseReminder.isTaken,
      isSkipped: doseReminder.isSkipped,
      createdAt: doseReminder.createdAt,
    };

    return DoseReminderEntity.fromPersistence(doseData);
  }

  async findById(id: number): Promise<DoseReminderEntity | null> {
    const db = await this.databaseManager.getDatabase();

    const result = (await db.getFirstAsync(
      'SELECT * FROM dose_reminders WHERE id = ?',
      [id],
    )) as DoseReminder | null;

    return result ? DoseReminderEntity.fromPersistence(result) : null;
  }

  async findByScheduleId(scheduleId: number): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM dose_reminders WHERE scheduleId = ? ORDER BY scheduledTime ASC',
      [scheduleId],
    )) as DoseReminder[];

    return results.map(dose => DoseReminderEntity.fromPersistence(dose));
  }

  async findByMedicineId(medicineId: number): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM dose_reminders WHERE medicineId = ? ORDER BY scheduledTime DESC',
      [medicineId],
    )) as DoseReminder[];

    return results.map(dose => DoseReminderEntity.fromPersistence(dose));
  }

  async findPending(): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM dose_reminders WHERE isTaken = 0 AND isSkipped = 0 ORDER BY scheduledTime ASC',
    )) as DoseReminder[];

    return results.map(dose => DoseReminderEntity.fromPersistence(dose));
  }

  async findOverdue(): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      `SELECT * FROM dose_reminders 
       WHERE isTaken = 0 AND isSkipped = 0 
       AND datetime(scheduledTime) < datetime('now')
       ORDER BY scheduledTime ASC`,
    )) as DoseReminder[];

    return results.map(dose => DoseReminderEntity.fromPersistence(dose));
  }

  async findTaken(): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM dose_reminders WHERE isTaken = 1 ORDER BY takenAt DESC',
    )) as DoseReminder[];

    return results.map(dose => DoseReminderEntity.fromPersistence(dose));
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<DoseReminderEntity[]> {
    console.log(
      '🔵 [SQLiteDoseReminderRepository] Buscando lembretes por período:',
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    );

    try {
      const db = await this.databaseManager.getDatabase();
      console.log('🔵 [SQLiteDoseReminderRepository] Database conectado');

      const results = (await db.getAllAsync(
        `SELECT * FROM dose_reminders 
         WHERE datetime(scheduledTime) BETWEEN datetime(?) AND datetime(?)
         ORDER BY scheduledTime ASC`,
        [startDate.toISOString(), endDate.toISOString()],
      )) as DoseReminder[];

      console.log(
        '🔵 [SQLiteDoseReminderRepository] Resultados da query:',
        results.length,
      );

      const entities = results.map(dose =>
        DoseReminderEntity.fromPersistence(dose),
      );
      console.log(
        '🟢 [SQLiteDoseReminderRepository] Entidades criadas:',
        entities.length,
      );

      return entities;
    } catch (error) {
      console.error(
        '🔴 [SQLiteDoseReminderRepository] Erro ao buscar lembretes:',
        error,
      );
      throw error;
    }
  }

  async update(doseReminder: DoseReminderEntity): Promise<DoseReminderEntity> {
    if (!doseReminder.id) {
      throw new Error('DoseReminder ID is required for update');
    }

    const db = await this.databaseManager.getDatabase();

    await db.runAsync(
      `UPDATE dose_reminders 
       SET scheduleId = ?, medicineId = ?, scheduledTime = ?, 
           takenAt = ?, isTaken = ?, isSkipped = ?
       WHERE id = ?`,
      [
        doseReminder.scheduleId,
        doseReminder.medicineId,
        doseReminder.scheduledTime.toISOString(),
        doseReminder.takenAt?.toISOString() || null,
        doseReminder.isTaken ? 1 : 0,
        doseReminder.isSkipped ? 1 : 0,
        doseReminder.id,
      ],
    );

    return doseReminder;
  }

  async delete(id: number): Promise<void> {
    const db = await this.databaseManager.getDatabase();

    await db.runAsync('DELETE FROM dose_reminders WHERE id = ?', [id]);
  }

  async findAll(): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM dose_reminders ORDER BY scheduledTime DESC',
    )) as DoseReminder[];

    return results.map(dose => DoseReminderEntity.fromPersistence(dose));
  }

  async deleteByScheduleId(scheduleId: number): Promise<void> {
    const db = await this.databaseManager.getDatabase();

    await db.runAsync('DELETE FROM dose_reminders WHERE scheduleId = ?', [
      scheduleId,
    ]);
  }
}
