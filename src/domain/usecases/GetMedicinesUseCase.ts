import { MedicineEntity } from '../entities';
import { MedicineRepository } from '../repositories';

export class GetMedicinesUseCase {
  constructor(private medicineRepository: MedicineRepository) {}

  async execute(): Promise<MedicineEntity[]> {
    return await this.medicineRepository.findAll();
  }

  async getActive(): Promise<MedicineEntity[]> {
    return await this.medicineRepository.findActive();
  }

  async searchByName(name: string): Promise<MedicineEntity[]> {
    if (!name.trim()) {
      return [];
    }

    return await this.medicineRepository.findByName(name.trim());
  }
}
