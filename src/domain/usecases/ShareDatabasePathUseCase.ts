import { Share } from 'react-native';
import { DatabaseManager } from '../../infrastructure/database/DatabaseManager';

export class ShareDatabasePathUseCase {
  constructor(private databaseManager: DatabaseManager) {}

  async execute(): Promise<void> {
    try {
      const path = this.databaseManager.getDatabasePath();

      if (!path) {
        throw new Error('Caminho do banco de dados não disponível');
      }

      await Share.share({
        message: `Database path: ${path}\n\nVocê pode copiar este arquivo para visualizar no VS Code ou outro editor SQLite.`,
        title: 'Caminho do Banco de Dados',
      });
    } catch (error) {
      console.error('ShareDatabasePathUseCase error:', error);
      throw new Error('Falha ao compartilhar caminho do banco');
    }
  }

  getDatabasePath(): string {
    return this.databaseManager.getDatabasePath();
  }
}
