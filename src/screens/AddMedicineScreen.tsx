import { Ionicons } from '@expo/vector-icons';
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
import { useModal } from '../hooks/useModal';
import ImagePickerModal from '../components/ImagePickerModal';
import ActionsMenuModal from '../components/ActionsMenuModal';

interface AddMedicineScreenProps {
  readonly navigation: any;
}

export default function AddMedicineScreen({
  navigation,
}: AddMedicineScreenProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dosage, setDosage] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const { Modal, showError, showSuccess, showConfirm } = useModal();

  // Calcular progresso do preenchimento
  const getFormProgress = () => {
    let progress = 0;
    const fields = [
      { value: name.trim(), weight: 40 }, // Nome é mais importante
      { value: dosage.trim(), weight: 40 }, // Dosagem é obrigatória
      { value: description.trim(), weight: 10 }, // Descrição é opcional
      { value: imageUri, weight: 10 }, // Imagem é opcional
    ];

    fields.forEach(field => {
      if (field.value) progress += field.weight;
    });

    return Math.min(progress, 100);
  };

  const isFormValid = () => {
    return name.trim() && dosage.trim();
  };

  const hasFormData = () => {
    return name.trim() || description.trim() || dosage.trim() || imageUri;
  };

  const clearForm = () => {
    setName('');
    setDescription('');
    setDosage('');
    setImageUri(null);
  };

  const handleBackPress = () => {
    if (hasFormData()) {
      showConfirm(
        'Descartar alterações?',
        'Você tem dados não salvos. Deseja realmente sair?',
        () => navigation.goBack(),
        () => {} // Não fazer nada se cancelar
      );
    } else {
      navigation.goBack();
    }
  };

  const handleQuickSave = () => {
    if (!isFormValid()) {
      showError(
        'Formulário incompleto',
        'Preencha pelo menos o nome e a dosagem para salvar rapidamente.'
      );
      return;
    }
    saveMedicine();
  };

  const getActionsMenuItems = () => [
    {
      icon: 'checkmark-circle',
      title: 'Salvar Rápido',
      subtitle: 'Salvar e voltar',
      onPress: handleQuickSave,
      color: '#10b981',
      disabled: !isFormValid() || loading,
    },
    {
      icon: 'camera',
      title: 'Adicionar Foto',
      subtitle: 'Tirar foto ou escolher da galeria',
      onPress: () => setImagePickerVisible(true),
      color: '#3b82f6',
    },
    {
      icon: 'refresh',
      title: 'Limpar Formulário',
      subtitle: 'Remover todos os dados preenchidos',
      onPress: () => {
        if (hasFormData()) {
          showConfirm(
            'Limpar formulário?',
            'Isso removerá todos os dados preenchidos.',
            clearForm
          );
        }
      },
      color: '#f59e0b',
      disabled: !hasFormData(),
    },
    {
      icon: 'list',
      title: 'Ver Medicamentos',
      subtitle: 'Ir para lista de medicamentos',
      onPress: () => navigation.goBack(),
      color: '#8b5cf6',
    },
  ];

  // Debug inicial
  console.log('🎯 [AddMedicineScreen] Component initialized', {
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

  const saveMedicine = async () => {
    if (!name.trim() || !dosage.trim()) {
      showError(
        'Campos Obrigatórios',
        'Por favor, preencha o nome e a dosagem do medicamento'
      );
      return;
    }

    try {
      setLoading(true);

      console.log('💾 [AddMedicineScreen] Saving medicine:', {
        name: name.trim(),
        description: description.trim(),
        dosage: dosage.trim(),
        imageUri,
      });

      const medicine = {
        name: name.trim(),
        description: description.trim() || undefined,
        dosage: dosage.trim(),
        imageUri: imageUri || undefined,
        createdAt: new Date().toISOString(),
      };

      await databaseManager.insertMedicine(medicine);

      console.log('✅ [AddMedicineScreen] Medicine saved successfully');

      showSuccess('Sucesso!', 'Medicamento cadastrado com sucesso', () => {
        clearForm();
        navigation.goBack();
      });
    } catch (error) {
      console.error('❌ [AddMedicineScreen] Error saving medicine:', error);
      showError('Erro', 'Não foi possível salvar o medicamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        {/* Header melhorado */}
        <View className="bg-green-500 px-6 py-6 rounded-b-3xl shadow-lg">
          {/* Linha superior com navegação */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={handleBackPress}>
              <View className="bg-white rounded-2xl p-3 shadow-sm">
                <Ionicons name="arrow-back" size={24} color="#10b981" />
              </View>
            </TouchableOpacity>

            <View className="flex-1 mx-4">
              <Text className="text-white text-sm opacity-90 mb-1">
                Novo Medicamento
              </Text>
              <Text className="text-white text-xl font-bold">
                Adicionar à Farmácia
              </Text>
            </View>

            {/* Botões de ação */}
            <View className="flex-row space-x-2">
              {/* Botão de salvar rápido */}
              <TouchableOpacity
                onPress={handleQuickSave}
                disabled={loading || !isFormValid()}
                className={`rounded-2xl p-3 shadow-sm ${
                  isFormValid() && !loading ? 'bg-white' : 'bg-white/30'
                }`}
              >
                {loading ? (
                  <Ionicons name="time" size={24} color="white" />
                ) : (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={isFormValid() ? '#10b981' : 'white'}
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

          {/* Barra de progresso */}
          <View className="mt-2">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-xs opacity-75">
                Progresso do formulário
              </Text>
              <Text className="text-white text-xs font-semibold">
                {getFormProgress()}%
              </Text>
            </View>
            <View className="bg-white/20 rounded-full h-2 overflow-hidden">
              <View
                className="bg-white rounded-full h-full transition-all duration-300"
                style={{ width: `${getFormProgress()}%` }}
              />
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 24,
            paddingBottom: 120, // Espaço extra para o botão não ser cortado
          }}
        >
          {/* Imagem do Medicamento */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
              Foto do Medicamento
            </Text>

            <View className="items-center">
              <TouchableOpacity
                onPress={() => setImagePickerVisible(true)}
                className="w-32 h-32 rounded-3xl border-2 border-dashed border-gray-300 justify-center items-center overflow-hidden mb-4"
                style={{
                  backgroundColor: imageUri != null ? 'transparent' : '#f3f4f6',
                }}
              >
                {imageUri != null ? (
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <View className="bg-green-100 w-16 h-16 rounded-full items-center justify-center mb-2">
                      <Ionicons name="camera" size={32} color="#22c55e" />
                    </View>
                    <Text className="text-gray-500 text-sm font-medium">
                      Adicionar Foto
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">Opcional</Text>
                  </View>
                )}
              </TouchableOpacity>

              {imageUri != null && (
                <TouchableOpacity
                  onPress={() => setImageUri(null)}
                  className="bg-red-100 px-4 py-2 rounded-xl flex-row items-center"
                >
                  <Ionicons name="trash" size={16} color="#ef4444" />
                  <Text className="text-red-500 font-medium text-sm ml-2">
                    Remover Foto
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Informações do Medicamento */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-6">
              Informações do Medicamento
            </Text>

            {/* Nome do Medicamento */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Nome do Medicamento *
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 px-4 py-4">
                <Ionicons name="medical-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 text-base text-gray-900 ml-3"
                  placeholder="Ex: Dipirona, Paracetamol..."
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Dosagem */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Dosagem *
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 px-4 py-4">
                <Ionicons name="flask-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 text-base text-gray-900 ml-3"
                  placeholder="Ex: 500mg, 2 comprimidos, 10ml..."
                  placeholderTextColor="#9ca3af"
                  value={dosage}
                  onChangeText={setDosage}
                />
              </View>
            </View>

            {/* Descrição */}
            <View>
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Observações
              </Text>
              <View className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                <TextInput
                  className="text-base text-gray-900 min-h-24"
                  style={{ textAlignVertical: 'top' }}
                  placeholder="Informações adicionais sobre o medicamento..."
                  placeholderTextColor="#9ca3af"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            className={`py-5 rounded-3xl items-center flex-row justify-center shadow-lg mb-4 ${
              loading === true ? 'bg-gray-400' : 'bg-green-500'
            }`}
            onPress={saveMedicine}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center">
                <Text className="text-white text-lg font-bold">
                  Salvando...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="white"
                />
                <Text className="text-white text-lg font-bold ml-3">
                  Salvar Medicamento
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <Modal />
      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        onCamera={takePhoto}
        onGallery={pickImage}
      />
      <ActionsMenuModal
        visible={showActionsMenu}
        onClose={() => setShowActionsMenu(false)}
        title="Ações Rápidas"
        actions={getActionsMenuItems()}
      />
    </SafeAreaView>
  );
}
