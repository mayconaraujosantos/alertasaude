import * as SQLite from 'expo-sqlite';
import { DoseReminder, Medicine, MedicineSchedule, Schedule } from '../types';

class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async initDatabase(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initDatabase();
    return this.initPromise;
  }

  private async _initDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('medicineApp.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Tabela de medicamentos
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        dosage TEXT NOT NULL,
        imageUri TEXT,
        createdAt TEXT NOT NULL
      );
    `);

    // Tabela de agendamentos
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS medicine_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicineId INTEGER NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        intervalHours INTEGER NOT NULL,
        timesPerDay INTEGER NOT NULL,
        totalDays INTEGER NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (medicineId) REFERENCES medicines (id) ON DELETE CASCADE
      );
    `);

    // Tabela de lembretes de dose
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS dose_reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheduleId INTEGER NOT NULL,
        medicineId INTEGER NOT NULL,
        scheduledTime TEXT NOT NULL,
        takenAt TEXT,
        isTaken INTEGER DEFAULT 0,
        isSkipped INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (scheduleId) REFERENCES medicine_schedules (id) ON DELETE CASCADE,
        FOREIGN KEY (medicineId) REFERENCES medicines (id) ON DELETE CASCADE
      );
    `);

    // Tabela de agendamentos simples (nova estrutura)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicineId INTEGER NOT NULL,
        intervalHours INTEGER NOT NULL,
        durationDays INTEGER NOT NULL,
        startTime TEXT NOT NULL,
        notes TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (medicineId) REFERENCES medicines (id) ON DELETE CASCADE
      );
    `);

    // Tabela de configurações de notificação
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS notification_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicineId INTEGER NOT NULL,
        isEnabled INTEGER DEFAULT 1,
        soundEnabled INTEGER DEFAULT 1,
        vibrationEnabled INTEGER DEFAULT 1,
        reminderText TEXT NOT NULL,
        FOREIGN KEY (medicineId) REFERENCES medicines (id) ON DELETE CASCADE
      );
    `);
  }

  // CRUD para Medicamentos
  async insertMedicine(medicine: Omit<Medicine, 'id'>): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    console.log('DatabaseManager: Inserting medicine:', medicine);
    const result = await this.db.runAsync(
      'INSERT INTO medicines (name, description, dosage, imageUri, createdAt) VALUES (?, ?, ?, ?, ?)',
      medicine.name,
      medicine.description || null,
      medicine.dosage,
      medicine.imageUri || null,
      medicine.createdAt
    );

    console.log(
      'DatabaseManager: Medicine inserted with ID:',
      result.lastInsertRowId
    );
    return result.lastInsertRowId;
  }

  async getAllMedicines(): Promise<Medicine[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    console.log('DatabaseManager: Fetching all medicines...');
    const result = await this.db.getAllAsync(
      'SELECT * FROM medicines ORDER BY createdAt DESC'
    );
    console.log(
      'DatabaseManager: Found',
      result.length,
      'medicines in database'
    );
    console.log(
      'DatabaseManager: Medicines data:',
      JSON.stringify(result, null, 2)
    );
    return result as Medicine[];
  }

  async getMedicineById(id: number): Promise<Medicine | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM medicines WHERE id = ?',
      id
    );
    return result as Medicine | null;
  }

  async updateMedicine(id: number, medicine: Partial<Medicine>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = Object.keys(medicine).filter((key) => key !== 'id');
    const values = fields
      .map((field) => medicine[field as keyof Medicine])
      .filter((v) => v !== undefined);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');

    await this.db.runAsync(
      `UPDATE medicines SET ${setClause} WHERE id = ?`,
      ...values,
      id
    );
  }

  async deleteMedicine(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM medicines WHERE id = ?', id);
  }

  // CRUD para Schedules (nova estrutura)
  async addSchedule(schedule: Omit<Schedule, 'id'>): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO schedules (medicineId, intervalHours, durationDays, startTime, notes, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      schedule.medicineId,
      schedule.intervalHours,
      schedule.durationDays,
      schedule.startTime,
      schedule.notes || null,
      schedule.isActive ? 1 : 0,
      schedule.createdAt
    );

    const scheduleId = result.lastInsertRowId;

    // Gerar lembretes automaticamente
    await this.generateDoseReminders(scheduleId, schedule);

    return scheduleId;
  }

  // Gerar lembretes automaticamente baseado no cronograma
  private async generateDoseReminders(
    scheduleId: number,
    schedule: Omit<Schedule, 'id'>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    let startDateTime: Date;

    try {
      startDateTime = new Date(schedule.startTime);

      // Verificar se a data é válida
      if (isNaN(startDateTime.getTime())) {
        throw new Error(`Invalid date: ${schedule.startTime}`);
      }
    } catch (error) {
      console.error('Error parsing startTime:', schedule.startTime, error);
      throw new Error(`Invalid startTime format: ${schedule.startTime}`);
    }

    const reminders: any[] = [];

    console.log('Generating reminders for schedule:', {
      scheduleId,
      intervalHours: schedule.intervalHours,
      durationDays: schedule.durationDays,
      startTime: schedule.startTime,
      startDateTime: startDateTime.toISOString(),
      isValidDate: !isNaN(startDateTime.getTime()),
    });

    // Para cada dia do tratamento
    for (let day = 0; day < schedule.durationDays; day++) {
      const currentDay = new Date(startDateTime);
      currentDay.setDate(startDateTime.getDate() + day);

      // Resetar para o início do dia e depois aplicar o horário inicial
      currentDay.setHours(
        startDateTime.getHours(),
        startDateTime.getMinutes(),
        0,
        0
      );

      // Gerar lembretes para este dia baseado no intervalo
      let currentTime = new Date(currentDay);
      let doseCount = 0;

      // Gerar doses até o final do dia ou até atingir o limite de 24h/intervalo
      while (currentTime.getDate() === currentDay.getDate() && doseCount < 10) {
        // máximo 10 doses por dia como segurança
        const reminder = {
          scheduleId,
          medicineId: schedule.medicineId,
          scheduledTime: currentTime.toISOString(),
          createdAt: new Date().toISOString(),
        };

        reminders.push(reminder);
        console.log('Added reminder for:', currentTime.toISOString());

        // Próximo horário
        currentTime = new Date(
          currentTime.getTime() + schedule.intervalHours * 60 * 60 * 1000
        );
        doseCount++;
      }
    }

    // Inserir todos os lembretes no banco
    for (const reminder of reminders) {
      try {
        await this.db.runAsync(
          'INSERT INTO dose_reminders (scheduleId, medicineId, scheduledTime, isTaken, isSkipped, createdAt) VALUES (?, ?, ?, 0, 0, ?)',
          reminder.scheduleId,
          reminder.medicineId,
          reminder.scheduledTime,
          reminder.createdAt
        );
        console.log('Inserted reminder:', reminder.scheduledTime);
      } catch (error) {
        console.error('Error inserting reminder:', error, reminder);
      }
    }

    console.log(`Generated and inserted ${reminders.length} dose reminders`);
  }

  async getSchedulesByMedicineId(medicineId: number): Promise<Schedule[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM schedules WHERE medicineId = ? ORDER BY createdAt DESC',
      medicineId
    );

    return result.map((row) => ({
      ...(row as any),
      isActive: Boolean((row as any).isActive),
    })) as Schedule[];
  }

  // CRUD para Agendamentos
  async insertSchedule(
    schedule: Omit<MedicineSchedule, 'id'>
  ): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO medicine_schedules (medicineId, startDate, endDate, intervalHours, timesPerDay, totalDays, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      schedule.medicineId,
      schedule.startDate,
      schedule.endDate,
      schedule.intervalHours,
      schedule.timesPerDay,
      schedule.totalDays,
      schedule.isActive ? 1 : 0,
      schedule.createdAt
    );

    return result.lastInsertRowId;
  }

  async getSchedulesByMedicine(
    medicineId: number
  ): Promise<MedicineSchedule[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM medicine_schedules WHERE medicineId = ? ORDER BY createdAt DESC',
      medicineId
    );

    return result.map((row) => ({
      ...(row as any),
      isActive: Boolean((row as any).isActive),
    })) as MedicineSchedule[];
  }

  async getAllActiveSchedules(): Promise<MedicineSchedule[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM medicine_schedules WHERE isActive = 1 ORDER BY createdAt DESC'
    );

    return result.map((row) => ({
      ...(row as any),
      isActive: Boolean((row as any).isActive),
    })) as MedicineSchedule[];
  }

  // CRUD para Lembretes de Dose
  async insertDoseReminder(
    reminder: Omit<DoseReminder, 'id'>
  ): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO dose_reminders (scheduleId, medicineId, scheduledTime, takenAt, isTaken, isSkipped, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      reminder.scheduleId,
      reminder.medicineId,
      reminder.scheduledTime,
      reminder.takenAt || null,
      reminder.isTaken ? 1 : 0,
      reminder.isSkipped ? 1 : 0,
      reminder.createdAt
    );

    return result.lastInsertRowId;
  }

  async getTodayReminders(): Promise<DoseReminder[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const today = new Date().toISOString().split('T')[0];
    console.log('Getting reminders for today:', today);

    // Primeiro, verificar quantos lembretes existem no total
    const totalReminders = await this.db.getAllAsync(
      'SELECT COUNT(*) as count FROM dose_reminders'
    );
    console.log('Total reminders in database:', totalReminders);

    const result = await this.db.getAllAsync(
      `SELECT dr.*, m.name as medicineName, m.dosage
       FROM dose_reminders dr
       JOIN medicines m ON dr.medicineId = m.id
       WHERE DATE(dr.scheduledTime) = ?
       ORDER BY TIME(dr.scheduledTime)`,
      today
    );

    console.log('Found reminders for today:', result.length);
    console.log('Reminders data:', result);

    return result.map((row) => ({
      ...(row as any),
      isTaken: Boolean((row as any).isTaken),
      isSkipped: Boolean((row as any).isSkipped),
    })) as DoseReminder[];
  }

  async markDoseAsTaken(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    await this.db.runAsync(
      'UPDATE dose_reminders SET isTaken = 1, takenAt = ? WHERE id = ?',
      now,
      id
    );
  }

  async markDoseAsSkipped(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE dose_reminders SET isSkipped = 1 WHERE id = ?',
      id
    );
  }

  // Método de debug
  async debugDatabaseState(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    console.log('=== DATABASE DEBUG ===');

    // Verificar se as tabelas existem
    const tables = await this.db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    console.log('Tables in database:', tables);

    // Contar medicamentos
    const medicineCount = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM medicines'
    );
    console.log('Total medicines in database:', medicineCount);

    // Contar schedules
    const scheduleCount = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM schedules'
    );
    console.log('Total schedules in database:', scheduleCount);

    // Contar dose_reminders
    const reminderCount = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM dose_reminders'
    );
    console.log('Total dose_reminders in database:', reminderCount);

    // Listar todos os medicamentos
    const medicines = await this.db.getAllAsync('SELECT * FROM medicines');
    console.log('All medicines:', medicines);

    // Listar schedules
    const schedules = await this.db.getAllAsync('SELECT * FROM schedules');
    console.log('All schedules:', schedules);

    // Listar dose_reminders
    const reminders = await this.db.getAllAsync('SELECT * FROM dose_reminders');
    console.log('All dose_reminders:', reminders);

    // Verificar lembretes de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayReminders = await this.db.getAllAsync(
      `SELECT dr.*, m.name as medicineName
       FROM dose_reminders dr
       JOIN medicines m ON dr.medicineId = m.id
       WHERE DATE(dr.scheduledTime) = ?`,
      today
    );
    console.log('Today date:', today);
    console.log('Today reminders:', todayReminders);

    console.log('=== END DEBUG ===');
  }

  // Método para criar lembretes de teste
  async createTestReminders(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Pegar o primeiro medicamento
      const medicines = await this.db.getAllAsync(
        'SELECT * FROM medicines LIMIT 1'
      );
      if (medicines.length === 0) {
        console.log('No medicines found to create test reminders');
        return;
      }

      const medicine = medicines[0] as any;

      // Criar alguns lembretes para hoje
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const testReminders = [
        new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8:00 AM
        new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
        new Date(today.getTime() + 20 * 60 * 60 * 1000), // 8:00 PM
      ];

      for (const reminderTime of testReminders) {
        await this.db.runAsync(
          'INSERT INTO dose_reminders (scheduleId, medicineId, scheduledTime, isTaken, isSkipped, createdAt) VALUES (?, ?, ?, 0, 0, ?)',
          1, // scheduleId fictício
          medicine.id,
          reminderTime.toISOString(),
          new Date().toISOString()
        );
        console.log('Created test reminder for:', reminderTime.toISOString());
      }

      console.log('Test reminders created successfully');
    } catch (error) {
      console.error('Error creating test reminders:', error);
    }
  }
}

export const databaseManager = new DatabaseManager();
