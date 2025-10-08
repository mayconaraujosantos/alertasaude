import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseManager } from '../database/DatabaseManager';
import { Medicine } from '../types';

interface MedicinesScreenProps {
  navigation: any;
}

export default function MedicinesScreen({ navigation }: MedicinesScreenProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Usar useFocusEffect para garantir reload no iOS
  useFocusEffect(
    useCallback(() => {
      console.log(
        'MedicinesScreen focused (useFocusEffect), reloading medicines...'
      );
      loadMedicines();
    }, [])
  );

  // Carregamento inicial
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      console.log('Loading medicines...');
      const medicinesList = await databaseManager.getAllMedicines();
      console.log('Medicines loaded:', medicinesList.length, 'items');
      setMedicines(medicinesList);
    } catch (error) {
      console.error('Error loading medicines:', error);
      Alert.alert('Erro', 'Não foi possível carregar os medicamentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMedicines();
  };

  const debugDatabase = async () => {
    try {
      await databaseManager.debugDatabaseState();
      Alert.alert('Debug', 'Verifique o console para informações do banco');
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert('Erro', 'Erro ao fazer debug do banco');
    }
  };

  const deleteMedicine = async (id: number, name: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseManager.deleteMedicine(id);
              await loadMedicines();
              Alert.alert('Sucesso', 'Medicamento excluído com sucesso');
            } catch (error) {
              console.error('Error deleting medicine:', error);
              Alert.alert('Erro', 'Não foi possível excluir o medicamento');
            }
          },
        },
      ]
    );
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <View
      style={{
        backgroundColor: 'white',
        margin: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              marginRight: 12,
            }}
          />
        ) : (
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              backgroundColor: '#e5e7eb',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="medical" size={24} color="#6b7280" />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>

          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
            Dosagem: {item.dosage}
          </Text>

          {item.description && (
            <Text style={{ fontSize: 14, color: '#374151' }}>
              {item.description}
            </Text>
          )}

          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
            Criado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 12,
          gap: 8,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#3b82f6',
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 4,
          }}
          onPress={() => navigation.navigate('AddSchedule', { medicine: item })}
        >
          <Ionicons name="time" size={16} color="white" />
          <Text style={{ color: 'white', fontWeight: '600' }}>Agendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#6b7280',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={() =>
            navigation.navigate('EditMedicine', { medicine: item })
          }
        >
          <Ionicons name="pencil" size={16} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#ef4444',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={() => deleteMedicine(item.id!, item.name)}
        >
          <Ionicons name="trash" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}
      >
        <Text style={{ fontSize: 18, color: '#6b7280' }}>
          Carregando medicamentos...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View
        style={{
          padding: 16,
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
            💊 Meus Medicamentos
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>
            {medicines.length} medicamento(s) cadastrado(s)
          </Text>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#10b981',
            padding: 12,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => navigation.navigate('AddMedicine')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {medicines.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
          }}
        >
          <Ionicons name="medical-outline" size={64} color="#6b7280" />
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#1f2937',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Nenhum medicamento cadastrado
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#6b7280',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Toque no + para adicionar seu primeiro medicamento
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#10b981',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
            onPress={() => navigation.navigate('AddMedicine')}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: '600' }}>
              Adicionar Medicamento
            </Text>
          </TouchableOpacity>

          {/* Botão de Debug (temporário) */}
          {__DEV__ && (
            <TouchableOpacity
              style={{
                backgroundColor: '#f59e0b',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
              onPress={debugDatabase}
            >
              <Ionicons name="bug" size={20} color="white" />
              <Text style={{ color: 'white', fontWeight: '600' }}>
                Debug DB
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderMedicineItem}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          contentContainerStyle={{ paddingBottom: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
