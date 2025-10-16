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
import { useSystemTheme } from '../../hooks/useSystemTheme';

const { width: screenWidth } = Dimensions.get('window');

export interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel' | 'primary';
}

interface CustomModalProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: string;
  iconColor?: string;
  buttons: ModalButton[];
  onBackdropPress?: () => void;
}

export default function CustomModal({
  visible,
  title,
  message,
  icon,
  iconColor,
  buttons,
  onBackdropPress,
}: CustomModalProps) {
  const { colors, styles: _styles } = useSystemTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  const _defaultIconColor = iconColor || colors.primary;

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

  const getButtonStyle = (style: string = 'default') => {
    switch (style) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 1,
        };
      case 'destructive':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
          borderWidth: 1,
        };
      case 'cancel':
        return {
          backgroundColor: colors.border,
          borderColor: colors.border,
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        };
    }
  };

  const getButtonTextStyle = (style: string = 'default') => {
    switch (style) {
      case 'primary':
      case 'destructive':
        return {
          color: '#FFFFFF',
          fontWeight: '600' as const,
        };
      case 'cancel':
        return {
          color: colors.text.secondary,
          fontWeight: '500' as const,
        };
      default:
        return {
          color: colors.primary,
          fontWeight: '600' as const,
        };
    }
  };

  const getIconForType = () => {
    if (icon) return icon;

    // Auto-detect icon based on title/message
    const text = (title + ' ' + (message || '')).toLowerCase();

    if (text.includes('erro') || text.includes('error')) {
      return 'alert-circle';
    } else if (
      text.includes('sucesso') ||
      text.includes('success') ||
      text.includes('✅')
    ) {
      return 'checkmark-circle';
    } else if (
      text.includes('confirmar') ||
      text.includes('deletar') ||
      text.includes('excluir')
    ) {
      return 'warning';
    } else if (text.includes('info') || text.includes('💡')) {
      return 'information-circle';
    }

    return 'help-circle';
  };

  const getIconColorForType = () => {
    if (iconColor !== '#3b82f6') return iconColor;

    const detectedIcon = getIconForType();
    switch (detectedIcon) {
      case 'alert-circle':
        return '#ef4444';
      case 'checkmark-circle':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'information-circle':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        className="flex-1 justify-center items-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: opacityAnim,
        }}
      >
        <TouchableOpacity
          className="absolute inset-0"
          onPress={onBackdropPress}
          activeOpacity={1}
        />

        <Animated.View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            marginHorizontal: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 16,
            overflow: 'hidden',
            transform: [{ scale: scaleAnim }],
            width: screenWidth - 48,
            maxWidth: 340,
          }}
        >
          {/* Header com ícone */}
          <View
            style={{
              alignItems: 'center',
              paddingTop: 32,
              paddingBottom: 16,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                backgroundColor: getIconColorForType() + '20',
              }}
            >
              <Ionicons
                name={getIconForType() as keyof typeof Ionicons.glyphMap}
                size={32}
                color={getIconColorForType()}
              />
            </View>

            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text.primary,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {title}
            </Text>

            {message && (
              <Text
                style={{
                  fontSize: 16,
                  color: colors.text.secondary,
                  textAlign: 'center',
                  lineHeight: 24,
                }}
              >
                {message}
              </Text>
            )}
          </View>

          {/* Botões */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            {buttons.length === 1 ? (
              // Botão único
              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  ...getButtonStyle(buttons[0].style),
                }}
                onPress={buttons[0].onPress}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    ...getButtonTextStyle(buttons[0].style),
                  }}
                >
                  {buttons[0].text}
                </Text>
              </TouchableOpacity>
            ) : buttons.length === 2 ? (
              // Dois botões lado a lado
              <View className="flex-row space-x-3">
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`flex-1 py-4 px-4 rounded-2xl border ${getButtonStyle(button.style)}`}
                    onPress={button.onPress}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`text-center text-base ${getButtonTextStyle(button.style)}`}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Múltiplos botões
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      borderRadius: 16,
                      ...getButtonStyle(button.style),
                    }}
                    onPress={button.onPress}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 16,
                        ...getButtonTextStyle(button.style),
                      }}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
