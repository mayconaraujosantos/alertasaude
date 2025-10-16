CREATE TABLE `dose_reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scheduleId` integer NOT NULL,
	`medicineId` integer NOT NULL,
	`scheduledTime` text NOT NULL,
	`reminderTime` text,
	`taken` integer DEFAULT false NOT NULL,
	`isTaken` integer DEFAULT false NOT NULL,
	`isSkipped` integer DEFAULT false NOT NULL,
	`takenAt` text,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`scheduleId`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`medicineId`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `medicines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`dosage` text NOT NULL,
	`quantidade` text,
	`unidade` text,
	`forma` text,
	`imageUri` text,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notification_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`medicineId` integer NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`soundEnabled` integer DEFAULT true NOT NULL,
	`vibrationEnabled` integer DEFAULT true NOT NULL,
	`advanceMinutes` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`medicineId`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`medicineId` integer NOT NULL,
	`intervalHours` integer,
	`durationDays` integer,
	`startTime` text,
	`time` text,
	`days` text,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`medicineId`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`avatarUri` text,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL
);
