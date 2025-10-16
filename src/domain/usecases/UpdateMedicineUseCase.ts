import { MedicineEntity } from '../entities';
import { MedicineRepository } from '../repositories';

export class UpdateMedicineUseCase {
  constructor(private medicineRepository: MedicineRepository) {}

  async execute(
    id: number,
    name: string,
    dosage: string,
    description?: string,
    imageUri?: string,
  ): Promise<MedicineEntity> {
    if (!name.trim()) {
      throw new Error('Nome do medicamento é obrigatório');
    }

    if (!dosage.trim()) {
      throw new Error('Dosagem do medicamento é obrigatória');
    }

    const existingMedicine = await this.medicineRepository.findById(id);
    if (!existingMedicine) {
      throw new Error('Medicamento não encontrado');
    }

    const updatedMedicine = existingMedicine.updateInfo(
      name.trim(),
      description?.trim(),
      dosage.trim(),
      imageUri,
    );

    return await this.medicineRepository.update(updatedMedicine);
  }
}
