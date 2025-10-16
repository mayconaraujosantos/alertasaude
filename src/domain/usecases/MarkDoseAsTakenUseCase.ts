import { DoseReminderEntity } from '../entities';
import { DoseReminderRepository } from '../repositories';

export class MarkDoseAsTakenUseCase {
  constructor(private doseReminderRepository: DoseReminderRepository) {}

  async execute(doseId: number): Promise<DoseReminderEntity> {
    const dose = await this.doseReminderRepository.findById(doseId);

    if (!dose) {
      throw new Error('Lembrete de dose não encontrado');
    }

    if (dose.isTaken) {
      throw new Error('Esta dose já foi marcada como tomada');
    }

    const updatedDose = dose.markAsTaken();
    return await this.doseReminderRepository.update(updatedDose);
  }
}
