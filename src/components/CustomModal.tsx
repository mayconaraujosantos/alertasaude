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
  iconColor = '#3b82f6',
  buttons,
  onBackdropPress,
}: CustomModalProps) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

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
        return 'bg-blue-500 border-blue-500';
      case 'destructive':
        return 'bg-red-500 border-red-500';
      case 'cancel':
        return 'bg-gray-100 border-gray-200';
      default:
        return 'bg-white border-gray-300';
    }
  };

  const getButtonTextStyle = (style: string = 'default') => {
    switch (style) {
      case 'primary':
      case 'destructive':
        return 'text-white font-semibold';
      case 'cancel':
        return 'text-gray-700 font-medium';
      default:
        return 'text-blue-500 font-semibold';
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
          className="bg-white rounded-3xl mx-6 shadow-2xl overflow-hidden"
          style={{
            transform: [{ scale: scaleAnim }],
            width: screenWidth - 48,
            maxWidth: 340,
          }}
        >
          {/* Header com ícone */}
          <View className="items-center pt-8 pb-4 px-6">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: getIconColorForType() + '20' }}
            >
              <Ionicons
                name={getIconForType() as any}
                size={32}
                color={getIconColorForType()}
              />
            </View>

            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              {title}
            </Text>

            {message && (
              <Text className="text-base text-gray-600 text-center leading-6">
                {message}
              </Text>
            )}
          </View>

          {/* Botões */}
          <View className="px-6 pb-6">
            {buttons.length === 1 ? (
              // Botão único
              <TouchableOpacity
                className={`py-4 px-6 rounded-2xl border ${getButtonStyle(buttons[0].style)}`}
                onPress={buttons[0].onPress}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-center text-base ${getButtonTextStyle(buttons[0].style)}`}
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
              // Múltiplos botões empilhados
              <View className="space-y-3">
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`py-4 px-6 rounded-2xl border ${getButtonStyle(button.style)}`}
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
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
