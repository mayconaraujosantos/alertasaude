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
import { MedicineEntity } from '../../domain/entities';
import { useModal } from '../../hooks/useModal';
import ImagePickerModal from '../components/ImagePickerModal';
import ActionsMenuModal from '../components/ActionsMenuModal';
import { DIContainer } from '../../infrastructure/di/DIContainer';
interface EditMedicineRouteParams {
  medicine: MedicineEntity;
}

export default function EditMedicineScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicine } = route.params as EditMedicineRouteParams;

  const [name, setName] = useState(medicine.name);
  const [description, setDescription] = useState(medicine.description || '');
  const [dosage, setDosage] = useState(medicine.dosage);
  const [imageUri, setImageUri] = useState<string | null>(
    medicine.imageUri || null,
  );
  const [loading, setLoading] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const { Modal, showError, showSuccess, showConfirm } = useModal();

  // Dependency Injection
  const diContainer = DIContainer.getInstance();
  const updateMedicineUseCase = diContainer.updateMedicineUseCase;

  // Check if there are changes
  const hasChanges = () => {
    return (
      name.trim() !== medicine.name ||
      (description.trim() || '') !== (medicine.description || '') ||
      dosage.trim() !== medicine.dosage ||
      imageUri !== medicine.imageUri
    );
  };

  const isFormValid = name.trim() && dosage.trim();
  const showSaveButton = hasChanges() && isFormValid;

  const handleImagePicker = async (source: 'camera' | 'gallery') => {
    try {
      let result;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showError(
            'Permissão Negada',
            'É necessário permitir acesso à câmera.',
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showError(
            'Permissão Negada',
            'É necessário permitir acesso à galeria.',
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setImagePickerVisible(false);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleSave = async () => {
    if (!isFormValid) {
      showError(
        'Dados Incompletos',
        'Preencha pelo menos o nome e a dosagem do medicamento.',
      );
      return;
    }

    if (!medicine.id) {
      showError('Erro', 'ID do medicamento não encontrado.');
      return;
    }

    setLoading(true);

    try {
      await updateMedicineUseCase.execute(
        medicine.id,
        name.trim(),
        dosage.trim(),
        description.trim() || undefined,
        imageUri || undefined,
      );

      showSuccess(
        'Medicamento Atualizado',
        `${name} foi atualizado com sucesso!`,
        () => {
          navigation.goBack();
        },
      );
    } catch (error) {
      console.error('Error updating medicine:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      showError('Erro ao Atualizar', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (!hasChanges()) {
      navigation.goBack();
      return;
    }

    showConfirm(
      'Descartar Alterações',
      'Você tem alterações não salvas. Deseja descartar essas alterações?',
      () => {
        navigation.goBack();
      },
    );
  };

  const resetForm = () => {
    setName(medicine.name);
    setDescription(medicine.description || '');
    setDosage(medicine.dosage);
    setImageUri(medicine.imageUri || null);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleDiscard} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-800">
            Editar Medicamento
          </Text>

          <TouchableOpacity
            onPress={() => setShowActionsMenu(true)}
            className="p-2 -mr-2"
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Changes indicator */}
        {hasChanges() && (
          <View className="px-4 py-3 bg-orange-50 border-b border-orange-200">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={16} color="#F59E0B" />
              <Text className="text-orange-700 text-sm ml-2 flex-1">
                Você tem alterações não salvas
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Text className="text-orange-600 text-sm font-medium">
                  Desfazer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Section */}
          <View className="px-4 mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Foto do Medicamento
            </Text>

            <TouchableOpacity
              onPress={() => setImagePickerVisible(true)}
              className="bg-white rounded-2xl p-6 border-2 border-dashed border-gray-300 items-center"
            >
              {imageUri ? (
                <View className="relative">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-32 h-32 rounded-xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2 text-center">
                    Toque para adicionar uma foto
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1 text-center">
                    (Opcional)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="px-4 space-y-6">
            {/* Medicine Name */}
            <View>
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Nome do Medicamento *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Dipirona, Paracetamol..."
                className="bg-white rounded-xl px-4 py-4 text-gray-800 border border-gray-200"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Dosage */}
            <View>
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Dosagem *
              </Text>
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="Ex: 500mg, 2 comprimidos, 5ml..."
                className="bg-white rounded-xl px-4 py-4 text-gray-800 border border-gray-200"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
              />
            </View>

            {/* Description */}
            <View>
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Observações
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Informações adicionais sobre o medicamento..."
                className="bg-white rounded-xl px-4 py-4 text-gray-800 border border-gray-200"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
              />
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        {showSaveButton && (
          <View className="px-4 py-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className={`py-4 rounded-xl flex-row items-center justify-center ${
                loading ? 'bg-gray-300' : 'bg-orange-500'
              }`}
            >
              {loading ? (
                <Text className="text-white font-semibold text-base">
                  Salvando...
                </Text>
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Salvar Alterações
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        onSelectCamera={() => handleImagePicker('camera')}
        onSelectGallery={() => handleImagePicker('gallery')}
      />

      {/* Actions Menu Modal */}
      <ActionsMenuModal
        visible={showActionsMenu}
        onClose={() => setShowActionsMenu(false)}
        actions={[
          {
            icon: 'refresh-outline',
            label: 'Resetar Formulário',
            onPress: () => {
              resetForm();
              setShowActionsMenu(false);
            },
          },
        ]}
      />

      <Modal />
    </SafeAreaView>
  );
}
