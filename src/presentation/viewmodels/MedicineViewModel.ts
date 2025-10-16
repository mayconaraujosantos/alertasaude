import { useState, useCallback } from 'react';
import { MedicineEntity } from '../../domain/entities';
import {
  CreateMedicineUseCase,
  GetMedicinesUseCase,
} from '../../domain/usecases';

export interface MedicineViewModelState {
  medicines: MedicineEntity[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filteredMedicines: MedicineEntity[];
}

export class MedicineViewModel {
  private createMedicineUseCase: CreateMedicineUseCase;
  private getMedicinesUseCase: GetMedicinesUseCase;

  constructor(
    createMedicineUseCase: CreateMedicineUseCase,
    getMedicinesUseCase: GetMedicinesUseCase,
  ) {
    this.createMedicineUseCase = createMedicineUseCase;
    this.getMedicinesUseCase = getMedicinesUseCase;
  }

  useState() {
    const [state, setState] = useState<MedicineViewModelState>({
      medicines: [],
      loading: false,
      error: null,
      searchQuery: '',
      filteredMedicines: [],
    });

    const updateState = useCallback(
      (updates: Partial<MedicineViewModelState>) => {
        setState(current => ({ ...current, ...updates }));
      },
      [],
    );

    const loadMedicines = useCallback(async () => {
      updateState({ loading: true, error: null });

      try {
        const medicines = await this.getMedicinesUseCase.execute();
        updateState({
          medicines,
          filteredMedicines: medicines,
          loading: false,
        });
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          loading: false,
        });
      }
    }, [updateState]);

    const searchMedicines = useCallback(
      (query: string) => {
        updateState({ searchQuery: query });

        if (!query.trim()) {
          updateState({ filteredMedicines: state.medicines });
          return;
        }

        const filtered = state.medicines.filter(
          medicine =>
            medicine.name.toLowerCase().includes(query.toLowerCase()) ||
            medicine.description?.toLowerCase().includes(query.toLowerCase()),
        );

        updateState({ filteredMedicines: filtered });
      },
      [state.medicines, updateState],
    );

    const createMedicine = useCallback(
      async (
        name: string,
        dosage: string,
        description?: string,
        imageUri?: string,
      ) => {
        updateState({ loading: true, error: null });

        try {
          await this.createMedicineUseCase.execute(
            name,
            dosage,
            description,
            imageUri,
          );
          await loadMedicines();
        } catch (error) {
          updateState({
            error:
              error instanceof Error
                ? error.message
                : 'Erro ao criar medicamento',
            loading: false,
          });
        }
      },
      [loadMedicines, updateState],
    );

    return {
      state,
      actions: {
        loadMedicines,
        searchMedicines,
        createMedicine,
      },
    };
  }
}
