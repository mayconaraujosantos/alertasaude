// Dependency Injection Container
import { DatabaseManager } from '../../infrastructure/database/DatabaseManager';
import { DrizzleDatabaseManager } from '../../infrastructure/database/DrizzleDatabaseManager';
import { SQLiteMedicineRepository } from '../../data/repositories/SQLiteMedicineRepository';
import { SQLiteScheduleRepository } from '../../data/repositories/SQLiteScheduleRepository';
import { SQLiteDoseReminderRepository } from '../../data/repositories/SQLiteDoseReminderRepository';
import { DrizzleDoseReminderRepository } from '../../data/repositories/DrizzleDoseReminderRepository';
import { SQLiteUserRepository } from '../../data/repositories/SQLiteUserRepository';
import {
  CreateMedicineUseCase,
  GetMedicinesUseCase,
  UpdateMedicineUseCase,
  CreateScheduleUseCase,
  MarkDoseAsTakenUseCase,
  GetDoseRemindersUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
  GetDatabaseStatsUseCase,
  ExportDatabaseUseCase,
  ClearDatabaseUseCase,
  GetDatabaseInfoUseCase,
  ShareDatabasePathUseCase,
} from '../../domain/usecases';

export class DIContainer {
  private static instance: DIContainer;

  // Repositories
  private _medicineRepository?: SQLiteMedicineRepository;
  private _scheduleRepository?: SQLiteScheduleRepository;
  private _doseReminderRepository?: SQLiteDoseReminderRepository;
  private _drizzleDoseReminderRepository?: DrizzleDoseReminderRepository;
  private _userRepository?: SQLiteUserRepository;

  // Use Cases
  private _createMedicineUseCase?: CreateMedicineUseCase;
  private _updateMedicineUseCase?: UpdateMedicineUseCase;
  private _getMedicinesUseCase?: GetMedicinesUseCase;
  private _createScheduleUseCase?: CreateScheduleUseCase;
  private _markDoseAsTakenUseCase?: MarkDoseAsTakenUseCase;
  private _getDoseRemindersUseCase?: GetDoseRemindersUseCase;
  private _getUserUseCase?: GetUserUseCase;
  private _updateUserUseCase?: UpdateUserUseCase;
  private _getDatabaseStatsUseCase?: GetDatabaseStatsUseCase;
  private _exportDatabaseUseCase?: ExportDatabaseUseCase;
  private _clearDatabaseUseCase?: ClearDatabaseUseCase;
  private _getDatabaseInfoUseCase?: GetDatabaseInfoUseCase;
  private _shareDatabasePathUseCase?: ShareDatabasePathUseCase;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Infrastructure getters
  get databaseManager(): DatabaseManager {
    return DatabaseManager.getInstance();
  }

  get drizzleDatabaseManager(): DrizzleDatabaseManager {
    return DrizzleDatabaseManager.getInstance();
  }

  // Repository getters
  get medicineRepository(): SQLiteMedicineRepository {
    if (!this._medicineRepository) {
      this._medicineRepository = new SQLiteMedicineRepository(
        DatabaseManager.getInstance(),
      );
    }
    return this._medicineRepository;
  }

  get scheduleRepository(): SQLiteScheduleRepository {
    if (!this._scheduleRepository) {
      this._scheduleRepository = new SQLiteScheduleRepository(
        DatabaseManager.getInstance(),
      );
    }
    return this._scheduleRepository;
  }

  get doseReminderRepository(): SQLiteDoseReminderRepository {
    if (!this._doseReminderRepository) {
      this._doseReminderRepository = new SQLiteDoseReminderRepository(
        DatabaseManager.getInstance(),
      );
    }
    return this._doseReminderRepository;
  }

  get drizzleDoseReminderRepository(): DrizzleDoseReminderRepository {
    if (!this._drizzleDoseReminderRepository) {
      this._drizzleDoseReminderRepository = new DrizzleDoseReminderRepository(
        DrizzleDatabaseManager.getInstance(),
      );
    }
    return this._drizzleDoseReminderRepository;
  }

