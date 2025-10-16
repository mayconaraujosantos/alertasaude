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
  const { colors, isDark } = useSystemTheme();

  // Debug colors
  console.log('🎨 [ActionsMenuModal] Colors:', {
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    isDark,
  });

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
          </View>

          {/* Actions */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  marginBottom: 12,
                  backgroundColor: action.disabled ? colors.card : colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: action.disabled ? 0.5 : 1,
                }}
                onPress={() => handleActionPress(action)}
                disabled={action.disabled}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                    backgroundColor: action.disabled
                      ? colors.text.muted + '20'
                      : (action.color || colors.primary) + '20',
                  }}
                >
                  <Ionicons
                    name={action.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={
                      action.disabled
                        ? colors.text.muted
                        : action.color || colors.primary
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: action.disabled
                        ? colors.text.muted
                        : colors.text.primary,
                    }}
                  >
                    {action.title}
                  </Text>
                  {action.subtitle && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: action.disabled
                          ? colors.text.muted
                          : colors.text.secondary,
                      }}
                    >
                      {action.subtitle}
                    </Text>
                  )}
                </View>
                {!action.disabled && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={action.color || colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancelar */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingBottom: 32,
              paddingTop: 8,
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
