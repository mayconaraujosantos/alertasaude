import { MedicineEntity } from '../entities';

export interface MedicineRepository {
  create(medicine: MedicineEntity): Promise<MedicineEntity>;
  findById(id: number): Promise<MedicineEntity | null>;
  findByName(name: string): Promise<MedicineEntity[]>;
  update(medicine: MedicineEntity): Promise<MedicineEntity>;
  delete(id: number): Promise<void>;
  findAll(): Promise<MedicineEntity[]>;
  findActive(): Promise<MedicineEntity[]>;
}
