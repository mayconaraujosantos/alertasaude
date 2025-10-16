import { useState, useEffect, useCallback } from 'react';
import { MedicineEntity } from '../../domain/entities';
import {
  GetMedicinesUseCase,
  CreateMedicineUseCase,
} from '../../domain/usecases';

export interface UseMedicinesReturn {
  medicines: MedicineEntity[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filteredMedicines: MedicineEntity[];
  loadMedicines: () => Promise<void>;
  searchMedicines: (query: string) => void;
  createMedicine: (
    name: string,
    dosage: string,
    description?: string,
    imageUri?: string,
  ) => Promise<void>;
}

export function useMedicines(
  getMedicinesUseCase: GetMedicinesUseCase,
  createMedicineUseCase: CreateMedicineUseCase,
): UseMedicinesReturn {
  const [medicines, setMedicines] = useState<MedicineEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<MedicineEntity[]>(
    [],
  );

  const loadMedicines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMedicinesUseCase.execute();
      setMedicines(result);
      setFilteredMedicines(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [getMedicinesUseCase]);

  const searchMedicines = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setFilteredMedicines(medicines);
        return;
      }

      const filtered = medicines.filter(
        medicine =>
          medicine.name.toLowerCase().includes(query.toLowerCase()) ||
          medicine.description?.toLowerCase().includes(query.toLowerCase()),
      );

      setFilteredMedicines(filtered);
    },
    [medicines],
  );

  const createMedicine = useCallback(
    async (
      name: string,
      dosage: string,
      description?: string,
      imageUri?: string,
    ) => {
      setLoading(true);
      setError(null);

      try {
        await createMedicineUseCase.execute(
          name,
          dosage,
          description,
          imageUri,
        );
        await loadMedicines();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao criar medicamento',
        );
      } finally {
        setLoading(false);
      }
    },
    [createMedicineUseCase, loadMedicines],
  );

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  return {
    medicines,
    loading,
    error,
    searchQuery,
    filteredMedicines,
    loadMedicines,
    searchMedicines,
    createMedicine,
  };
}
