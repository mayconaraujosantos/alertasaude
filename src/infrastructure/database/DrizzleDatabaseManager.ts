import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import * as schema from './drizzle/schema';

export class DrizzleDatabaseManager {
  private static instance: DrizzleDatabaseManager;
  private db: ReturnType<typeof drizzle> | null = null;
  private expoDb: SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): DrizzleDatabaseManager {
    if (!DrizzleDatabaseManager.instance) {
      DrizzleDatabaseManager.instance = new DrizzleDatabaseManager();
    }
    return DrizzleDatabaseManager.instance;
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
        '🔵 [DrizzleDatabaseManager] Iniciando inicialização do banco de dados',
      );

      // Abrir o banco de dados
      this.expoDb = openDatabaseSync('medicineApp.db');

      // Criar instância do Drizzle
      this.db = drizzle(this.expoDb, { schema });

      console.log('🟢 [DrizzleDatabaseManager] Banco de dados conectado');

      // Executar migrações
      await this.runMigrations();

      console.log(
        '🟢 [DrizzleDatabaseManager] Banco de dados inicializado com sucesso',
      );
    } catch (error) {
      console.error(
        '🔴 [DrizzleDatabaseManager] Erro ao inicializar banco de dados:',
        error,
      );
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      console.log('🔵 [DrizzleDatabaseManager] Executando migrações...');

      // Verificar se as tabelas já existem
      const tablesExist = await this.checkTablesExist();

      if (!tablesExist) {
        console.log('🔵 [DrizzleDatabaseManager] Criando esquema inicial...');
        await this.executeInitialMigration();
      } else {
        console.log('🟢 [DrizzleDatabaseManager] Esquema já existe');
      }

      console.log(
        '🟢 [DrizzleDatabaseManager] Migrações executadas com sucesso',
      );
    } catch (error) {
      console.error(
        '🔴 [DrizzleDatabaseManager] Erro ao executar migrações:',
        error,
      );
      throw error;
    }
  }

  private async checkTablesExist(): Promise<boolean> {
    if (!this.expoDb) return false;

    try {
      // Verificar se a tabela dose_reminders existe usando o expo database
      const result = (await this.expoDb.getFirstAsync(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='dose_reminders';
      `)) as { name: string } | null;

      return result !== null;
    } catch {
      return false;
    }
  }

  private async executeInitialMigration(): Promise<void> {
    if (!this.expoDb) throw new Error('Database not initialized');

    // SQL das migrações diretamente aqui (mais simples)
    const migrationSQL = `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "email" text,
        "avatar" text,
        "createdAt" text DEFAULT (datetime('now')) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "medicines" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "dosage" text NOT NULL,
        "frequency" integer NOT NULL,
        "unit" text DEFAULT 'comprimido' NOT NULL,
        "type" text NOT NULL,
        "color" text NOT NULL,
        "instructions" text,
        "imageUri" text,
        "isActive" integer DEFAULT true NOT NULL,
        "createdAt" text DEFAULT (datetime('now')) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "schedules" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "medicineId" integer NOT NULL,
        "time" text NOT NULL,
        "dosage" text NOT NULL,
        "isActive" integer DEFAULT true NOT NULL,
        "frequency" text DEFAULT 'daily' NOT NULL,
        "daysOfWeek" text,
        "startDate" text NOT NULL,
        "endDate" text,
        FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON UPDATE no action ON DELETE cascade
      );

      CREATE TABLE IF NOT EXISTS "dose_reminders" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "scheduleId" integer NOT NULL,
        "medicineId" integer NOT NULL,
        "scheduledTime" text NOT NULL,
        "reminderTime" text,
        "taken" integer DEFAULT false NOT NULL,
        "isTaken" integer DEFAULT false NOT NULL,
        "isSkipped" integer DEFAULT false NOT NULL,
        "takenAt" text,
        "createdAt" text DEFAULT (datetime('now')) NOT NULL,
        FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON UPDATE no action ON DELETE cascade
      );

      CREATE TABLE IF NOT EXISTS "notification_configs" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "medicineId" integer NOT NULL,
        "enabled" integer DEFAULT true NOT NULL,
        "sound" text DEFAULT 'default' NOT NULL,
        "vibration" integer DEFAULT true NOT NULL,
        "advanceMinutes" integer DEFAULT 0 NOT NULL,
        "createdAt" text DEFAULT (datetime('now')) NOT NULL,
        FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON UPDATE no action ON DELETE cascade
      );
    `;

    // Executar as migrações
    await this.expoDb.execAsync(migrationSQL);
    console.log('🟢 [DrizzleDatabaseManager] Migrações executadas');
  }

  async getDatabase(): Promise<ReturnType<typeof drizzle>> {
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

  // Métodos de utilidade
  async resetDatabase(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    console.log('🔵 [DrizzleDatabaseManager] Resetando banco de dados...');

    try {
      // Para resetar, vamos recriar a instância do banco
      const expoDb = openDatabaseSync('medicineApp.db');

      // Executar comandos SQL para deletar tabelas
      expoDb.execSync('DROP TABLE IF EXISTS dose_reminders;');
      expoDb.execSync('DROP TABLE IF EXISTS notification_configs;');
      expoDb.execSync('DROP TABLE IF EXISTS schedules;');
      expoDb.execSync('DROP TABLE IF EXISTS medicines;');
      expoDb.execSync('DROP TABLE IF EXISTS users;');

      // Recriar instância do Drizzle
      this.db = drizzle(expoDb, { schema });

      // Re-executar migrações
      await this.runMigrations();

      console.log('🟢 [DrizzleDatabaseManager] Reset concluído');
    } catch (error) {
      console.error('🔴 [DrizzleDatabaseManager] Erro no reset:', error);
      throw error;
    }
  } // Método para obter esquema
  getSchema() {
    return schema;
  }

  // Métodos de debug
  async getTableInfo(): Promise<{
    tables: string[];
    version: string;
  }> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Lista todas as tabelas do usuário (não incluindo tabelas do sistema)
      const tables = Object.keys(schema);

      return {
        tables,
        version: '1.0-drizzle',
      };
    } catch (error) {
      console.error('Error getting table info:', error);
      throw error;
    }
  }
}

// Re-exportar para compatibilidade
export { schema };
export type Database = ReturnType<typeof drizzle>;

// Instância singleton
export const drizzleDb = DrizzleDatabaseManager.getInstance();
