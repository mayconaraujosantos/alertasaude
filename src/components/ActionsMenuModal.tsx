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

const _screenWidth = Dimensions.get('window').width;

interface ActionMenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}

interface ActionsMenuModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionMenuItem[];
}

export default function ActionsMenuModal({
  visible,
  onClose,
  title = 'Ações',
  actions,
}: ActionsMenuModalProps) {
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

  const handleActionPress = (action: ActionMenuItem) => {
    onClose();
    setTimeout(action.onPress, 100);
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
          </View>

          {/* Actions */}
          <View className="px-6 py-4">
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center py-4 px-4 rounded-2xl mb-3 ${
                  action.disabled
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-gray-50 border border-gray-200 active:bg-gray-100'
                }`}
                onPress={() => handleActionPress(action)}
                disabled={action.disabled}
                activeOpacity={0.8}
              >
                <View
                  className={`w-12 h-12 rounded-xl items-center justify-center mr-4`}
                  style={{
                    backgroundColor: action.disabled
                      ? '#f3f4f6'
                      : (action.color || '#3b82f6') + '20',
                  }}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={
                      action.disabled ? '#9ca3af' : action.color || '#3b82f6'
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${
                      action.disabled ? 'text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {action.title}
                  </Text>
                  {action.subtitle && (
                    <Text
                      className={`text-sm ${
                        action.disabled ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {action.subtitle}
                    </Text>
                  )}
                </View>
                {!action.disabled && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={action.color || '#3b82f6'}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancelar */}
          <View className="px-6 pb-8 pt-2">
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
