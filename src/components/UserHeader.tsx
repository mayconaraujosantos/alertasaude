import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface UserHeaderProps {
  readonly backgroundColor: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly iconName?: any;
  readonly iconColor: string;
  readonly onIconPress?: () => void;
  readonly navigation?: any;
}

export default function UserHeader({
  backgroundColor,
  title,
  subtitle,
  iconName,
  iconColor,
  onIconPress,
  navigation,
}: UserHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Dados mock do usuário - depois pode vir de um contexto/database
  const user = {
    name: 'João Silva',
    email: 'joao@email.com',
    avatarUri:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Imagem de teste
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);

    switch (action) {
      case 'profile':
        if (navigation) {
          navigation.navigate('Profile');
        } else {
          Alert.alert('Perfil', 'Tela de perfil em desenvolvimento');
        }
        break;
      case 'history':
        if (navigation) {
          navigation.navigate('History');
        } else {
          Alert.alert(
            'Histórico',
            'Histórico de medicamentos em desenvolvimento'
          );
        }
        break;
      case 'settings':
        if (navigation) {
          navigation.navigate('Settings');
        } else {
          Alert.alert('Configurações', 'Configurações em desenvolvimento');
        }
        break;
      case 'logout':
        Alert.alert('Sair da conta', 'Você tem certeza que deseja sair?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => {
              console.log('Logout realizado');
              // Aqui você pode implementar a lógica de logout
            },
          },
        ]);
        break;
    }
  };

  return (
    <>
      <View className={`${backgroundColor} px-6 py-8 rounded-b-3xl shadow-lg`}>
        <View className="flex-row items-center justify-between mb-4">
          {/* Avatar e saudação */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity className="mr-4" onPress={handleMenuPress}>
              {user.avatarUri ? (
                <Image
                  source={{ uri: user.avatarUri }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-white bg-opacity-30 items-center justify-center border-2 border-white border-opacity-40">
                  <Text className="text-white font-bold text-lg">
                    {getInitials(user.name)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-white text-sm opacity-90">
                Olá, {user.name.split(' ')[0]}! 👋
              </Text>
              <Text className="text-white text-lg font-semibold">
                Como está se sentindo?
              </Text>
            </View>
          </View>

          {/* Ícone da seção */}
          {iconName && (
            <TouchableOpacity
              className="bg-white rounded-2xl p-3 shadow-sm"
              onPress={onIconPress}
              disabled={!onIconPress}
            >
              <Ionicons name={iconName} size={28} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Título da seção */}
        <View>
          <Text className="text-white text-2xl font-bold mb-1">{title}</Text>
          {subtitle && (
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-white rounded-full mr-2" />
              <Text className="text-white text-sm opacity-90">{subtitle}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showMenu}
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50"
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View className="absolute top-20 left-6 right-6">
            <View className="bg-white rounded-2xl p-4 shadow-xl">
              {/* Header do menu */}
              <View className="flex-row items-center pb-4 border-b border-gray-200">
                {user.avatarUri ? (
                  <Image
                    source={{ uri: user.avatarUri }}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mr-4">
                    <Text className="text-gray-600 font-bold text-xl">
                      {getInitials(user.name)}
                    </Text>
                  </View>
                )}

                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900">
                    {user.name}
                  </Text>
                  <Text className="text-gray-500">{user.email}</Text>
                </View>
              </View>

              {/* Opções do menu */}
              <View className="pt-4 space-y-2">
                <TouchableOpacity
                  className="flex-row items-center py-3 px-2 rounded-xl"
                  onPress={() => handleMenuAction('profile')}
                >
                  <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="person" size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-gray-800 font-medium flex-1">
                    Meu Perfil
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center py-3 px-2 rounded-xl"
                  onPress={() => handleMenuAction('history')}
                >
                  <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="time" size={20} color="#10b981" />
                  </View>
                  <Text className="text-gray-800 font-medium flex-1">
                    Histórico de Medicamentos
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center py-3 px-2 rounded-xl"
                  onPress={() => handleMenuAction('settings')}
                >
                  <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="settings" size={20} color="#8b5cf6" />
                  </View>
                  <Text className="text-gray-800 font-medium flex-1">
                    Configurações
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <View className="border-t border-gray-200 pt-2 mt-2">
                  <TouchableOpacity
                    className="flex-row items-center py-3 px-2 rounded-xl"
                    onPress={() => handleMenuAction('logout')}
                  >
                    <View className="bg-red-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                      <Ionicons name="log-out" size={20} color="#ef4444" />
                    </View>
                    <Text className="text-red-600 font-medium flex-1">
                      Sair
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
