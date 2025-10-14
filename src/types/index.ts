export interface User {
  id?: number;
  name: string;
  email?: string;
  avatarUri?: string;
  createdAt: string;
}

export interface Medicine {
  id?: number;
  name: string;
  description?: string;
  dosage: string; // Ex: "500mg", "2 comprimidos"
  imageUri?: string;
  createdAt: string;
}

export interface MedicineSchedule {
  id?: number;
  medicineId: number;
  startDate: string;
  endDate: string;
  intervalHours: number; // Intervalo entre doses em horas
  timesPerDay: number;
  totalDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface Schedule {
  id?: number;
  medicineId: number;
  intervalHours: number; // Intervalo entre doses em horas
  durationDays: number; // Duração do tratamento em dias
  startTime: string; // Horário da primeira dose (HH:MM)
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DoseReminder {
  id?: number;
  scheduleId: number;
  medicineId: number;
  scheduledTime: string;
  takenAt?: string;
  isTaken: boolean;
  isSkipped: boolean;
  createdAt: string;
}

export interface NotificationConfig {
  id?: number;
  medicineId: number;
  isEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminderText: string;
}