  get userRepository(): SQLiteUserRepository {
    if (!this._userRepository) {
      this._userRepository = new SQLiteUserRepository(
        DatabaseManager.getInstance(),
      );
    }
    return this._userRepository;
  }

  // Use Case getters
  get createMedicineUseCase(): CreateMedicineUseCase {
    if (!this._createMedicineUseCase) {
      this._createMedicineUseCase = new CreateMedicineUseCase(
        this.medicineRepository,
      );
    }
    return this._createMedicineUseCase;
  }

  get updateMedicineUseCase(): UpdateMedicineUseCase {
    if (!this._updateMedicineUseCase) {
      this._updateMedicineUseCase = new UpdateMedicineUseCase(
        this.medicineRepository,
      );
    }
    return this._updateMedicineUseCase;
  }

  get getMedicinesUseCase(): GetMedicinesUseCase {
    if (!this._getMedicinesUseCase) {
      this._getMedicinesUseCase = new GetMedicinesUseCase(
        this.medicineRepository,
      );
    }
    return this._getMedicinesUseCase;
  }

  get createScheduleUseCase(): CreateScheduleUseCase {
    if (!this._createScheduleUseCase) {
      this._createScheduleUseCase = new CreateScheduleUseCase(
        this.scheduleRepository,
        this.doseReminderRepository,
      );
    }
    return this._createScheduleUseCase;
  }

  get markDoseAsTakenUseCase(): MarkDoseAsTakenUseCase {
    if (!this._markDoseAsTakenUseCase) {
      this._markDoseAsTakenUseCase = new MarkDoseAsTakenUseCase(
        this.doseReminderRepository,
      );
    }
    return this._markDoseAsTakenUseCase;
  }

  get getDoseRemindersUseCase(): GetDoseRemindersUseCase {
    if (!this._getDoseRemindersUseCase) {
      this._getDoseRemindersUseCase = new GetDoseRemindersUseCase(
        this.doseReminderRepository,
      );
    }
    return this._getDoseRemindersUseCase;
  }

  get getUserUseCase(): GetUserUseCase {
    if (!this._getUserUseCase) {
      this._getUserUseCase = new GetUserUseCase(this.userRepository);
    }
    return this._getUserUseCase;
  }

  get updateUserUseCase(): UpdateUserUseCase {
    if (!this._updateUserUseCase) {
      this._updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    }
    return this._updateUserUseCase;
  }

  get getDatabaseStatsUseCase(): GetDatabaseStatsUseCase {
    if (!this._getDatabaseStatsUseCase) {
      this._getDatabaseStatsUseCase = new GetDatabaseStatsUseCase(
        this.medicineRepository,
        this.scheduleRepository,
        this.doseReminderRepository,
      );
    }
    return this._getDatabaseStatsUseCase;
  }

  get exportDatabaseUseCase(): ExportDatabaseUseCase {
    if (!this._exportDatabaseUseCase) {
      this._exportDatabaseUseCase = new ExportDatabaseUseCase(
        this.medicineRepository,
        this.scheduleRepository,
        this.doseReminderRepository,
      );
    }
    return this._exportDatabaseUseCase;
  }

  get clearDatabaseUseCase(): ClearDatabaseUseCase {
    if (!this._clearDatabaseUseCase) {
      this._clearDatabaseUseCase = new ClearDatabaseUseCase(
        this.medicineRepository,
        this.scheduleRepository,
        this.doseReminderRepository,
      );
    }
    return this._clearDatabaseUseCase;
  }

  get getDatabaseInfoUseCase(): GetDatabaseInfoUseCase {
    if (!this._getDatabaseInfoUseCase) {
      this._getDatabaseInfoUseCase = new GetDatabaseInfoUseCase(
        this.databaseManager,
      );
    }
    return this._getDatabaseInfoUseCase;
  }

  get shareDatabasePathUseCase(): ShareDatabasePathUseCase {
    if (!this._shareDatabasePathUseCase) {
      this._shareDatabasePathUseCase = new ShareDatabasePathUseCase(
        this.databaseManager,
      );
    }
    return this._shareDatabasePathUseCase;
  }
}
