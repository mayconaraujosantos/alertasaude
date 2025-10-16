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
import { useSystemTheme } from '../../hooks/useSystemTheme';

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
  const { colors, isDark } = useSystemTheme();
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
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Header */}
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 24,
              paddingHorizontal: 24,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{
                width: 48,
                height: 4,
                backgroundColor: colors.text.muted,
                borderRadius: 2,
                marginBottom: 16,
              }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text.primary,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.text.secondary,
                marginTop: 4,
              }}
            >
              Escolha uma opção para continuar
            </Text>
          </View>

          {/* Options */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
            {/* Câmera */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: isDark
                  ? colors.primary + '20'
                  : colors.primary + '10',
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDark
                  ? colors.primary + '30'
                  : colors.primary + '20',
              }}
              onPress={() => handleOption(onCamera)}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}
              >
                <Ionicons name="camera" size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text.primary,
                  }}
                >
                  Usar Câmera
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text.secondary,
                  }}
                >
                  Tirar uma nova foto
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            {/* Galeria */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: isDark ? '#8b5cf620' : '#8b5cf610',
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDark ? '#8b5cf630' : '#8b5cf620',
              }}
              onPress={() => handleOption(onGallery)}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#8b5cf6',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}
              >
                <Ionicons name="images" size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text.primary,
                  }}
                >
                  Escolher da Galeria
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text.secondary,
                  }}
                >
                  Selecionar foto existente
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
            </TouchableOpacity>

            {/* Remover (apenas se houver imagem atual) */}
            {hasCurrentImage && onRemove && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  backgroundColor: isDark
                    ? colors.error + '20'
                    : colors.error + '10',
                  borderRadius: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isDark
                    ? colors.error + '30'
                    : colors.error + '20',
                }}
                onPress={() => handleOption(onRemove)}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: colors.error,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Ionicons name="trash" size={24} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text.primary,
                    }}
                  >
                    Remover Imagem
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text.secondary,
                    }}
                  >
                    Excluir foto atual
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.error}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Cancelar */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom + 16, 34),
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 16,
                paddingHorizontal: 24,
                backgroundColor: colors.card,
                borderRadius: 16,
              }}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text.secondary,
                }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
