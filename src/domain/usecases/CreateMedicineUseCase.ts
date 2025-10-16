import { MedicineEntity } from '../entities';
import { MedicineRepository } from '../repositories';

export class CreateMedicineUseCase {
  constructor(private medicineRepository: MedicineRepository) {}

  async execute(
    name: string,
    dosage: string,
    description?: string,
    imageUri?: string,
    quantidade?: string,
    unidade?: string,
    forma?: string,
  ): Promise<MedicineEntity> {
    console.log('🔵 [CreateMedicineUseCase] Iniciando criação de medicamento');
    console.log('🔵 [CreateMedicineUseCase] Parâmetros recebidos:', {
      name,
      dosage,
      description,
      imageUri,
      quantidade,
      unidade,
      forma,
    });

    try {
      if (!name.trim()) {
        const error = 'Nome do medicamento é obrigatório';
        console.error('🔴 [CreateMedicineUseCase] Validação falhou:', error);
        throw new Error(error);
      }

      if (!dosage.trim()) {
        const error = 'Dosagem do medicamento é obrigatória';
        console.error('🔴 [CreateMedicineUseCase] Validação falhou:', error);
        throw new Error(error);
      }

      console.log(
        '🟢 [CreateMedicineUseCase] Validações passaram, criando entidade',
      );

      const medicineData = {
        name: name.trim(),
        dosage: dosage.trim(),
        description: description?.trim(),
        imageUri,
        quantidade: quantidade?.trim(),
        unidade: unidade?.trim(),
        forma: forma?.trim(),
      };

      console.log(
        '🔵 [CreateMedicineUseCase] Dados processados para entidade:',
        medicineData,
      );

      const medicine = MedicineEntity.create(medicineData);

      console.log(
        '🟢 [CreateMedicineUseCase] Entidade criada, chamando repository',
      );

      const result = await this.medicineRepository.create(medicine);

      console.log(
        '🟢 [CreateMedicineUseCase] Medicamento criado com sucesso:',
        {
          id: result.id,
          name: result.name,
        },
      );

      return result;
    } catch (error) {
      console.error(
        '🔴 [CreateMedicineUseCase] Erro na criação do medicamento:',
        error,
      );
      throw error;
    }
  }
}
