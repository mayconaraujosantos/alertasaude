export interface DoseReminder {
  id?: number;
  scheduleId: number;
  medicineId: number;
  scheduledTime: Date;
  takenAt?: Date;
  isTaken: boolean;
  isSkipped: boolean;
  createdAt: Date;
}

export class DoseReminderEntity {
  constructor(
    public readonly id: number | undefined,
    public readonly scheduleId: number,
    public readonly medicineId: number,
    public readonly scheduledTime: Date,
    public readonly takenAt: Date | undefined,
    public readonly isTaken: boolean,
    public readonly isSkipped: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(
    scheduleId: number,
    medicineId: number,
    scheduledTime: Date,
  ): DoseReminderEntity {
    return new DoseReminderEntity(
      undefined,
      scheduleId,
      medicineId,
      scheduledTime,
      undefined,
      false,
      false,
      new Date(),
    );
  }

  static fromPersistence(data: DoseReminder): DoseReminderEntity {
    return new DoseReminderEntity(
      data.id,
      data.scheduleId,
      data.medicineId,
      typeof data.scheduledTime === 'string'
        ? new Date(data.scheduledTime)
        : data.scheduledTime,
      data.takenAt
        ? typeof data.takenAt === 'string'
          ? new Date(data.takenAt)
          : data.takenAt
        : undefined,
      data.isTaken,
      data.isSkipped,
      typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : data.createdAt,
    );
  }

  toPersistence(): DoseReminder {
    return {
      id: this.id,
      scheduleId: this.scheduleId,
      medicineId: this.medicineId,
      scheduledTime: this.scheduledTime,
      takenAt: this.takenAt,
      isTaken: this.isTaken,
      isSkipped: this.isSkipped,
      createdAt: this.createdAt,
    };
  }

  markAsTaken(): DoseReminderEntity {
    return new DoseReminderEntity(
      this.id,
      this.scheduleId,
      this.medicineId,
      this.scheduledTime,
      new Date(),
      true,
      false,
      this.createdAt,
    );
  }

  markAsSkipped(): DoseReminderEntity {
    return new DoseReminderEntity(
      this.id,
      this.scheduleId,
      this.medicineId,
      this.scheduledTime,
      this.takenAt,
      false,
      true,
      this.createdAt,
    );
  }

  isOverdue(): boolean {
    const now = new Date();
    return now > this.scheduledTime && !this.isTaken && !this.isSkipped;
  }

  isPending(): boolean {
    return !this.isTaken && !this.isSkipped;
  }

  getStatus(): 'pending' | 'taken' | 'skipped' | 'overdue' {
    if (this.isTaken) return 'taken';
    if (this.isSkipped) return 'skipped';
    if (this.isOverdue()) return 'overdue';
    return 'pending';
  }
}
