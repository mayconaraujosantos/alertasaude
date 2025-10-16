// Este arquivo é necessário para as migrações do Drizzle com Expo SQLite
// Mas como o comando migrate não funciona com Expo SQLite,
// vamos usar uma abordagem manual no DrizzleDatabaseManager

const migrations = {
  '0000_shallow_grim_reaper': `
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

CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"avatar" text,
	"createdAt" text DEFAULT (datetime('now')) NOT NULL
);
  `,
};

export default migrations;
