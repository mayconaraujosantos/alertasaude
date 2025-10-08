import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseManager } from '../database/DatabaseManager';

interface AddMedicineScreenProps {
  navigation: any;
}

export default function AddMedicineScreen({
  navigation,
}: AddMedicineScreenProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dosage, setDosage] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
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
      Alert.alert(
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

  const showImagePicker = () => {
    Alert.alert(
      'Selecionar Imagem',
      'Como você gostaria de adicionar uma imagem do medicamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: pickImage },
        { text: 'Câmera', onPress: takePhoto },
      ]
    );
  };

  const saveMedicine = async () => {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert(
        'Campos Obrigatórios',
        'Por favor, preencha o nome e a dosagem do medicamento'
      );
      return;
    }

    setLoading(true);

    try {
      await databaseManager.initDatabase();

      const medicine = {
        name: name.trim(),
        description: description.trim() || undefined,
        dosage: dosage.trim(),
        imageUri: imageUri || undefined,
        createdAt: new Date().toISOString(),
      };

      await databaseManager.insertMedicine(medicine);

      Alert.alert('Sucesso!', 'Medicamento cadastrado com sucesso', [
        {
          text: 'OK',
          onPress: () => {
            // Forçar refresh da tela anterior
            navigation.goBack();
            // Opcional: Resetar o stack para garantir refresh
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'MedicinesList' }],
            // });
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving medicine:', error);
      Alert.alert('Erro', 'Não foi possível salvar o medicamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View
          style={{
            padding: 16,
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>
            Adicionar Medicamento
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Imagem do Medicamento */}
          <View style={{ marginBottom: 24, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 12,
              }}
            >
              Foto do Medicamento (Opcional)
            </Text>

            <TouchableOpacity
              onPress={showImagePicker}
              style={{
                width: 120,
                height: 120,
                borderRadius: 12,
                backgroundColor: imageUri ? 'transparent' : '#e5e7eb',
                borderWidth: 2,
                borderColor: '#d1d5db',
                borderStyle: 'dashed',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="camera" size={32} color="#9ca3af" />
                  <Text
                    style={{ color: '#9ca3af', marginTop: 4, fontSize: 12 }}
                  >
                    Toque para adicionar
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {imageUri && (
              <TouchableOpacity
                onPress={() => setImageUri(null)}
                style={{
                  marginTop: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: '#ef4444',
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: 'white', fontSize: 12 }}>
                  Remover Foto
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Nome do Medicamento */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8,
              }}
            >
              Nome do Medicamento *
            </Text>
            <TextInput
              style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
              }}
              placeholder="Ex: Dipirona, Paracetamol..."
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Dosagem */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8,
              }}
            >
              Dosagem *
            </Text>
            <TextInput
              style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
              }}
              placeholder="Ex: 500mg, 2 comprimidos, 10ml..."
              value={dosage}
              onChangeText={setDosage}
            />
          </View>

          {/* Descrição */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8,
              }}
            >
              Observações (Opcional)
            </Text>
            <TextInput
              style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                height: 80,
                textAlignVertical: 'top',
              }}
              placeholder="Informações adicionais sobre o medicamento..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#9ca3af' : '#10b981',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
            onPress={saveMedicine}
            disabled={loading}
          >
            {loading ? (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Salvando...
              </Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text
                  style={{ color: 'white', fontSize: 16, fontWeight: '600' }}
                >
                  Salvar Medicamento
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
