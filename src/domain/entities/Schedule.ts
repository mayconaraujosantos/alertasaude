export interface Schedule {
  id?: number;
  medicineId: number;
  intervalHours: number;
  durationDays: number;
  startTime: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
}

export class ScheduleEntity {
  constructor(
    public readonly id: number | undefined,
    public readonly medicineId: number,
    public readonly intervalHours: number,
    public readonly durationDays: number,
    public readonly startTime: string,
    public readonly notes: string | undefined,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(
    data: Omit<Schedule, 'id' | 'createdAt' | 'isActive'>,
  ): ScheduleEntity {
    return new ScheduleEntity(
      undefined,
      data.medicineId,
      data.intervalHours,
      data.durationDays,
      data.startTime,
      data.notes,
      true,
      new Date(),
    );
  }

  static fromPersistence(data: Schedule): ScheduleEntity {
    return new ScheduleEntity(
      data.id,
      data.medicineId,
      data.intervalHours,
      data.durationDays,
      data.startTime,
      data.notes,
      data.isActive,
      typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : data.createdAt,
    );
  }

  toPersistence(): Schedule {
    return {
      id: this.id,
      medicineId: this.medicineId,
      intervalHours: this.intervalHours,
      durationDays: this.durationDays,
      startTime: this.startTime,
      notes: this.notes,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }

  activate(): ScheduleEntity {
    return new ScheduleEntity(
      this.id,
      this.medicineId,
      this.intervalHours,
      this.durationDays,
      this.startTime,
      this.notes,
      true,
      this.createdAt,
    );
  }

  deactivate(): ScheduleEntity {
    return new ScheduleEntity(
      this.id,
      this.medicineId,
      this.intervalHours,
      this.durationDays,
      this.startTime,
      this.notes,
      false,
      this.createdAt,
    );
  }

  calculateDailyDoses(): number {
    return Math.floor(24 / this.intervalHours);
  }

  isExpired(): boolean {
    const today = new Date();
    const startDate = new Date(this.createdAt);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + this.durationDays);

    return today > endDate;
  }
}
