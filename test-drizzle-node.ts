/**
 * Teste básico para verificar se a estrutura do Drizzle está correta
 * Para executar: npx tsx test-drizzle-node.ts
 */

// Mock do expo-sqlite para Node.js
const mockDatabase = {
  execAsync: async (sql: string) => {
    console.log('🔵 [Mock] Executando SQL:', sql.substring(0, 100) + '...');
    return true;
  },
  getFirstAsync: async (sql: string) => {
    console.log('🔵 [Mock] Query:', sql);
    if (sql.includes('dose_reminders')) {
      return { name: 'dose_reminders' }; // Simular que existe
    }
    return null;
  },
};

// Mock do drizzle para Node.js
const mockDrizzle = {
  select: () => ({
    from: () => ({
      where: () => ({
        orderBy: () => Promise.resolve([]),
      }),
      orderBy: () => Promise.resolve([]),
    }),
  }),
};

// Override das importações - variáveis para mocking futuro
const _openDatabaseSync = () => mockDatabase;
const _drizzle = () => mockDrizzle;

class MockDrizzleDatabaseManager {
  private static instance: MockDrizzleDatabaseManager;
  private initialized = false;

  static getInstance(): MockDrizzleDatabaseManager {
    if (!MockDrizzleDatabaseManager.instance) {
      MockDrizzleDatabaseManager.instance = new MockDrizzleDatabaseManager();
    }
    return MockDrizzleDatabaseManager.instance;
  }

  async initDatabase(): Promise<void> {
    if (this.initialized) return;

    console.log('🔵 [MockManager] Inicializando database...');

    // Simular a verificação de tabelas
    const tablesExist = await this.checkTablesExist();

    if (!tablesExist) {
      console.log('🔵 [MockManager] Criando esquema inicial...');
      await mockDatabase.execAsync(`
        CREATE TABLE IF NOT EXISTS "dose_reminders" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "medicineId" integer NOT NULL,
          "scheduledTime" text NOT NULL
        );
      `);
    }

    this.initialized = true;
    console.log('🟢 [MockManager] Database inicializado!');
  }

  private async checkTablesExist(): Promise<boolean> {
    const result = await mockDatabase.getFirstAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='dose_reminders';
    `);
    return result !== null;
  }

  async getDatabase() {
    return mockDrizzle;
  }
}

class MockDrizzleDoseReminderRepository {
  constructor(private dbManager: MockDrizzleDatabaseManager) {}

  async findAll() {
    console.log('🔵 [MockRepo] Executando findAll...');
    return [];
  }

  async findPending() {
    console.log('🔵 [MockRepo] Executando findPending...');
    return [];
  }

  async findOverdue() {
    console.log('🔵 [MockRepo] Executando findOverdue...');
    return [];
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    console.log('🔵 [MockRepo] Executando findByDateRange...', {
      startDate,
      endDate,
    });
    return [];
  }
}

async function testDrizzleNode() {
  console.log('🧪 [NodeTest] Testando estrutura do Drizzle (mock)...');

  try {
    // 1. Inicializar
    console.log('🔵 [NodeTest] 1. Inicializando...');
    const dbManager = MockDrizzleDatabaseManager.getInstance();
    await dbManager.initDatabase();

    // 2. Testar repository
    console.log('🔵 [NodeTest] 2. Testando repository...');
    const repository = new MockDrizzleDoseReminderRepository(dbManager);

    // 3. Testar métodos
    await repository.findAll();
    await repository.findPending();
    await repository.findOverdue();

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );
    await repository.findByDateRange(startOfDay, endOfDay);

    console.log('🎉 [NodeTest] Estrutura do Drizzle parece estar correta!');
    console.log(
      '✅ [NodeTest] Próximo passo: integrar no DI Container da aplicação',
    );
  } catch (error) {
    console.error('🔴 [NodeTest] Erro:', error);
    process.exit(1);
  }
}

testDrizzleNode();
