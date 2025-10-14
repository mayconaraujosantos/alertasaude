import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const _screenWidth = Dimensions.get('window').width;

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove?: () => void;
  hasCurrentImage?: boolean;
  title?: string;
}

export default function ImagePickerModal({
  visible,
  onClose,
  onCamera,
  onGallery,
  onRemove,
  hasCurrentImage = false,
  title = 'Selecionar Imagem',
}: ImagePickerModalProps) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOption = (callback: () => void) => {
    onClose();
    // Pequeno delay para permitir que o modal feche antes de executar a ação
    setTimeout(callback, 100);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        className="flex-1 justify-end"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: opacityAnim,
        }}
      >
        <TouchableOpacity
          className="flex-1"
          onPress={onClose}
          activeOpacity={1}
        />

        <Animated.View
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Header */}
          <View className="items-center py-6 px-6 border-b border-gray-100">
            <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
            <Text className="text-lg font-semibold text-gray-900">{title}</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Escolha uma opção para continuar
            </Text>
          </View>

          {/* Options */}
          <View className="px-6 py-4">
            {/* Câmera */}
            <TouchableOpacity
              className="flex-row items-center py-4 px-4 bg-blue-50 rounded-2xl mb-3 border border-blue-100"
              onPress={() => handleOption(onCamera)}
              activeOpacity={0.8}
            >
              <View className="w-12 h-12 bg-blue-500 rounded-xl items-center justify-center mr-4">
                <Ionicons name="camera" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Usar Câmera
                </Text>
                <Text className="text-sm text-gray-600">
                  Tirar uma nova foto
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
            </TouchableOpacity>

            {/* Galeria */}
            <TouchableOpacity
              className="flex-row items-center py-4 px-4 bg-purple-50 rounded-2xl mb-3 border border-purple-100"
              onPress={() => handleOption(onGallery)}
              activeOpacity={0.8}
            >
              <View className="w-12 h-12 bg-purple-500 rounded-xl items-center justify-center mr-4">
                <Ionicons name="images" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Escolher da Galeria
                </Text>
                <Text className="text-sm text-gray-600">
                  Selecionar foto existente
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
            </TouchableOpacity>

            {/* Remover (apenas se houver imagem atual) */}
            {hasCurrentImage && onRemove && (
              <TouchableOpacity
                className="flex-row items-center py-4 px-4 bg-red-50 rounded-2xl mb-3 border border-red-100"
                onPress={() => handleOption(onRemove)}
                activeOpacity={0.8}
              >
                <View className="w-12 h-12 bg-red-500 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="trash" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Remover Imagem
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Excluir foto atual
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* Cancelar */}
          <View
            className="px-6 pt-2"
            style={{ paddingBottom: Math.max(insets.bottom + 16, 34) }}
          >
            <TouchableOpacity
              className="py-4 px-6 bg-gray-100 rounded-2xl"
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text className="text-center text-base font-semibold text-gray-700">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
