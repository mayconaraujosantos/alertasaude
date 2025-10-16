import { ScheduleEntity, DoseReminderEntity } from '../entities';
import { ScheduleRepository, DoseReminderRepository } from '../repositories';

export class CreateScheduleUseCase {
  constructor(
    private scheduleRepository: ScheduleRepository,
    private doseReminderRepository: DoseReminderRepository,
  ) {}

  async execute(
    medicineId: number,
    intervalHours: number,
    durationDays: number,
    startTime: string,
    notes?: string,
  ): Promise<ScheduleEntity> {
    if (intervalHours <= 0) {
      throw new Error('Intervalo entre doses deve ser maior que 0');
    }

    if (durationDays <= 0) {
      throw new Error('Duração do tratamento deve ser maior que 0');
    }

    if (!startTime) {
      throw new Error('Horário de início é obrigatório');
    }

    const schedule = ScheduleEntity.create({
      medicineId,
      intervalHours,
      durationDays,
      startTime,
      notes,
    });

    const createdSchedule = await this.scheduleRepository.create(schedule);

    // Gerar lembretes automáticos
    if (createdSchedule.id) {
      await this.generateDoseReminders(createdSchedule);
    }

    return createdSchedule;
  }

  private async generateDoseReminders(schedule: ScheduleEntity): Promise<void> {
    if (!schedule.id) return;

    const reminders: DoseReminderEntity[] = [];
    const startDate = new Date();
    const [hours, minutes] = schedule.startTime.split(':').map(Number);

    for (let day = 0; day < schedule.durationDays; day++) {
      const dailyDoses = schedule.calculateDailyDoses();

      for (let dose = 0; dose < dailyDoses; dose++) {
        const reminderTime = new Date(startDate);
        reminderTime.setDate(startDate.getDate() + day);
        reminderTime.setHours(
          hours + dose * schedule.intervalHours,
          minutes,
          0,
          0,
        );

        const reminder = DoseReminderEntity.create(
          schedule.id,
          schedule.medicineId,
          reminderTime,
        );

        reminders.push(reminder);
      }
    }

    // Salvar todos os lembretes
    for (const reminder of reminders) {
      await this.doseReminderRepository.create(reminder);
    }
  }
}
