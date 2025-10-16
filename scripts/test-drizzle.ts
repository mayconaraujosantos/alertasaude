#!/usr/bin/env ts-node

/**
 * Script de teste para validar o Drizzle ORM
 * Execute: npx ts-node scripts/test-drizzle.ts
 */

import { DrizzleDatabaseManager } from '../src/infrastructure/database/DrizzleDatabaseManager';
import { DrizzleDoseReminderRepository } from '../src/data/repositories/DrizzleDoseReminderRepository';

async function testDrizzle() {
  console.log('🧪 Testando integração Drizzle ORM...');

  try {
    // 1. Inicializar database
    console.log('🔵 1. Inicializando DrizzleDatabaseManager...');
    const dbManager = DrizzleDatabaseManager.getInstance();
    await dbManager.initDatabase();
    console.log('🟢 Database inicializado com sucesso!');

    // 2. Testar repository
    console.log('🔵 2. Testando DrizzleDoseReminderRepository...');
    const repository = new DrizzleDoseReminderRepository(dbManager);

    // 3. Buscar todos os reminders
    console.log('🔵 3. Buscando todos os lembretes...');
    const allReminders = await repository.findAll();
    console.log(`🟢 Encontrados ${allReminders.length} lembretes no total`);

    // 4. Buscar lembretes pendentes
    console.log('🔵 4. Buscando lembretes pendentes...');
    const pendingReminders = await repository.findPending();
    console.log(
      `🟢 Encontrados ${pendingReminders.length} lembretes pendentes`,
    );

    // 5. Buscar lembretes vencidos
    console.log('🔵 5. Buscando lembretes vencidos...');
    const overdueReminders = await repository.findOverdue();
    console.log(`🟢 Encontrados ${overdueReminders.length} lembretes vencidos`);

    // 6. Buscar por intervalo de data (hoje)
    console.log('🔵 6. Buscando lembretes de hoje...');
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
    console.log(`🟢 Encontrados ${todayReminders.length} lembretes para hoje`);

    // 7. Mostrar detalhes dos primeiros reminders
    if (allReminders.length > 0) {
      console.log('🔵 7. Detalhes dos primeiros lembretes:');
      allReminders.slice(0, 3).forEach((reminder, index) => {
        console.log(
          `   ${index + 1}. ID: ${reminder.id}, Medicine: ${reminder.medicineId}, Scheduled: ${reminder.scheduledTime.toISOString()}, Taken: ${reminder.isTaken}`,
        );
      });
    }

    console.log('🎉 Teste Drizzle concluído com sucesso!');
  } catch (error) {
    console.error('🔴 Erro no teste Drizzle:', error);
    process.exit(1);
  }
}

// Execute o teste
testDrizzle().catch(console.error);
