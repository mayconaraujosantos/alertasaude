import { DatabaseManager } from '../../infrastructure/database/DatabaseManager';

export interface DatabaseInfo {
  path: string;
  tables: string[];
  size?: number;
  version?: string;
}

export class GetDatabaseInfoUseCase {
  constructor(private databaseManager: DatabaseManager) {}

  async execute(): Promise<DatabaseInfo> {
    try {
      const info = await this.databaseManager.getTableInfo();
      return {
        path: info.path || 'Unknown',
        tables: info.tables || [],
        size: info.size,
        version: info.version,
      };
    } catch (error) {
      console.error('GetDatabaseInfoUseCase error:', error);
      throw new Error('Falha ao carregar informações do banco de dados');
    }
  }

  async getDetailedInfo(): Promise<{
    databaseInfo: DatabaseInfo;
    tableDetails: Array<{
      name: string;
      count: number;
      schema?: string;
    }>;
  }> {
    try {
      const basicInfo = await this.execute();
      const tableDetails = [];

      // Get counts for each main table
      for (const tableName of basicInfo.tables) {
        try {
          let count = 0;

          // Get count based on table name
          switch (tableName.toLowerCase()) {
            case 'users':
              count = await this.databaseManager.getUserCount();
              break;
            case 'medicines':
              count = await this.databaseManager.getMedicineCount();
              break;
            case 'schedules':
              count = await this.databaseManager.getScheduleCount();
              break;
            case 'dose_reminders':
              count = await this.databaseManager.getDoseReminderCount();
              break;
            default:
              // For other tables, try generic count
              count = 0;
          }

          tableDetails.push({
            name: tableName,
            count,
          });
        } catch (error) {
          console.warn(`Error getting count for table ${tableName}:`, error);
          tableDetails.push({
            name: tableName,
            count: 0,
          });
        }
      }

      return {
        databaseInfo: basicInfo,
        tableDetails,
      };
    } catch (error) {
      console.error('GetDatabaseInfoUseCase detailed error:', error);
      throw new Error('Falha ao carregar informações detalhadas do banco');
    }
  }
}
