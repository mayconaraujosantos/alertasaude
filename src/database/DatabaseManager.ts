import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { NotificationService } from '../services/NotificationService';
import { DoseReminder, Medicine, MedicineSchedule, Schedule } from '../types';

class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private dbPath: string = '';

  async initDatabase(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initDatabase();
    return this.initPromise;
  }

  private async _initDatabase(): Promise<void> {
    try {
      // Abrir/criar o banco de dados (Expo SQLite gerencia o local automaticamente)
      this.db = await SQLite.openDatabaseAsync('medicineApp.db');

      // O caminho do banco será no diretório padrão do SQLite
      this.dbPath = `${FileSystem.documentDirectory}SQLite/medicineApp.db`;

      console.log('Database initialized successfully');
      console.log('Database file location:', this.dbPath);

      await this.createTables();
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
        notificationId TEXT,
        earlyNotificationId TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (scheduleId) REFERENCES medicine_schedules (id) ON DELETE CASCADE,
        FOREIGN KEY (medicineId) REFERENCES medicines (id) ON DELETE CASCADE
      );
    `);

    // Verificar e adicionar colunas se não existirem
    await this.addColumnIfNotExists('dose_reminders', 'notificationId', 'TEXT');
    await this.addColumnIfNotExists(
      'dose_reminders',
      'earlyNotificationId',
      'TEXT'
    );

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

  // Método auxiliar para adicionar coluna se não existir
  private async addColumnIfNotExists(
    tableName: string,
    columnName: string,
    columnType: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Verificar se a coluna já existe
      const tableInfo = await this.db.getAllAsync(
        `PRAGMA table_info(${tableName})`
      );
      const columnExists = tableInfo.some(
        (column: any) => column.name === columnName
      );

      if (!columnExists) {
        await this.db.execAsync(
          `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType};`
        );
        console.log(`✅ Added column ${columnName} to ${tableName}`);
      } else {
        console.log(`ℹ️ Column ${columnName} already exists in ${tableName}`);
      }
    } catch (error: any) {
      console.error(
        `❌ Error checking/adding column ${columnName}:`,
        error.message
      );
      // Não relançar o erro, pois pode ser que a coluna já existe
    }
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

    const fields = Object.keys(medicine).filter(key => key !== 'id');
    const values = fields
      .map(field => medicine[field as keyof Medicine])
      .filter(v => v !== undefined);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

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

    // Buscar informações do medicamento para as notificações
    const medicine = await this.getMedicineById(schedule.medicineId);
    if (!medicine) {
      throw new Error('Medicine not found');
    }

    const reminders: any[] = [];

    console.log('🔔 Generating reminders with notifications for schedule:', {
      scheduleId,
      intervalHours: schedule.intervalHours,
      durationDays: schedule.durationDays,
      startTime: schedule.startTime,
      startDateTime: startDateTime.toISOString(),
      medicineName: medicine.name,
      dosage: medicine.dosage,
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
          notificationId: null,
          earlyNotificationId: null,
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

    // Inserir todos os lembretes no banco e agendar notificações
    for (const reminder of reminders) {
      try {
        // Inserir o lembrete no banco
        const result = await this.db.runAsync(
          'INSERT INTO dose_reminders (scheduleId, medicineId, scheduledTime, isTaken, isSkipped, createdAt, notificationId, earlyNotificationId) VALUES (?, ?, ?, 0, 0, ?, ?, ?)',
          reminder.scheduleId,
          reminder.medicineId,
          reminder.scheduledTime,
          reminder.createdAt,
          null, // notificationId será atualizado depois
          null // earlyNotificationId será atualizado depois
        );

        const reminderId = result.lastInsertRowId;

        // Agendar notificação principal
        const notificationId =
          await NotificationService.scheduleMedicationReminder({
            id: reminderId,
            medicineName: medicine.name,
            dosage: medicine.dosage,
            scheduledTime: reminder.scheduledTime,
          });

        // Agendar notificação antecipada (15 minutos antes)
        const earlyNotificationId =
          await NotificationService.scheduleEarlyReminder({
            id: reminderId,
            medicineName: medicine.name,
            dosage: medicine.dosage,
            scheduledTime: reminder.scheduledTime,
          });

        // Atualizar o lembrete com os IDs das notificações
        if (notificationId || earlyNotificationId) {
          await this.db.runAsync(
            'UPDATE dose_reminders SET notificationId = ?, earlyNotificationId = ? WHERE id = ?',
            notificationId,
            earlyNotificationId,
            reminderId
          );
        }

        console.log('✅ Inserted reminder with notifications:', {
          reminderId,
          scheduledTime: reminder.scheduledTime,
          notificationId,
          earlyNotificationId,
        });
      } catch (error) {
        console.error(
          '❌ Error inserting reminder with notifications:',
          error,
          reminder
        );
      }
    }

    console.log(
      `🎯 Generated and inserted ${reminders.length} dose reminders with notifications`
    );
  }

  async getSchedulesByMedicineId(medicineId: number): Promise<Schedule[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM schedules WHERE medicineId = ? ORDER BY createdAt DESC',
      medicineId
    );

    return result.map(row => ({
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

    return result.map(row => ({
      ...(row as any),
      isActive: Boolean((row as any).isActive),
    })) as MedicineSchedule[];
  }

  async getAllActiveSchedules(): Promise<MedicineSchedule[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM medicine_schedules WHERE isActive = 1 ORDER BY createdAt DESC'
    );

    return result.map(row => ({
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

  async getAllDoseReminders(): Promise<DoseReminder[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      `SELECT dr.*, m.name as medicineName, m.dosage
       FROM dose_reminders dr
       JOIN medicines m ON dr.medicineId = m.id
       ORDER BY dr.scheduledTime DESC`
    );

    return result.map(row => ({
      ...(row as any),
      isTaken: Boolean((row as any).isTaken),
      isSkipped: Boolean((row as any).isSkipped),
    })) as DoseReminder[];
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

    return result.map(row => ({
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

  // Método para marcar lembrete como tomado e cancelar notificações
  async markReminderAsTaken(reminderId: number): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Buscar o lembrete com os IDs das notificações
      const reminder = (await this.db.getFirstAsync(
        'SELECT * FROM dose_reminders WHERE id = ?',
        reminderId
      )) as any;

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Cancelar notificações se existirem
      if (reminder.notificationId) {
        await NotificationService.cancelNotification(reminder.notificationId);
        console.log('🔕 Cancelled main notification:', reminder.notificationId);
      }

      if (reminder.earlyNotificationId) {
        await NotificationService.cancelNotification(
          reminder.earlyNotificationId
        );
        console.log(
          '🔕 Cancelled early notification:',
          reminder.earlyNotificationId
        );
      }

      // Marcar como tomado
      await this.db.runAsync(
        'UPDATE dose_reminders SET isTaken = 1, takenAt = ? WHERE id = ?',
        new Date().toISOString(),
        reminderId
      );

      console.log(
        '✅ Marked reminder as taken and cancelled notifications:',
        reminderId
      );
    } catch (error) {
      console.error('❌ Error marking reminder as taken:', error);
      throw error;
    }
  }

  // Método para pular lembrete e cancelar notificações
  async skipReminder(reminderId: number): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Buscar o lembrete com os IDs das notificações
      const reminder = (await this.db.getFirstAsync(
        'SELECT * FROM dose_reminders WHERE id = ?',
        reminderId
      )) as any;

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Cancelar notificações se existirem
      if (reminder.notificationId) {
        await NotificationService.cancelNotification(reminder.notificationId);
        console.log('🔕 Cancelled main notification:', reminder.notificationId);
      }

      if (reminder.earlyNotificationId) {
        await NotificationService.cancelNotification(
          reminder.earlyNotificationId
        );
        console.log(
          '🔕 Cancelled early notification:',
          reminder.earlyNotificationId
        );
      }

      // Marcar como pulado
      await this.db.runAsync(
        'UPDATE dose_reminders SET isSkipped = 1 WHERE id = ?',
        reminderId
      );

      console.log(
        '⏭️ Skipped reminder and cancelled notifications:',
        reminderId
      );
    } catch (error) {
      console.error('❌ Error skipping reminder:', error);
      throw error;
    }
  }

  // Método para cancelar todas as notificações de um agendamento
  async cancelScheduleNotifications(scheduleId: number): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Buscar todos os lembretes do agendamento
      const reminders = await this.db.getAllAsync(
        'SELECT * FROM dose_reminders WHERE scheduleId = ? AND isTaken = 0 AND isSkipped = 0',
        scheduleId
      );

      console.log(
        `🔕 Cancelling notifications for ${reminders.length} reminders`
      );

      for (const reminder of reminders) {
        const rem = reminder as any;
        if (rem.notificationId) {
          await NotificationService.cancelNotification(rem.notificationId);
        }
        if (rem.earlyNotificationId) {
          await NotificationService.cancelNotification(rem.earlyNotificationId);
        }
      }

      console.log('✅ Cancelled all notifications for schedule:', scheduleId);
    } catch (error) {
      console.error('❌ Error cancelling schedule notifications:', error);
      throw error;
    }
  }

  // Métodos para administração do banco
  async getAllSchedules(): Promise<Schedule[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM schedules ORDER BY createdAt DESC'
    );
    return result as Schedule[];
  }

  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Cancelar todas as notificações primeiro
      await NotificationService.cancelAllNotifications();

      // Limpar todas as tabelas
      await this.db.execAsync('DELETE FROM dose_reminders');
      await this.db.execAsync('DELETE FROM medicine_schedules');
      await this.db.execAsync('DELETE FROM schedules');
      await this.db.execAsync('DELETE FROM medicines');
      await this.db.execAsync('DELETE FROM notification_configs');

      console.log('🗑️ All data cleared from database');
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
      throw error;
    }
  }

  async importData(data: {
    medicines: Medicine[];
    schedules: Schedule[];
    doseReminders: DoseReminder[];
  }): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Limpar dados existentes
      await this.clearAllData();

      console.log('📥 Starting data import...');

      // Importar medicamentos
      for (const medicine of data.medicines) {
        const { id: _id, ...medicineData } = medicine;
        await this.insertMedicine(medicineData);
      }

      // Importar agendamentos
      for (const schedule of data.schedules) {
        const { id: _id, ...scheduleData } = schedule;
        await this.addSchedule(scheduleData);
      }

      console.log('✅ Data import completed successfully');
    } catch (error) {
      console.error('❌ Error importing data:', error);
      throw error;
    }
  }

  async exportAllData(): Promise<{
    medicines: Medicine[];
    schedules: Schedule[];
    doseReminders: DoseReminder[];
  }> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('📤 Exporting all data from database...');

      const medicines = await this.getAllMedicines();
      const schedules = await this.getAllSchedules();
      const doseReminders = await this.getAllDoseReminders();

      const exportData = {
        medicines,
        schedules,
        doseReminders,
      };

      console.log('✅ Data export completed');
      return exportData;
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw error;
    }
  }

  // Métodos úteis para debug e visualização
  getDatabasePath(): string {
    return this.dbPath;
  }

  async getTableInfo(): Promise<any> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('📊 Database Information:');
      console.log('Path:', this.dbPath);

      // Listar todas as tabelas
      const tables = await this.db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );

      console.log(
        'Tables:',
        tables.map(t => (t as any).name)
      );

      // Contar registros em cada tabela
      for (const table of tables) {
        const tableName = (table as any).name;
        const count = await this.db.getFirstAsync(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        console.log(`${tableName}: ${(count as any)?.count || 0} records`);
      }

      return {
        path: this.dbPath,
        tables: tables.map(t => (t as any).name),
      };
    } catch (error) {
      console.error('❌ Error getting table info:', error);
      throw error;
    }
  }

  async copyDatabaseToDownloads(): Promise<string | null> {
    try {
      if (!this.dbPath) {
        console.log('❌ Database path not available');
        return null;
      }

      // Verificar se o arquivo existe
      const fileInfo = await FileSystem.getInfoAsync(this.dbPath);
      if (!fileInfo.exists) {
        console.log('❌ Database file does not exist at:', this.dbPath);
        console.log('💡 Trying alternative SQLite location...');

        // Tentar localização alternativa comum do SQLite
        const altPath = `${FileSystem.documentDirectory}SQLite/medicineApp.db`;
        const altFileInfo = await FileSystem.getInfoAsync(altPath);

        if (altFileInfo.exists) {
          this.dbPath = altPath;
          console.log('✅ Found database at alternative location:', altPath);
        } else {
          console.log('❌ Database file not found in any location');
          return null;
        }
      }

      // Para desenvolvimento, apenas retornar o caminho
      console.log('📁 Database file location:', this.dbPath);
      console.log('💡 You can access this file for debugging');

      return this.dbPath;
    } catch (error) {
      console.error('❌ Error accessing database file:', error);
      return null;
    }
  }
}

export const databaseManager = new DatabaseManager();
