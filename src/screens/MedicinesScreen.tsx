import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserHeader from '../components/UserHeader';
import { databaseManager } from '../database/DatabaseManager';
import { useModal } from '../hooks/useModal';
import { Medicine } from '../types';

interface MedicinesScreenProps {
  readonly navigation: any;
}

export default function MedicinesScreen({ navigation }: MedicinesScreenProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { Modal, showError, showSuccess, showConfirm } = useModal();

  // Usar useFocusEffect para garantir reload no iOS
  useFocusEffect(
    useCallback(() => {
      console.log(
        '👁️ [MedicinesScreen] Screen focused (useFocusEffect), reloading medicines...'
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
      console.log('🔄 [MedicinesScreen] Loading medicines...');
      setLoading(true);

      const medicinesList = await databaseManager.getAllMedicines();
      console.log(
        `✅ [MedicinesScreen] Medicines loaded: ${medicinesList.length} items`
      );

      // Log detalhado dos medicamentos carregados
      if (medicinesList.length > 0) {
        console.log(
          '📋 [MedicinesScreen] Medicines details:',
          medicinesList.map(m => ({
            id: m.id,
            name: m.name,
            dosage: m.dosage,
            hasImage: !!m.imageUri,
          }))
        );
      } else {
        console.log('📋 [MedicinesScreen] No medicines found in database');
      }

      setMedicines(medicinesList);
    } catch (error) {
      console.error('❌ [MedicinesScreen] Error loading medicines:', error);
      showError('Erro', 'Não foi possível carregar os medicamentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    console.log('🔄 [MedicinesScreen] Pull to refresh triggered');
    setRefreshing(true);
    loadMedicines();
  };

  const _debugDatabase = async () => {
    try {
      console.log('🔍 [MedicinesScreen] Starting database debug...');
      await databaseManager.debugDatabaseState();

      // Debug adicional específico para medicamentos
      const allMeds = await databaseManager.getAllMedicines();
      console.log('🔍 [DEBUG] Current medicines count:', allMeds.length);
      console.log(
        '🔍 [DEBUG] Current state medicines count:',
        medicines.length
      );

      showSuccess(
        'Debug Completo',
        `DB: ${allMeds.length} medicamentos\nState: ${medicines.length} medicamentos\n\nVerifique o console para detalhes`
      );
    } catch (error) {
      console.error('❌ [MedicinesScreen] Debug error:', error);
      showError('Erro', 'Erro ao fazer debug do banco');
    }
  };

  const deleteMedicine = async (id: number, name: string) => {
    showConfirm(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          console.log(
            `🗑️ [MedicinesScreen] Deleting medicine: ${name} (ID: ${id})`
          );
          await databaseManager.deleteMedicine(id);
          console.log(
            `✅ [MedicinesScreen] Medicine deleted successfully: ${name}`
          );
          await loadMedicines();
          showSuccess('Sucesso', 'Medicamento excluído com sucesso');
        } catch (error) {
          console.error(
            `❌ [MedicinesScreen] Error deleting medicine ${name}:`,
            error
          );
          showError('Erro', 'Não foi possível excluir o medicamento');
        }
      }
    );
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => {
    console.log(
      `🎯 [MedicinesScreen] Rendering medicine item: ${item.name} (ID: ${item.id})`
    );
    return (
      <View className="bg-white mx-4 mb-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <View className="p-6">
          <View className="flex-row items-start mb-4">
            {item.imageUri ? (
              <View className="w-16 h-16 rounded-2xl overflow-hidden mr-4 shadow-sm">
                <Image
                  source={{ uri: item.imageUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View className="w-16 h-16 rounded-2xl bg-blue-100 justify-center items-center mr-4">
                <Ionicons name="medical" size={28} color="#3b82f6" />
              </View>
            )}

            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-2">
                {item.name}
              </Text>

              <View className="flex-row items-center mb-2">
                <Ionicons name="flask-outline" size={16} color="#6b7280" />
                <Text className="text-sm font-medium text-gray-600 ml-2">
                  {item.dosage}
                </Text>
              </View>

              {item.description ? (
                <Text className="text-sm text-gray-600 leading-5 mb-2">
                  {item.description}
                </Text>
              ) : null}

              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                <Text className="text-xs text-gray-400 ml-1">
                  {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Botões de ação */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-blue-500 py-3 rounded-xl items-center flex-row justify-center"
              onPress={() =>
                navigation.navigate('AddSchedule', { medicine: item })
              }
            >
              <Ionicons name="time" size={18} color="white" />
              <Text className="text-white font-bold ml-2">Agendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-500 py-3 px-4 rounded-xl items-center justify-center"
              onPress={() =>
                navigation.navigate('EditMedicine', { medicine: item })
              }
            >
              <Ionicons name="pencil" size={18} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-500 py-3 px-4 rounded-xl items-center justify-center"
              onPress={() => deleteMedicine(item.id!, item.name)}
            >
              <Ionicons name="trash" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Log de estado para debug
  console.log(
    `🎨 [MedicinesScreen] Rendering - Loading: ${loading}, Medicines: ${medicines.length}, Refreshing: ${refreshing}`
  );

  if (loading) {
    console.log('⏳ [MedicinesScreen] Showing loading screen');
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-500">
          Carregando medicamentos...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <UserHeader
        backgroundColor="bg-purple-500"
        title="Minha Farmácia"
        subtitle={`${medicines.length} ${medicines.length === 1 ? 'medicamento' : 'medicamentos'} cadastrados`}
        iconName="add"
        iconColor="#8b5cf6"
        onIconPress={() => navigation.navigate('AddMedicine')}
        navigation={navigation}
      />

      {medicines.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8 -mt-20">
          <View className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 items-center">
            <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="medical" size={48} color="#8b5cf6" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              Sua farmácia está vazia
            </Text>

            <Text className="text-base text-gray-600 text-center leading-6 mb-6">
              Adicione seus medicamentos para começar a organizar seus
              tratamentos.
            </Text>

            <TouchableOpacity
              className="bg-purple-500 px-8 py-4 rounded-2xl flex-row items-center shadow-lg"
              onPress={() => navigation.navigate('AddMedicine')}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Adicionar Medicamento
              </Text>
            </TouchableOpacity>

            {/* Botões de Debug - apenas em desenvolvimento */}
          </View>
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderMedicineItem}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: 120, // Espaço para tab bar flutuante
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <Modal />
    </SafeAreaView>
  );
}
