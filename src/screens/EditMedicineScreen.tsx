import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseManager } from '../database/DatabaseManager';
import { Medicine } from '../types';
import { useModal } from '../hooks/useModal';
import ImagePickerModal from '../components/ImagePickerModal';
import ActionsMenuModal from '../components/ActionsMenuModal';

interface EditMedicineRouteParams {
  medicine: Medicine;
}

export default function EditMedicineScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicine } = route.params as EditMedicineRouteParams;

  const [name, setName] = useState(medicine.name);
  const [description, setDescription] = useState(medicine.description || '');
  const [dosage, setDosage] = useState(medicine.dosage);
  const [imageUri, setImageUri] = useState<string | null>(
    medicine.imageUri || null
  );
  const [loading, setLoading] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const { Modal, showError, showSuccess, showConfirm } = useModal();

  // Verificar se houve mudanças
  const hasChanges = () => {
    return (
      name.trim() !== medicine.name ||
      (description.trim() || '') !== (medicine.description || '') ||
      dosage.trim() !== medicine.dosage ||
      imageUri !== medicine.imageUri
    );
  };

  const isFormValid = () => {
    return name.trim() && dosage.trim();
  };

  const getActionsMenuItems = () => [
    {
      icon: 'checkmark-circle',
      title: 'Salvar Alterações',
      subtitle: 'Salvar mudanças e voltar',
      onPress: updateMedicine,
      color: '#10b981',
      disabled: !isFormValid() || !hasChanges() || loading,
    },
    {
      icon: 'camera',
      title: 'Alterar Foto',
      subtitle: 'Tirar nova foto ou escolher da galeria',
      onPress: () => setImagePickerVisible(true),
      color: '#3b82f6',
    },
    {
      icon: 'calendar',
      title: 'Ver Agendamentos',
      subtitle: 'Agendamentos deste medicamento',
      onPress: () => {
        // TODO: Navegar para agendamentos
        showError('Em breve', 'Funcionalidade em desenvolvimento');
      },
      color: '#8b5cf6',
    },
    {
      icon: 'trash',
      title: 'Excluir Medicamento',
      subtitle: 'Remover permanentemente',
      onPress: confirmDelete,
      color: '#ef4444',
    },
  ];

  // Debug inicial
  console.log('🎯 [EditMedicineScreen] Component initialized', {
    medicineId: medicine.id,
    name: name || 'empty',
    description: description || 'empty',
    dosage: dosage || 'empty',
    imageUri: imageUri || 'null',
    loading,
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showError(
        'Permissão Necessária',
        'Precisamos de acesso à galeria para selecionar imagens'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      showError(
        'Permissão Necessária',
        'Precisamos de acesso à câmera para tirar fotos'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const updateMedicine = async () => {
    if (!name.trim() || !dosage.trim()) {
      showError(
        'Campos Obrigatórios',
        'Por favor, preencha o nome e a dosagem do medicamento'
      );
      return;
    }

    try {
      setLoading(true);

      console.log('💾 [EditMedicineScreen] Updating medicine:', {
        id: medicine.id,
        name: name.trim(),
        description: description.trim(),
        dosage: dosage.trim(),
        imageUri,
      });

      const updatedMedicine: Medicine = {
        ...medicine,
        name: name.trim(),
        description: description.trim() || undefined,
        dosage: dosage.trim(),
        imageUri: imageUri || undefined,
      };

      await databaseManager.updateMedicine(medicine.id!, updatedMedicine);

      console.log('✅ [EditMedicineScreen] Medicine updated successfully');

      showSuccess('Sucesso', 'Medicamento atualizado com sucesso!', () =>
        navigation.goBack()
      );
    } catch (error) {
      console.error('❌ [EditMedicineScreen] Error updating medicine:', error);
      showError(
        'Erro',
        'Não foi possível atualizar o medicamento. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    showConfirm(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${medicine.name}"? Esta ação não pode ser desfeita e todos os agendamentos relacionados também serão removidos.`,
      deleteMedicine
    );
  };

  const deleteMedicine = async () => {
    try {
      setLoading(true);

      console.log(
        `🗑️ [EditMedicineScreen] Deleting medicine: ${medicine.name} (ID: ${medicine.id})`
      );

      await databaseManager.deleteMedicine(medicine.id!);

      console.log(
        `✅ [EditMedicineScreen] Medicine deleted successfully: ${medicine.name}`
      );

      showSuccess('Sucesso', 'Medicamento excluído com sucesso!', () =>
        navigation.goBack()
      );
    } catch (error) {
      console.error(
        `❌ [EditMedicineScreen] Error deleting medicine ${medicine.name}:`,
        error
      );
      showError('Erro', 'Não foi possível excluir o medicamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* Header melhorado */}
        <View className="bg-purple-500 px-6 py-6 rounded-b-3xl shadow-lg">
          {/* Linha superior com navegação */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <View className="bg-white rounded-2xl p-3 shadow-sm">
                <Ionicons name="arrow-back" size={24} color="#8b5cf6" />
              </View>
            </TouchableOpacity>

            <View className="flex-1 mx-4">
              <Text className="text-white text-sm opacity-90 mb-1">
                Editando Medicamento
              </Text>
              <Text className="text-white text-xl font-bold">
                {medicine.name}
              </Text>
            </View>

            {/* Botões de ação */}
            <View className="flex-row space-x-2">
              {/* Botão de salvar rápido */}
              <TouchableOpacity
                onPress={updateMedicine}
                disabled={loading || !isFormValid() || !hasChanges()}
                className={`rounded-2xl p-3 shadow-sm ${
                  isFormValid() && hasChanges() && !loading
                    ? 'bg-white'
                    : 'bg-white/30'
                }`}
              >
                {loading ? (
                  <Ionicons name="time" size={24} color="white" />
                ) : (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={isFormValid() && hasChanges() ? '#8b5cf6' : 'white'}
                  />
                )}
              </TouchableOpacity>

              {/* Botão de menu */}
              <TouchableOpacity
                onPress={() => setShowActionsMenu(true)}
                className="bg-white/20 rounded-2xl p-3 shadow-sm"
              >
                <Ionicons name="ellipsis-horizontal" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Indicador de mudanças */}
          {hasChanges() && (
            <View className="bg-white/20 rounded-xl px-4 py-2">
              <View className="flex-row items-center">
                <Ionicons name="pencil" size={16} color="white" />
                <Text className="text-white text-sm ml-2 font-medium">
                  Você tem alterações não salvas
                </Text>
              </View>
            </View>
          )}
        </View>

        <ScrollView
          className="flex-1 px-6 py-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Imagem do Medicamento */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Foto do Medicamento
            </Text>

            <TouchableOpacity
              onPress={() => setImagePickerVisible(true)}
              className="bg-white rounded-2xl p-6 border-2 border-dashed border-gray-300 items-center justify-center shadow-sm"
              style={{ height: 200 }}
            >
              {imageUri ? (
                <View className="relative w-full h-full">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-full rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
                    <Ionicons name="camera" size={20} color="white" />
                  </View>
                </View>
              ) : (
                <View className="items-center">
                  <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                    <Ionicons name="camera" size={24} color="#9ca3af" />
                  </View>
                  <Text className="text-gray-500 font-medium">
                    Alterar foto do medicamento
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    Toque para alterar ou remover
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Nome do Medicamento */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Nome do Medicamento *
            </Text>
            <View className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Paracetamol"
                className="text-base text-gray-900"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Dosagem */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Dosagem *
            </Text>
            <View className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="Ex: 500mg, 1 comprimido, 5ml"
                className="text-base text-gray-900"
              />
            </View>
          </View>

          {/* Descrição */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Descrição (Opcional)
            </Text>
            <View className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Para dor de cabeça, tomar após as refeições"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="text-base text-gray-900"
              />
            </View>
          </View>

          {/* Espaço extra para garantir que o botão não seja cortado */}
          <View className="h-24" />
        </ScrollView>

        {/* Botões de Ação */}
        <View
          className="bg-white px-6 pt-4 pb-8 shadow-sm border-t border-gray-100"
          style={{ paddingBottom: 34 }}
        >
          <TouchableOpacity
            onPress={updateMedicine}
            disabled={loading || !name.trim() || !dosage.trim()}
            className={`py-4 rounded-xl items-center shadow-sm ${
              loading || !name.trim() || !dosage.trim()
                ? 'bg-gray-300'
                : 'bg-purple-500'
            }`}
          >
            {loading ? (
              <Text className="text-white font-bold text-base">
                Salvando...
              </Text>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Salvar Alterações
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <Modal />
      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        onCamera={takePhoto}
        onGallery={pickImage}
        onRemove={() => setImageUri(null)}
        hasCurrentImage={!!imageUri}
        title="Alterar Imagem"
      />
      <ActionsMenuModal
        visible={showActionsMenu}
        onClose={() => setShowActionsMenu(false)}
        title="Ações do Medicamento"
        actions={getActionsMenuItems()}
      />
    </SafeAreaView>
  );
}
