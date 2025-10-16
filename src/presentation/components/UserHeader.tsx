import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSystemTheme } from '../../hooks/useSystemTheme';

interface UserHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly iconName?: keyof typeof Ionicons.glyphMap;
  readonly onIconPress?: () => void;
  readonly showAddButton?: boolean;
  readonly onAddPress?: () => void;
  readonly searchQuery?: string;
  readonly onSearchChange?: (query: string) => void;
}

export default function UserHeader({
  title,
  subtitle,
  iconName,
  onIconPress,
  showAddButton,
  onAddPress,
  searchQuery,
  onSearchChange,
}: UserHeaderProps) {
  const { colors, styles: _styles, isDark } = useSystemTheme();

  // Dados mock do usuário
  const user = {
    name: 'João Silva',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <LinearGradient
      colors={colors.headerGradient}
      style={{
        paddingHorizontal: 24,
        paddingVertical: 32,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        {/* Avatar e saudação */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(255,255,255,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
              {getInitials(user.name)}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 14, opacity: 0.9 }}>
              Olá, {user.name.split(' ')[0]}! 👋
            </Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              Como está se sentindo?
            </Text>
          </View>
        </View>

        {/* Botões de ação */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {showAddButton && (
            <TouchableOpacity
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,255,255,0.9)',
                borderRadius: 16,
                padding: 12,
                marginRight: 8,
              }}
              onPress={onAddPress}
            >
              <Ionicons
                name="add"
                size={24}
                color={isDark ? 'white' : colors.primary}
              />
            </TouchableOpacity>
          )}

          {iconName && (
            <TouchableOpacity
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,255,255,0.9)',
                borderRadius: 16,
                padding: 12,
              }}
              onPress={onIconPress}
              disabled={!onIconPress}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isDark ? 'white' : colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Título da seção */}
      <View>
        <Text
          style={{
            color: 'white',
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: 'white',
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <Text style={{ color: 'white', fontSize: 14, opacity: 0.9 }}>
              {subtitle}
            </Text>
          </View>
        )}
      </View>

      {/* Campo de busca (se fornecido) */}
      {onSearchChange && (
        <View
          style={{
            marginTop: 16,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Ionicons
            name="search"
            size={20}
            color="white"
            style={{ marginRight: 12 }}
          />
          <TextInput
            style={{
              flex: 1,
              color: 'white',
              fontSize: 16,
            }}
            placeholder="Buscar medicamentos..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery && searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </LinearGradient>
  );
}
