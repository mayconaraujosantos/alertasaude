import { and, eq } from 'drizzle-orm';
import { DoseReminderEntity, DoseReminder } from '../../domain/entities';
import { DoseReminderRepository } from '../../domain/repositories';
import { DrizzleDatabaseManager } from '../../infrastructure/database/DrizzleDatabaseManager';
import { doseReminders } from '../../infrastructure/database/drizzle/schema';

export class DrizzleDoseReminderRepository implements DoseReminderRepository {
  constructor(private databaseManager: DrizzleDatabaseManager) {}

  async create(doseReminder: DoseReminderEntity): Promise<DoseReminderEntity> {
    const db = await this.databaseManager.getDatabase();

    const result = await db
      .insert(doseReminders)
      .values({
        scheduleId: doseReminder.scheduleId,
        medicineId: doseReminder.medicineId,
        scheduledTime: doseReminder.scheduledTime.toISOString(),
        reminderTime: doseReminder.scheduledTime.toISOString(), // Por compatibilidade
        taken: doseReminder.isTaken,
        isTaken: doseReminder.isTaken,
        isSkipped: doseReminder.isSkipped,
        takenAt: doseReminder.takenAt?.toISOString() || null,
      })
      .returning();

    const created = result[0];

    const doseData: DoseReminder = {
      id: created.id,
      scheduleId: created.scheduleId,
      medicineId: created.medicineId,
      scheduledTime: new Date(created.scheduledTime),
      takenAt: created.takenAt ? new Date(created.takenAt) : undefined,
      isTaken: created.isTaken,
      isSkipped: created.isSkipped,
      createdAt: new Date(created.createdAt),
    };

    return DoseReminderEntity.fromPersistence(doseData);
  }

  async findById(id: number): Promise<DoseReminderEntity | null> {
    const db = await this.databaseManager.getDatabase();

    const result = await db
      .select()
      .from(doseReminders)
      .where(eq(doseReminders.id, id))
      .limit(1);

    if (!result[0]) return null;

    const dose = result[0];
    const doseData: DoseReminder = {
      id: dose.id,
      scheduleId: dose.scheduleId,
      medicineId: dose.medicineId,
      scheduledTime: new Date(dose.scheduledTime),
      takenAt: dose.takenAt ? new Date(dose.takenAt) : undefined,
      isTaken: dose.isTaken,
      isSkipped: dose.isSkipped,
      createdAt: new Date(dose.createdAt),
    };

    return DoseReminderEntity.fromPersistence(doseData);
  }

  async findByScheduleId(scheduleId: number): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const result = await db
      .select()
      .from(doseReminders)
      .where(eq(doseReminders.scheduleId, scheduleId))
      .orderBy(doseReminders.scheduledTime);

