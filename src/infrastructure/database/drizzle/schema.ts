import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Tabela de usuários
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email'),
  avatarUri: text('avatarUri'),
  createdAt: text('createdAt')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Tabela de medicamentos
export const medicines = sqliteTable('medicines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  dosage: text('dosage').notNull(),
  quantidade: text('quantidade'),
  unidade: text('unidade'),
  forma: text('forma'),
  imageUri: text('imageUri'),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('createdAt')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Tabela de agendamentos
export const schedules = sqliteTable('schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  medicineId: integer('medicineId')
    .notNull()
    .references(() => medicines.id, { onDelete: 'cascade' }),
  intervalHours: integer('intervalHours'),
  durationDays: integer('durationDays'),
  startTime: text('startTime'),
  time: text('time'),
  days: text('days'),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('createdAt')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Tabela de lembretes de doses
export const doseReminders = sqliteTable('dose_reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scheduleId: integer('scheduleId')
    .notNull()
    .references(() => schedules.id, { onDelete: 'cascade' }),
  medicineId: integer('medicineId')
    .notNull()
    .references(() => medicines.id, { onDelete: 'cascade' }),
  scheduledTime: text('scheduledTime').notNull(),
  reminderTime: text('reminderTime'),
  taken: integer('taken', { mode: 'boolean' }).notNull().default(false),
  isTaken: integer('isTaken', { mode: 'boolean' }).notNull().default(false),
  isSkipped: integer('isSkipped', { mode: 'boolean' }).notNull().default(false),
  takenAt: text('takenAt'),
  createdAt: text('createdAt')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Tabela de configurações de notificação
export const notificationConfigs = sqliteTable('notification_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  medicineId: integer('medicineId')
    .notNull()
    .references(() => medicines.id, { onDelete: 'cascade' }),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  soundEnabled: integer('soundEnabled', { mode: 'boolean' })
    .notNull()
    .default(true),
  vibrationEnabled: integer('vibrationEnabled', { mode: 'boolean' })
    .notNull()
    .default(true),
  advanceMinutes: integer('advanceMinutes').notNull().default(0),
  createdAt: text('createdAt')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Tipos TypeScript derivados do schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Medicine = typeof medicines.$inferSelect;
export type NewMedicine = typeof medicines.$inferInsert;

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

export type DoseReminder = typeof doseReminders.$inferSelect;
export type NewDoseReminder = typeof doseReminders.$inferInsert;

export type NotificationConfig = typeof notificationConfigs.$inferSelect;
export type NewNotificationConfig = typeof notificationConfigs.$inferInsert;
