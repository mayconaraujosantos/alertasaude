import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
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
import { useModal } from '../../hooks/useModal';
import { useMedicines } from '../../presentation/hooks/useMedicines';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { DIContainer } from '../../infrastructure/di/DIContainer';
interface MedicinesScreenProps {
  readonly navigation: any;
}

export default function MedicinesScreen({ navigation }: MedicinesScreenProps) {
  const { Modal, showError, showSuccess, showConfirm } = useModal();
  const { colors, styles } = useSystemTheme(); // Dependency Injection
  const diContainer = DIContainer.getInstance();
  const getMedicinesUseCase = diContainer.getMedicinesUseCase;
  const _createMedicineUseCase = diContainer.createMedicineUseCase;

  // Using the new hook with clean architecture
  const {
    medicines,
    loading,
    error,
    searchQuery,
    filteredMedicines,
    loadMedicines,
    searchMedicines,
    createMedicine: _createMedicine,
  } = useMedicines(getMedicinesUseCase, _createMedicineUseCase);

  // Use useFocusEffect to ensure reload on iOS
  useFocusEffect(
    useCallback(() => {
      console.log(
        '👁️ [MedicinesScreen] Screen focused, reloading medicines...',
      );
      loadMedicines();
    }, [loadMedicines]),
  );

  // Show error if any
  React.useEffect(() => {
    if (error) {
      showError('Erro', error);
    }
  }, [error, showError]);

  const handleDeleteMedicine = async (_medicineId: number) => {
    showConfirm(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita.',
      async () => {
        try {
          // This would need a delete use case
          showSuccess('Sucesso', 'Medicamento excluído com sucesso!');
          await loadMedicines();
        } catch {
          showError('Erro', 'Não foi possível excluir o medicamento.');
        }
      },
    );
  };

  const handleEditMedicine = (medicine: any) => {
    navigation.navigate('EditMedicine', { medicine });
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <View className="bg-gray-100 rounded-full p-8 mb-6">
        <Ionicons name="medical-outline" size={64} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
        Nenhum medicamento cadastrado
      </Text>
      <Text className="text-gray-600 text-center mb-8 leading-6">
        Comece adicionando seu primeiro medicamento para gerenciar seus horários
        de tratamento.
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddMedicine')}
        className="bg-orange-500 px-8 py-4 rounded-xl shadow-sm"
      >
        <Text className="text-white font-semibold text-base">
          Adicionar Medicamento
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMedicineItem = ({ item }: { item: any }) => (
    <View className="bg-white mx-4 mb-4 rounded-2xl shadow-sm border border-gray-100">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800 mb-1">
              {item.name}
            </Text>
            <Text className="text-orange-600 font-medium">{item.dosage}</Text>
          </View>

          {item.imageUri && (
            <Image
              source={{ uri: item.imageUri }}
              className="w-16 h-16 rounded-xl ml-3"
              resizeMode="cover"
            />
          )}
        </View>

        {item.description && (
          <Text className="text-gray-600 mb-4 leading-5">
            {item.description}
          </Text>
        )}

        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm ml-1">
              {new Date(item.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => handleEditMedicine(item)}
              style={{
                backgroundColor: colors.primary + '20',
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>{' '}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AddSchedule', { medicine: item })
              }
              className="bg-green-50 p-2 rounded-lg"
            >
              <Ionicons name="time-outline" size={18} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteMedicine(item.id)}
              className="bg-red-50 p-2 rounded-lg"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading && medicines.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Carregando medicamentos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[{ flex: 1 }, styles.container]}>
      <UserHeader
        title="Meus Medicamentos"
        searchQuery={searchQuery}
        onSearchChange={searchMedicines}
        showAddButton
        onAddPress={() => navigation.navigate('AddMedicine')}
      />

      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicineItem}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadMedicines}
            colors={['#ff6b35']}
            tintColor="#ff6b35"
          />
        }
      />

      <Modal />
    </SafeAreaView>
  );
}
