import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';

interface _MedicineRow {
  id: number;
  name: string;
  description?: string;
  dosage: string;
  quantidade?: string;
  unidade?: string;
  forma?: string;
  imageUri?: string;
  isActive: number;
  createdAt: string;
}

interface TableInfoRow {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | number | null;
  pk: number;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private dbPath: string = '';

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initDatabase(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initDatabase();
    return this.initPromise;
  }

  private async _initDatabase(): Promise<void> {
    try {
      console.log(
        '🔵 [DatabaseManager] Iniciando inicialização do banco de dados',
      );

      this.db = await SQLite.openDatabaseAsync('medicineApp.db');
      this.dbPath = `${FileSystem.documentDirectory}SQLite/medicineApp.db`;

      console.log('🟢 [DatabaseManager] Database inicializado com sucesso');
      console.log('🔵 [DatabaseManager] Localização do arquivo:', this.dbPath);

      await this.createTables();
      console.log(
        '🟢 [DatabaseManager] Tabelas criadas/verificadas com sucesso',
      );
    } catch (error) {
      console.error(
        '🔴 [DatabaseManager] Erro ao inicializar database:',
        error,
      );
      throw error;
    }
  }

  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    await this.ensureInitialized();
    if (!this.db) {
      throw new Error('Database not available');
    }
    return this.db;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this._initDatabase();
    }
    await this.initPromise;
  }

  getDatabasePath(): string {
    return this.dbPath;
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('🔵 [DatabaseManager] Iniciando criação/migração de tabelas');

    try {
      // Migrate existing tables first
      await this.migrateDatabase();
      console.log('🟢 [DatabaseManager] Migração completada');

      // Tabela de medicamentos
      console.log('🔵 [DatabaseManager] Criando tabela medicines');
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS medicines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          dosage TEXT NOT NULL,
          quantidade TEXT,
          unidade TEXT,
          forma TEXT,
          imageUri TEXT,
          isActive INTEGER DEFAULT 1,
          createdAt TEXT NOT NULL
        );
      `);
      console.log('🟢 [DatabaseManager] Tabela medicines criada/verificada');

      // Tabela de agendamentos
      console.log('🔵 [DatabaseManager] Criando tabela schedules');
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          medicineId INTEGER NOT NULL,
          time TEXT NOT NULL,
          days TEXT NOT NULL,
          isActive INTEGER DEFAULT 1,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (medicineId) REFERENCES medicines (id) ON DELETE CASCADE
        );
      `);
      console.log('🟢 [DatabaseManager] Tabela schedules criada/verificada');

      // Tabela de lembretes de doses
      console.log('🔵 [DatabaseManager] Criando tabela dose_reminders');
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS dose_reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          scheduleId INTEGER NOT NULL,
          medicineId INTEGER NOT NULL,
          reminderTime TEXT NOT NULL,
          taken INTEGER DEFAULT 0,
          takenAt TEXT,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (scheduleId) REFERENCES schedules (id) ON DELETE CASCADE,
          FOREIGN KEY (medicineId) REFERENCES medicines (id) ON DELETE CASCADE
        );
      `);
      console.log(
        '🟢 [DatabaseManager] Tabela dose_reminders criada/verificada',
      );

      // Tabela de usuários
      console.log('🔵 [DatabaseManager] Criando tabela users');
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          avatarUri TEXT,
          createdAt TEXT NOT NULL
        );
      `);
      console.log('🟢 [DatabaseManager] Tabela users criada/verificada');
    } catch (error) {
      console.error('🔴 [DatabaseManager] Erro na criação de tabelas:', error);
      throw error;
    }
  }

  async dropAllTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`DROP TABLE IF EXISTS dose_reminders;`);
    await this.db.execAsync(`DROP TABLE IF EXISTS schedules;`);
    await this.db.execAsync(`DROP TABLE IF EXISTS medicines;`);
    await this.db.execAsync(`DROP TABLE IF EXISTS users;`);
  }

  async resetDatabase(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    // Drop all tables
    await this.db.execAsync(`DROP TABLE IF EXISTS dose_reminders;`);
    await this.db.execAsync(`DROP TABLE IF EXISTS schedules;`);
    await this.db.execAsync(`DROP TABLE IF EXISTS medicines;`);
    await this.db.execAsync(`DROP TABLE IF EXISTS users;`);

    // Recreate tables
    await this.createTables();
    console.log('Database reset completed');
  }

  async recreateMedicinesTable(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    console.log('🔵 [DatabaseManager] Iniciando recriação da tabela medicines');

    try {
      // Backup existing data - only essential fields to avoid structure conflicts
      console.log('🔵 [DatabaseManager] Fazendo backup dos dados existentes');
      const existingMedicines = (await this.db.getAllAsync(
        'SELECT id, name, dosage, imageUri, isActive, createdAt, quantidade, unidade, forma, description FROM medicines',
      )) as Array<{
        id: number;
        name: string;
        dosage: string;
        imageUri?: string;
        isActive: number;
        createdAt: string;
        quantidade?: string;
        unidade?: string;
        forma?: string;
        description?: string;
      }>;

      console.log(
        '🔵 [DatabaseManager] Medicamentos encontrados:',
        existingMedicines.length,
      );

      // Drop and recreate table
      console.log('🔵 [DatabaseManager] Removendo tabela antiga');
      await this.db.execAsync(`DROP TABLE IF EXISTS medicines;`);

      console.log('🔵 [DatabaseManager] Criando nova tabela medicines');
      await this.db.execAsync(`
        CREATE TABLE medicines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          dosage TEXT NOT NULL,
          quantidade TEXT,
          unidade TEXT,
          forma TEXT,
          imageUri TEXT,
          isActive INTEGER DEFAULT 1,
          createdAt TEXT NOT NULL
        );
      `);
      console.log('🟢 [DatabaseManager] Nova tabela medicines criada');

      // Restore data with new structure
      console.log('🔵 [DatabaseManager] Restaurando dados existentes');
      for (const medicine of existingMedicines) {
        console.log(
          '🔵 [DatabaseManager] Restaurando medicamento:',
          medicine.name,
        );
        await this.db.runAsync(
          `INSERT INTO medicines (id, name, description, dosage, quantidade, unidade, forma, imageUri, isActive, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            medicine.id,
            medicine.name,
            medicine.description || null,
            medicine.dosage,
            medicine.quantidade || null,
            medicine.unidade || null,
            medicine.forma || null,
            medicine.imageUri || null,
            medicine.isActive || 1,
            medicine.createdAt,
          ],
        );
      }
      console.log('🟢 [DatabaseManager] Dados restaurados com sucesso');

      console.log('🟢 [DatabaseManager] Tabela medicines recriada com sucesso');
    } catch (error) {
      console.error(
        '🔴 [DatabaseManager] Erro ao recriar tabela medicines:',
        error,
      );
      throw error;
    }
  }

  private async migrateDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('🔵 [DatabaseManager] Iniciando migração do banco de dados');

    try {
      // Check if medicines table exists and has all required columns
      console.log(
        '🔵 [DatabaseManager] Verificando estrutura da tabela medicines',
      );

      try {
        const medicinesTableInfo = (await this.db.getAllAsync(
          `PRAGMA table_info(medicines)`,
        )) as TableInfoRow[];

        const medicinesColumns = medicinesTableInfo.map(col => col.name);
        console.log(
          '🔵 [DatabaseManager] Colunas existentes na tabela medicines:',
          medicinesColumns,
        );

        const requiredColumns = [
          'description',
          'quantidade',
          'unidade',
          'forma',
        ];
        const missingColumns = requiredColumns.filter(
          col => !medicinesColumns.includes(col),
        );

        // Verificar se existe a coluna frequency (estrutura antiga)
        const hasFrequencyColumn = medicinesColumns.includes('frequency');

        if (missingColumns.length > 0 || hasFrequencyColumn) {
          console.log(
            '🟡 [DatabaseManager] Estrutura da tabela medicines precisa ser atualizada:',
            {
              missingColumns,
              hasOldFrequencyColumn: hasFrequencyColumn,
            },
          );
          console.log(
            '🔵 [DatabaseManager] Forçando recriação da tabela medicines...',
          );
          await this.recreateMedicinesTable();
          console.log(
            '🟢 [DatabaseManager] Recriação da tabela medicines concluída',
          );
        } else {
          console.log(
            '🟢 [DatabaseManager] Tabela medicines já possui a estrutura correta',
          );
        }
      } catch {
        console.log(
          '🟡 [DatabaseManager] Tabela medicines não existe, será criada automaticamente',
        );
      }

      // Check if columns exist in dose_reminders table
      console.log(
        '🔵 [DatabaseManager] Verificando estrutura da tabela dose_reminders',
      );

      try {
        const tableInfo = (await this.db.getAllAsync(
          `PRAGMA table_info(dose_reminders)`,
        )) as TableInfoRow[];
        const columns = tableInfo.map(col => col.name);
        console.log(
          '🔵 [DatabaseManager] Colunas existentes na tabela dose_reminders:',
          columns,
        );

        // Add missing columns if they don't exist
        if (!columns.includes('medicineId')) {
          console.log(
            '🟡 [DatabaseManager] Adicionando coluna medicineId à tabela dose_reminders',
          );
          await this.db.execAsync(
            `ALTER TABLE dose_reminders ADD COLUMN medicineId INTEGER`,
          );
        }
        if (!columns.includes('isTaken')) {
          console.log(
            '🟡 [DatabaseManager] Adicionando coluna isTaken à tabela dose_reminders',
          );
          await this.db.execAsync(
            `ALTER TABLE dose_reminders ADD COLUMN isTaken INTEGER DEFAULT 0`,
          );
        }
        if (!columns.includes('isSkipped')) {
          console.log(
            '🟡 [DatabaseManager] Adicionando coluna isSkipped à tabela dose_reminders',
          );
          await this.db.execAsync(
            `ALTER TABLE dose_reminders ADD COLUMN isSkipped INTEGER DEFAULT 0`,
          );
        }
        if (!columns.includes('takenAt')) {
          console.log(
            '🟡 [DatabaseManager] Adicionando coluna takenAt à tabela dose_reminders',
          );
          await this.db.execAsync(
            `ALTER TABLE dose_reminders ADD COLUMN takenAt TEXT`,
          );
        }
      } catch {
        console.log(
          '🟡 [DatabaseManager] Tabela dose_reminders não existe, será criada automaticamente',
        );
      }

      console.log('🟢 [DatabaseManager] Migração completada com sucesso');
    } catch (error) {
      console.error('🔴 [DatabaseManager] Erro durante migração:', error);
      // If migration fails, we might need to recreate the tables
    }
  }

  // Debug and Info Methods
  async getTableInfo(): Promise<{
    path: string;
    tables: string[];
    size?: number;
    version?: string;
  }> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const tables = (await this.db.getAllAsync(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`,
      )) as Array<{ name: string }>;

      return {
        path: this.dbPath,
        tables: tables.map(t => t.name),
        version: '1.0',
      };
    } catch (error) {
      console.error('Error getting table info:', error);
      throw error;
    }
  }

  async getUserCount(): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = (await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM users',
    )) as { count: number };
    return result.count;
  }

  async getMedicineCount(): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = (await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM medicines',
    )) as { count: number };
    return result.count;
  }

  async getScheduleCount(): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = (await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM schedules',
    )) as { count: number };
    return result.count;
  }

  async getDoseReminderCount(): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = (await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM dose_reminders',
    )) as { count: number };
    return result.count;
  }

  async exportAllData(): Promise<{
    users: unknown[];
    medicines: unknown[];
    schedules: unknown[];
    doseReminders: unknown[];
  }> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const users = await this.db.getAllAsync('SELECT * FROM users');
      const medicines = await this.db.getAllAsync('SELECT * FROM medicines');
      const schedules = await this.db.getAllAsync('SELECT * FROM schedules');
      const doseReminders = await this.db.getAllAsync(
        'SELECT * FROM dose_reminders',
      );

      return {
        users,
        medicines,
        schedules,
        doseReminders,
      };
    } catch (error) {
      console.error('Error exporting all data:', error);
      throw error;
    }
  }
}
