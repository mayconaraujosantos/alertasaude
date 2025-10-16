import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as schema from './schema';

// Abrir o banco de dados
const expoDb = openDatabaseSync('medicineApp.db');

// Criar instância do Drizzle
export const db = drizzle(expoDb, { schema });

// Função para executar migrações
export const runMigrations = async () => {
  try {
    console.log('🔵 [Drizzle] Iniciando migrações...');

    await migrate(db, {
      migrationsFolder: 'src/infrastructure/database/drizzle/migrations',
    });

    console.log('🟢 [Drizzle] Migrações executadas com sucesso!');
  } catch (error) {
    console.error('🔴 [Drizzle] Erro ao executar migrações:', error);
    throw error;
  }
};

export { schema };
export type Database = typeof db;