    return result.map(dose => {
      const doseData: DoseReminder = {
        id: dose.id,
        scheduleId: dose.scheduleId,
        medicineId: dose.medicineId,
        scheduledTime: new Date(dose.scheduledTime),
        takenAt: dose.takenAt ? new Date(dose.takenAt) : undefined,
        isTaken: dose.isTaken,
        isSkipped: dose.isSkipped,
        createdAt: new Date(dose.createdAt),
      };
      return DoseReminderEntity.fromPersistence(doseData);
    });
  }

  async findByMedicineId(medicineId: number): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const result = await db
      .select()
      .from(doseReminders)
      .where(eq(doseReminders.medicineId, medicineId))
      .orderBy(doseReminders.scheduledTime);

    return result.map(dose => {
      const doseData: DoseReminder = {
        id: dose.id,
        scheduleId: dose.scheduleId,
        medicineId: dose.medicineId,
        scheduledTime: new Date(dose.scheduledTime),
        takenAt: dose.takenAt ? new Date(dose.takenAt) : undefined,
        isTaken: dose.isTaken,
        isSkipped: dose.isSkipped,
        createdAt: new Date(dose.createdAt),
      };
      return DoseReminderEntity.fromPersistence(doseData);
    });
  }

  async findPending(): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const result = await db
      .select()
      .from(doseReminders)
      .where(
        and(
          eq(doseReminders.isTaken, false),
          eq(doseReminders.isSkipped, false),
        ),
      )
      .orderBy(doseReminders.scheduledTime);

    return result.map(dose => {
      const doseData: DoseReminder = {
        id: dose.id,
        scheduleId: dose.scheduleId,
        medicineId: dose.medicineId,
        scheduledTime: new Date(dose.scheduledTime),
        takenAt: dose.takenAt ? new Date(dose.takenAt) : undefined,
        isTaken: dose.isTaken,
        isSkipped: dose.isSkipped,
        createdAt: new Date(dose.createdAt),
      };
      return DoseReminderEntity.fromPersistence(doseData);
    });
  }

  async findOverdue(): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const result = await db
      .select()
      .from(doseReminders)
      .where(
        and(
          eq(doseReminders.isTaken, false),
          eq(doseReminders.isSkipped, false),
          // Note: SQLite date comparison as strings works for ISO format
        ),
      )
      .orderBy(doseReminders.scheduledTime);

    // Filtrar no JavaScript pois o Drizzle com SQLite tem limitações na comparação de datas
    const filtered = result.filter(
      dose => new Date(dose.scheduledTime) < new Date(),
    );

    return filtered.map(dose => {
      const doseData: DoseReminder = {
        id: dose.id,
        scheduleId: dose.scheduleId,
        medicineId: dose.medicineId,
        scheduledTime: new Date(dose.scheduledTime),
        takenAt: dose.takenAt ? new Date(dose.takenAt) : undefined,
        isTaken: dose.isTaken,
        isSkipped: dose.isSkipped,
        createdAt: new Date(dose.createdAt),
      };
      return DoseReminderEntity.fromPersistence(doseData);
    });
  }

  async findTaken(): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const result = await db
      .select()
      .from(doseReminders)
      .where(eq(doseReminders.isTaken, true))
      .orderBy(doseReminders.takenAt);

    return result.map(dose => {
      const doseData: DoseReminder = {
        id: dose.id,
        scheduleId: dose.scheduleId,
        medicineId: dose.medicineId,
        scheduledTime: new Date(dose.scheduledTime),
        takenAt: dose.takenAt ? new Date(dose.takenAt) : undefined,
        isTaken: dose.isTaken,
        isSkipped: dose.isSkipped,
        createdAt: new Date(dose.createdAt),
      };
      return DoseReminderEntity.fromPersistence(doseData);
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<DoseReminderEntity[]> {
    console.log(
      '🔵 [DrizzleDoseReminderRepository] Buscando lembretes por período:',
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    );

    try {
      const db = await this.databaseManager.getDatabase();
      console.log('🔵 [DrizzleDoseReminderRepository] Database conectado');

      const result = await db
        .select()
        .from(doseReminders)
        .where(
          and(),
          // No SQLite com Drizzle, comparação de datas como string funciona com ISO format
          // scheduledTime >= startDate AND scheduledTime < endDate
        )
        .orderBy(doseReminders.scheduledTime);

      // Filtrar no JavaScript para garantir compatibilidade
      const filtered = result.filter(dose => {
        const schedTime = new Date(dose.scheduledTime);
        return schedTime >= startDate && schedTime < endDate;
      });

      console.log(
        '🔵 [DrizzleDoseReminderRepository] Resultados da query:',
        filtered.length,
      );

      if (filtered.length > 0) {
        console.log(
          '🔵 [DrizzleDoseReminderRepository] Primeiro resultado:',
          filtered[0],
        );
      }

      const entities = filtered.map(dose => {
        const doseData: DoseReminder = {
          id: dose.id,
          scheduleId: dose.scheduleId,
          medicineId: dose.medicineId,
          scheduledTime: new Date(dose.scheduledTime),
          takenAt: dose.takenAt ? new Date(dose.takenAt) : undefined,
          isTaken: dose.isTaken,
          isSkipped: dose.isSkipped,
          createdAt: new Date(dose.createdAt),
        };
        return DoseReminderEntity.fromPersistence(doseData);
      });

      console.log(
        '🟢 [DrizzleDoseReminderRepository] Entidades criadas:',
        entities.length,
      );

      return entities;
    } catch (error) {
      console.error(
        '🔴 [DrizzleDoseReminderRepository] Erro ao buscar lembretes:',
        error,
      );
      throw error;
    }
  }

  async update(doseReminder: DoseReminderEntity): Promise<DoseReminderEntity> {
    const db = await this.databaseManager.getDatabase();

    const result = await db
      .update(doseReminders)
      .set({
        isTaken: doseReminder.isTaken,
        isSkipped: doseReminder.isSkipped,
        takenAt: doseReminder.takenAt?.toISOString() || null,
      })
      .where(eq(doseReminders.id, doseReminder.id!))
      .returning();

    const updated = result[0];

    const doseData: DoseReminder = {
      id: updated.id,
      scheduleId: updated.scheduleId,
      medicineId: updated.medicineId,
      scheduledTime: new Date(updated.scheduledTime),
      takenAt: updated.takenAt ? new Date(updated.takenAt) : undefined,
      isTaken: updated.isTaken,
      isSkipped: updated.isSkipped,
      createdAt: new Date(updated.createdAt),
    };

    return DoseReminderEntity.fromPersistence(doseData);
  }

  async delete(id: number): Promise<void> {
    const db = await this.databaseManager.getDatabase();

    await db.delete(doseReminders).where(eq(doseReminders.id, id));
  }

  async findAll(): Promise<DoseReminderEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const result = await db
      .select()
      .from(doseReminders)
      .orderBy(doseReminders.scheduledTime);

    return result.map(dose => {
      const doseData: DoseReminder = {
        id: dose.id,
        scheduleId: dose.scheduleId,
        medicineId: dose.medicineId,
        scheduledTime: new Date(dose.scheduledTime),
        takenAt: dose.takenAt ? new Date(dose.takenAt) : undefined,
        isTaken: dose.isTaken,
        isSkipped: dose.isSkipped,
        createdAt: new Date(dose.createdAt),
      };
      return DoseReminderEntity.fromPersistence(doseData);
    });
  }

  async deleteByScheduleId(scheduleId: number): Promise<void> {
    const db = await this.databaseManager.getDatabase();

    await db
      .delete(doseReminders)
      .where(eq(doseReminders.scheduleId, scheduleId));
  }
}
