import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [user, setUser] = useState({
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    birthDate: '15/03/1985',
    avatarUri:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' as
        | string
        | null,
  });
  const [isEditing, setIsEditing] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
      setUser(prev => ({ ...prev, avatarUri: result.assets[0].uri }));
    }
  };

  const saveProfile = () => {
    setIsEditing(false);
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  };

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
            onPress={() => navigation.goBack()}
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
            onPress={() => setIsEditing(!isEditing)}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
          >
            <Ionicons
              name={isEditing ? 'checkmark' : 'pencil'}
              size={24}
              color="white"
            />
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
                  {user.avatarUri ? (
                    <Image
                      source={{ uri: user.avatarUri }}
                      className="w-full h-full rounded-full"
                      style={{ resizeMode: 'cover' }}
                    />
                  ) : (
                    <View className="w-full h-full rounded-full bg-gray-100 items-center justify-center">
                      <Text className="text-gray-500 font-bold text-3xl">
                        {getInitials(user.name)}
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
                {user.name}
              </Text>
              <Text className="text-gray-500 text-base mb-3">{user.email}</Text>

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
                value={user.name}
                onChangeText={(text: string) =>
                  setUser((prev: any) => ({ ...prev, name: text }))
                }
                placeholder="Digite seu nome completo"
                placeholderTextColor="#9ca3af"
              />
            ) : (
              <Text className="text-gray-700 text-base leading-6">
                {user.name}
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
                E-mail
              </Text>
              {!isEditing && (
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              )}
            </View>

            {isEditing ? (
              <TextInput
                className="text-gray-700 text-base bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
                value={user.email}
                onChangeText={(text: string) =>
                  setUser((prev: any) => ({ ...prev, email: text }))
                }
                placeholder="Digite seu e-mail"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text className="text-gray-700 text-base leading-6">
                {user.email}
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
                value={user.phone}
                onChangeText={(text: string) =>
                  setUser((prev: any) => ({ ...prev, phone: text }))
                }
                placeholder="(11) 99999-9999"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            ) : (
              <Text className="text-gray-700 text-base leading-6">
                {user.phone}
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
                value={user.birthDate}
                onChangeText={(text: string) =>
                  setUser((prev: any) => ({ ...prev, birthDate: text }))
                }
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            ) : (
              <Text className="text-gray-700 text-base leading-6">
                {user.birthDate}
              </Text>
            )}
          </View>
        </View>

        {/* Botões de Ação */}
        {isEditing ? (
          <View className="px-6 flex-row space-x-4 mb-8">
            <TouchableOpacity
              className="flex-1 bg-gray-200 py-4 rounded-2xl items-center"
              onPress={() => setIsEditing(false)}
            >
              <View className="flex-row items-center">
                <Ionicons name="close" size={20} color="#6b7280" />
                <Text className="text-gray-600 text-base font-semibold ml-2">
                  Cancelar
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 py-4 rounded-2xl items-center shadow-lg"
              onPress={saveProfile}
            >
              <View className="flex-row items-center">
                <Ionicons name="checkmark" size={20} color="white" />
                <Text className="text-white text-base font-semibold ml-2">
                  Salvar
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 mb-8">
            <TouchableOpacity
              className="bg-gradient-to-r from-orange-500 to-pink-500 py-4 rounded-2xl items-center shadow-lg"
              onPress={() => setIsEditing(true)}
            >
              <View className="flex-row items-center">
                <Ionicons name="pencil" size={20} color="white" />
                <Text className="text-white text-base font-semibold ml-2">
                  Editar Perfil
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Estatísticas Modernas */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="analytics" size={20} color="#6366f1" />
              </View>
              <Text className="text-gray-900 text-xl font-bold">
                Suas Estatísticas
              </Text>
            </View>

            <View className="flex-row justify-between">
              {/* Doses Tomadas */}
              <View className="flex-1 items-center">
                <View className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl items-center justify-center mb-3 shadow-sm">
                  <Ionicons name="checkmark-circle" size={28} color="white" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  127
                </Text>
                <Text className="text-xs text-gray-500 text-center font-medium">
                  Doses Tomadas
                </Text>
              </View>

              {/* Medicamentos */}
              <View className="flex-1 items-center">
                <View className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl items-center justify-center mb-3 shadow-sm">
                  <Ionicons name="medical" size={28} color="white" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">5</Text>
                <Text className="text-xs text-gray-500 text-center font-medium">
                  Medicamentos
                </Text>
              </View>

              {/* Sequência */}
              <View className="flex-1 items-center">
                <View className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl items-center justify-center mb-3 shadow-sm">
                  <Ionicons name="flame" size={28} color="white" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  23
                </Text>
                <Text className="text-xs text-gray-500 text-center font-medium">
                  Dias Seguidos
                </Text>
              </View>
            </View>

            {/* Barra de Progresso */}
            <View className="mt-6 pt-6 border-t border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-700 text-sm font-medium">
                  Meta Mensal
                </Text>
                <Text className="text-gray-500 text-sm">127/150 doses</Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-2">
                <View
                  className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full"
                  style={{ width: '85%' }}
                />
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                85% da meta atingida
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
