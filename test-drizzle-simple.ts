import { DrizzleDatabaseManager } from './src/infrastructure/database/DrizzleDatabaseManager';
import { DrizzleDoseReminderRepository } from './src/data/repositories/DrizzleDoseReminderRepository';

/**
 * Teste simples para validar o Drizzle ORM
 * Para executar: npx tsx test-drizzle-simple.ts
 */
async function testDrizzleSimple() {
  console.log('🧪 [Test] Iniciando teste básico do Drizzle...');

  try {
    // 1. Inicializar o database manager
    console.log('🔵 [Test] 1. Inicializando DrizzleDatabaseManager...');
    const dbManager = DrizzleDatabaseManager.getInstance();
    await dbManager.initDatabase();
    console.log('🟢 [Test] Database inicializado!');

    // 2. Criar repository
    console.log('🔵 [Test] 2. Criando repository...');
    const repository = new DrizzleDoseReminderRepository(dbManager);
    console.log('🟢 [Test] Repository criado!');

    // 3. Testar consulta básica
    console.log('🔵 [Test] 3. Testando consulta findAll...');
    const allReminders = await repository.findAll();
    console.log(`🟢 [Test] Encontrados ${allReminders.length} lembretes`);

    // 4. Testar consulta de lembretes pendentes
    console.log('🔵 [Test] 4. Testando consulta findPending...');
    const pendingReminders = await repository.findPending();
    console.log(
      `🟢 [Test] Encontrados ${pendingReminders.length} lembretes pendentes`,
    );

    // 5. Testar consulta de lembretes vencidos
    console.log('🔵 [Test] 5. Testando consulta findOverdue...');
    const overdueReminders = await repository.findOverdue();
    console.log(
      `🟢 [Test] Encontrados ${overdueReminders.length} lembretes vencidos`,
    );

    // 6. Buscar lembretes de hoje
    console.log('🔵 [Test] 6. Testando consulta por período (hoje)...');
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

    const todayReminders = await repository.findByDateRange(
      startOfDay,
      endOfDay,
    );
    console.log(
      `🟢 [Test] Encontrados ${todayReminders.length} lembretes para hoje`,
    );

    // 7. Mostrar alguns detalhes
    if (allReminders.length > 0) {
      console.log('🔵 [Test] 7. Mostrando detalhes dos primeiros 3 lembretes:');
      allReminders.slice(0, 3).forEach((reminder, index) => {
        console.log(
          `   ${index + 1}. ID: ${reminder.id}, Medicine: ${reminder.medicineId}, Time: ${reminder.scheduledTime.toISOString()}, Taken: ${reminder.isTaken}`,
        );
      });
    }

    console.log('🎉 [Test] Teste Drizzle concluído com SUCESSO!');
    process.exit(0);
  } catch (error) {
    console.error('🔴 [Test] ERRO no teste Drizzle:', error);
    process.exit(1);
  }
}

// Executar o teste
testDrizzleSimple();
