import { DoseReminderEntity } from '../src/domain/entities/DoseReminder';
import { DoseReminderRepository } from '../src/domain/repositories/DoseReminderRepository';

// Mock do repository para testes
const mockRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByScheduleId: jest.fn(),
  findByMedicineId: jest.fn(),
  findPending: jest.fn(),
  findOverdue: jest.fn(),
  findTaken: jest.fn(),
  findByDateRange: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  deleteByScheduleId: jest.fn(),
};

// Classe para simular o hook useReminders
class RemindersService {
  constructor(private repository: DoseReminderRepository) {}

  async markAsTaken(reminderId: number): Promise<DoseReminderEntity> {
    const reminder = await this.repository.findById(reminderId);
    if (!reminder) {
      throw new Error('Lembrete não encontrado');
    }

    const updatedReminder = reminder.markAsTaken();
    await this.repository.update(updatedReminder);
    return updatedReminder;
  }

  async markAsSkipped(reminderId: number): Promise<DoseReminderEntity> {
    const reminder = await this.repository.findById(reminderId);
    if (!reminder) {
      throw new Error('Lembrete não encontrado');
    }

    const updatedReminder = reminder.markAsSkipped();
    await this.repository.update(updatedReminder);
    return updatedReminder;
  }
}

describe('Reminder Actions TDD', () => {
  let service: RemindersService;
  let mockReminder: DoseReminderEntity;

  beforeEach(() => {
    // Reset todos os mocks
    jest.clearAllMocks();

    // Criar instância do service
    service = new RemindersService(mockRepository);

    // Criar lembrete mock para testes
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2); // 2 horas no futuro

    mockReminder = new DoseReminderEntity(
      1, // id
      10, // scheduleId
      5, // medicineId
      futureDate, // scheduledTime - no futuro para ser "pending"
      undefined, // takenAt
      false, // isTaken
      false, // isSkipped
      new Date(), // createdAt
    );
  });

  describe('markAsTaken', () => {
    it('deve marcar lembrete como tomado e persistir no repositório', async () => {
      // Arrange - TDD Red Phase
      const reminderId = 1;
      mockRepository.findById.mockResolvedValue(mockReminder);
      mockRepository.update.mockResolvedValue(mockReminder.markAsTaken());

      // Act
      const result = await service.markAsTaken(reminderId);

      // Assert - Verificações do TDD
      expect(mockRepository.findById).toHaveBeenCalledWith(reminderId);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);

      expect(result.isTaken).toBe(true);
      expect(result.isSkipped).toBe(false);
      expect(result.takenAt).toBeInstanceOf(Date);
      expect(result.takenAt?.getTime()).toBeGreaterThanOrEqual(
        mockReminder.createdAt.getTime(),
      );

      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: reminderId,
          isTaken: true,
          isSkipped: false,
          takenAt: expect.any(Date),
        }),
      );
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando lembrete não for encontrado', async () => {
      // Arrange - TDD Red Phase
      const reminderId = 999;
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.markAsTaken(reminderId)).rejects.toThrow(
        'Lembrete não encontrado',
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(reminderId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve resetar isSkipped quando marcar como tomado', async () => {
      // Arrange - Lembrete que já foi pulado
      const skippedReminder = new DoseReminderEntity(
        1,
        10,
        5,
        new Date('2025-10-16T12:00:00Z'),
        undefined,
        false, // isTaken
        true, // isSkipped - já estava pulado
        new Date('2025-10-16T10:00:00Z'),
      );

      mockRepository.findById.mockResolvedValue(skippedReminder);
      mockRepository.update.mockResolvedValue(skippedReminder.markAsTaken());

      // Act
      const result = await service.markAsTaken(1);

      // Assert - Deve resetar isSkipped para false
      expect(result.isTaken).toBe(true);
      expect(result.isSkipped).toBe(false);
      expect(result.takenAt).toBeInstanceOf(Date);
    });

    it('deve manter outros dados do lembrete inalterados', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockReminder);
      mockRepository.update.mockResolvedValue(mockReminder.markAsTaken());

      // Act
      const result = await service.markAsTaken(1);

      // Assert - Dados que devem permanecer iguais
      expect(result.id).toBe(mockReminder.id);
      expect(result.scheduleId).toBe(mockReminder.scheduleId);
      expect(result.medicineId).toBe(mockReminder.medicineId);
      expect(result.scheduledTime).toEqual(mockReminder.scheduledTime);
      expect(result.createdAt).toEqual(mockReminder.createdAt);
    });

    it('deve falhar quando repository.update lança erro', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockReminder);
      mockRepository.update.mockRejectedValue(new Error('Erro de conexão'));

      // Act & Assert
      await expect(service.markAsTaken(1)).rejects.toThrow('Erro de conexão');

      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('markAsSkipped', () => {
    it('deve marcar lembrete como pulado e persistir no repositório', async () => {
      // Arrange - TDD Red Phase
      const reminderId = 1;
      mockRepository.findById.mockResolvedValue(mockReminder);
      mockRepository.update.mockResolvedValue(mockReminder.markAsSkipped());

      // Act
      const result = await service.markAsSkipped(reminderId);

      // Assert - Verificações do TDD
      expect(mockRepository.findById).toHaveBeenCalledWith(reminderId);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);

      expect(result.isTaken).toBe(false);
      expect(result.isSkipped).toBe(true);
      expect(result.takenAt).toBeUndefined(); // Não deve definir takenAt

      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: reminderId,
          isTaken: false,
          isSkipped: true,
          takenAt: undefined,
        }),
      );
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando lembrete não for encontrado', async () => {
      // Arrange - TDD Red Phase
      const reminderId = 999;
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.markAsSkipped(reminderId)).rejects.toThrow(
        'Lembrete não encontrado',
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(reminderId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve resetar isTaken quando marcar como pulado', async () => {
      // Arrange - Lembrete que já foi tomado
      const takenReminder = new DoseReminderEntity(
        1,
        10,
        5,
        new Date('2025-10-16T12:00:00Z'),
        new Date('2025-10-16T12:30:00Z'), // takenAt
        true, // isTaken - já estava tomado
        false, // isSkipped
        new Date('2025-10-16T10:00:00Z'),
      );

      mockRepository.findById.mockResolvedValue(takenReminder);
      mockRepository.update.mockResolvedValue(takenReminder.markAsSkipped());

      // Act
      const result = await service.markAsSkipped(1);

      // Assert - Deve resetar isTaken para false, mas preservar takenAt
      expect(result.isTaken).toBe(false);
      expect(result.isSkipped).toBe(true);
      expect(result.takenAt).toEqual(takenReminder.takenAt); // Preserva takenAt original
    });

    it('deve manter outros dados do lembrete inalterados', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockReminder);
      mockRepository.update.mockResolvedValue(mockReminder.markAsSkipped());

      // Act
      const result = await service.markAsSkipped(1);

      // Assert - Dados que devem permanecer iguais
      expect(result.id).toBe(mockReminder.id);
      expect(result.scheduleId).toBe(mockReminder.scheduleId);
      expect(result.medicineId).toBe(mockReminder.medicineId);
      expect(result.scheduledTime).toEqual(mockReminder.scheduledTime);
      expect(result.createdAt).toEqual(mockReminder.createdAt);
    });
  });

  describe('Business Rules - Regras de Negócio', () => {
    it('não deve ser possível ter isTaken e isSkipped true ao mesmo tempo', () => {
      // Arrange
      const reminder = mockReminder;

      // Act & Assert - markAsTaken deve resetar isSkipped
      const takenReminder = reminder.markAsTaken();
      expect(takenReminder.isTaken).toBe(true);
      expect(takenReminder.isSkipped).toBe(false);

      // Act & Assert - markAsSkipped deve resetar isTaken
      const skippedReminder = reminder.markAsSkipped();
      expect(skippedReminder.isTaken).toBe(false);
      expect(skippedReminder.isSkipped).toBe(true);
    });

    it('deve mudar status corretamente baseado nas ações', () => {
      // Test Status Changes
      expect(mockReminder.getStatus()).toBe('pending');

      const takenReminder = mockReminder.markAsTaken();
      expect(takenReminder.getStatus()).toBe('taken');

      const skippedReminder = mockReminder.markAsSkipped();
      expect(skippedReminder.getStatus()).toBe('skipped');
    });

    it('deve permitir alternar entre tomado e pulado', async () => {
      // Arrange - Simular troca de estados
      mockRepository.findById.mockResolvedValue(mockReminder);

      // Act 1 - Marcar como tomado
      mockRepository.update.mockResolvedValueOnce(mockReminder.markAsTaken());
      const takenResult = await service.markAsTaken(1);

      // Assert 1
      expect(takenResult.isTaken).toBe(true);
      expect(takenResult.isSkipped).toBe(false);

      // Act 2 - Alterar para pulado (mockRepository.findById agora retorna o tomado)
      const takenReminder = mockReminder.markAsTaken();
      mockRepository.findById.mockResolvedValue(takenReminder);
      mockRepository.update.mockResolvedValueOnce(
        takenReminder.markAsSkipped(),
      );

      const skippedResult = await service.markAsSkipped(1);

      // Assert 2
      expect(skippedResult.isTaken).toBe(false);
      expect(skippedResult.isSkipped).toBe(true);
    });
  });

  describe('Integration Tests - Persistência', () => {
    it('deve chamar repository.update com os dados corretos para markAsTaken', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockReminder);
      const expectedUpdate = mockReminder.markAsTaken();
      mockRepository.update.mockResolvedValue(expectedUpdate);

      // Act
      await service.markAsTaken(1);

      // Assert - Verificar se update foi chamado com dados corretos
      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          scheduleId: 10,
          medicineId: 5,
          isTaken: true,
          isSkipped: false,
          takenAt: expect.any(Date),
          scheduledTime: mockReminder.scheduledTime,
          createdAt: mockReminder.createdAt,
        }),
      );
    });

    it('deve chamar repository.update com os dados corretos para markAsSkipped', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockReminder);
      const expectedUpdate = mockReminder.markAsSkipped();
      mockRepository.update.mockResolvedValue(expectedUpdate);

      // Act
      await service.markAsSkipped(1);

      // Assert - Verificar se update foi chamado com dados corretos
      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          scheduleId: 10,
          medicineId: 5,
          isTaken: false,
          isSkipped: true,
          takenAt: undefined, // Deve permanecer undefined
          scheduledTime: mockReminder.scheduledTime,
          createdAt: mockReminder.createdAt,
        }),
      );
    });
  });
});
