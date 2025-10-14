import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { databaseManager } from '../database/DatabaseManager';

export default function DatabaseDebugScreen() {
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadDatabaseInfo = async () => {
    setLoading(true);
    try {
      const info = await databaseManager.getTableInfo();
      setDbInfo(info);
    } catch (error) {
      console.error('Error loading database info:', error);
      Alert.alert('Erro', 'Falha ao carregar informações do banco de dados');
    } finally {
      setLoading(false);
    }
  };

  const copyDatabasePath = async () => {
    try {
      const path = await databaseManager.copyDatabaseToDownloads();
      if (path) {
        await Share.share({
          message: `Database path: ${path}\n\nVocê pode copiar este arquivo para visualizar no VS Code ou outro editor SQLite.`,
          title: 'Caminho do Banco de Dados',
        });
      }
    } catch (error) {
      console.error('Error sharing database path:', error);
      Alert.alert('Erro', 'Falha ao compartilhar caminho do banco');
    }
  };

  const exportAllData = async () => {
    try {
      setLoading(true);
      const data = await databaseManager.exportAllData();
      await Share.share({
        message: `Exported Data:\n${JSON.stringify(data, null, 2)}`,
        title: 'Database Export',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Erro', 'Falha ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.title}>🔍 Database Debug Info</Text>

        {dbInfo && (
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>Path: {dbInfo.path}</Text>

            <Text style={styles.infoText}>Tables:</Text>
            {dbInfo.tables?.map((table: string, index: number) => (
              <Text key={index} style={styles.tableItem}>
                • {table}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={loadDatabaseInfo}
          disabled={loading}
          style={[styles.button, styles.blueButton]}
        >
          <Text style={styles.buttonText}>
            {loading ? '🔄 Carregando...' : '🔄 Recarregar Info'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={copyDatabasePath}
          style={[styles.button, styles.greenButton]}
        >
          <Text style={styles.buttonText}>📂 Compartilhar Caminho do DB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={exportAllData}
          disabled={loading}
          style={[styles.button, styles.purpleButton]}
        >
          <Text style={styles.buttonText}>📤 Exportar Todos os Dados</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>
          💡 Como visualizar o banco no VS Code:
        </Text>
        <Text style={styles.helpText}>
          1. Toque em "Compartilhar Caminho do DB" acima{'\n'}
          2. Copie o caminho do arquivo{'\n'}
          3. No VS Code, instale a extensão "SQLite Viewer"{'\n'}
          4. Abra o arquivo .db usando o caminho copiado{'\n'}
          5. Visualize tabelas e dados diretamente no editor!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoContent: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  tableItem: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
  },
  blueButton: {
    backgroundColor: '#3b82f6',
  },
  greenButton: {
    backgroundColor: '#10b981',
  },
  purpleButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  helpCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  helpTitle: {
    color: '#92400e',
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    color: '#b45309',
    fontSize: 14,
    lineHeight: 20,
  },
});
