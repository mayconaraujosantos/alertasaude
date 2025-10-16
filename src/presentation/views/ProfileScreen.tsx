import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserEntity } from '../../domain/entities';
import { useModal } from '../../hooks/useModal';
import { DIContainer } from '../../infrastructure/di/DIContainer';

interface ProfileScreenProps {
  onGoBack?: () => void;
}

export default function ProfileScreen({ onGoBack }: ProfileScreenProps) {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    avatarUri: null as string | null,
  });

  const { Modal, showError, showSuccess } = useModal();

  // Dependency Injection
  const diContainer = DIContainer.getInstance();
  const getUserUseCase = diContainer.getUserUseCase;
  const updateUserUseCase = diContainer.updateUserUseCase;

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      console.log('Go back action not provided');
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Get current user (in a real app, this would be based on authentication)
      const currentUser = await getUserUseCase.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        setFormData({
          name: currentUser.name,
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          birthDate: currentUser.birthDate || '',
          avatarUri: currentUser.avatarUri || null,
        });
      } else {
        // Create default user if none exists
        setFormData({
          name: 'Usuário',
          email: '',
          phone: '',
          birthDate: '',
          avatarUri: null,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      showError('Erro', 'Não foi possível carregar o perfil do usuário');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        showError(
          'Permissão Necessária',
          'Precisamos de acesso à galeria para selecionar imagens',
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
        setFormData(prev => ({ ...prev, avatarUri: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.name.trim()) {
        showError('Erro de Validação', 'Nome é obrigatório');
        return;
      }

      if (formData.email && !isValidEmail(formData.email)) {
        showError('Erro de Validação', 'Email inválido');
        return;
      }

      if (user?.id) {
        // Update existing user
        const updatedUser = await updateUserUseCase.execute(
          user.id,
          formData.name.trim(),
          formData.email.trim() || undefined,
          formData.phone.trim() || undefined,
          formData.birthDate.trim() || undefined,
          formData.avatarUri || undefined,
        );
        setUser(updatedUser);
      }

      setIsEditing(false);
      showSuccess('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      showError('Erro', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEditToggle = () => {
    if (isEditing && !saving) {
      // Reset form data if canceling edit
      if (user) {
        setFormData({
          name: user.name,
          email: user.email || '',
          phone: user.phone || '',
          birthDate: user.birthDate || '',
          avatarUri: user.avatarUri || null,
        });
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text className="mt-4 text-base text-gray-600">
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header Moderno com Gradiente */}
      <LinearGradient
        colors={['#ff6b35', '#f7931e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-4 pb-20 rounded-b-[32px] shadow-xl"
      >
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={handleGoBack}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text-white/80 text-sm font-medium">
              Minha Conta
            </Text>
            <Text className="text-white text-xl font-bold">Meu Perfil</Text>
          </View>

          <TouchableOpacity
            onPress={isEditing ? saveProfile : handleEditToggle}
            disabled={saving}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
          >
            {saving ? (
              <ActivityIndicator size={24} color="white" />
            ) : (
              <Ionicons
                name={isEditing ? 'checkmark' : 'pencil'}
                size={24}
                color="white"
              />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 -mt-16"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Avatar Card Flutuante */}
        <View className="mx-6 mb-8">
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100/50">
            <View className="items-center">
              <TouchableOpacity
                onPress={isEditing ? pickImage : undefined}
                className="relative mb-4"
                activeOpacity={isEditing ? 0.7 : 1}
              >
                {/* Avatar com Borda Gradiente */}
                <View className="w-28 h-28 rounded-full p-1 bg-gradient-to-r from-orange-400 to-pink-400">
                  {formData.avatarUri ? (
                    <Image
                      source={{ uri: formData.avatarUri }}
                      className="w-full h-full rounded-full"
                      style={{ resizeMode: 'cover' }}
                    />
                  ) : (
                    <View className="w-full h-full rounded-full bg-gray-100 items-center justify-center">
                      <Text className="text-gray-500 font-bold text-3xl">
                        {getInitials(formData.name || 'U')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Botão de Camera com Animação */}
                {isEditing && (
                  <View className="absolute -bottom-1 -right-1 bg-orange-500 w-12 h-12 rounded-full items-center justify-center shadow-lg border-4 border-white">
                    <Ionicons name="camera" size={22} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Nome e Email */}
              <Text className="text-gray-900 text-2xl font-bold mb-1">
                {formData.name || 'Usuário'}
              </Text>
              <Text className="text-gray-500 text-base mb-3">
                {formData.email || 'Email não informado'}
              </Text>

              {/* Status Badge */}
              <View className="bg-green-100 px-4 py-2 rounded-full flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-700 text-sm font-medium">
                  Perfil Ativo
                </Text>
              </View>

              {/* Dica de Edição */}
              {!isEditing && (
                <Text className="text-gray-400 text-sm mt-4 text-center">
                  Toque no ícone ✏️ acima para editar seu perfil
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Cards de Informações Modernas */}
        <View className="px-6 space-y-4">
          {/* Card Nome */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#3b82f6" />
              </View>
              <Text className="text-gray-900 text-lg font-semibold flex-1">
                Nome Completo
              </Text>
              {!isEditing && (
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              )}
            </View>

            {isEditing ? (
              <TextInput
                className="text-gray-700 text-base bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
                value={formData.name}
                onChangeText={(text: string) =>
                  setFormData(prev => ({ ...prev, name: text }))
                }
                placeholder="Digite seu nome completo"
                placeholderTextColor="#9ca3af"
              />
            ) : (
              <Text className="text-gray-700 text-base leading-6">
                {formData.name || 'Nome não informado'}
              </Text>
            )}
          </View>

          {/* Card Email */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="mail" size={20} color="#10b981" />
              </View>
              <Text className="text-gray-900 text-lg font-semibold flex-1">
                Email
              </Text>
              {!isEditing && (
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              )}
            </View>

            {isEditing ? (
              <TextInput
                className="text-gray-700 text-base bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
                value={formData.email}
                onChangeText={(text: string) =>
                  setFormData(prev => ({ ...prev, email: text }))
                }
                placeholder="Digite seu email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text className="text-gray-700 text-base leading-6">
                {formData.email || 'Email não informado'}
              </Text>
            )}
          </View>

          {/* Card Telefone */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="call" size={20} color="#8b5cf6" />
              </View>
              <Text className="text-gray-900 text-lg font-semibold flex-1">
                Telefone
              </Text>
              {!isEditing && (
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              )}
            </View>

            {isEditing ? (
              <TextInput
                className="text-gray-700 text-base bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
                value={formData.phone}
                onChangeText={(text: string) =>
                  setFormData(prev => ({ ...prev, phone: text }))
                }
                placeholder="Digite seu telefone"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            ) : (
              <Text className="text-gray-700 text-base leading-6">
                {formData.phone || 'Telefone não informado'}
              </Text>
            )}
          </View>

          {/* Card Data de Nascimento */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="calendar" size={20} color="#f97316" />
              </View>
              <Text className="text-gray-900 text-lg font-semibold flex-1">
                Data de Nascimento
              </Text>
              {!isEditing && (
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              )}
            </View>

            {isEditing ? (
              <TextInput
                className="text-gray-700 text-base bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
                value={formData.birthDate}
                onChangeText={(text: string) =>
                  setFormData(prev => ({ ...prev, birthDate: text }))
                }
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
              />
            ) : (
              <Text className="text-gray-700 text-base leading-6">
                {formData.birthDate || 'Data não informada'}
              </Text>
            )}
          </View>
        </View>

        {/* Cancel Button quando editando */}
        {isEditing && (
          <View className="px-6 mt-6">
            <TouchableOpacity
              onPress={handleEditToggle}
              className="bg-gray-200 rounded-2xl p-4 items-center"
            >
              <Text className="text-gray-700 font-semibold text-base">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal />
    </SafeAreaView>
  );
}
