import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { LogBox, StatusBar } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { databaseManager } from './src/database/DatabaseManager';
import { NotificationService } from './src/services/NotificationService';

// Screens
import AddMedicineScreen from './src/screens/AddMedicineScreen';
import AddScheduleScreen from './src/screens/AddScheduleScreen';
import AdminScreen from './src/screens/AdminScreen';
import EditMedicineScreen from './src/screens/EditMedicineScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import MedicinesScreen from './src/screens/MedicinesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import './global.css';

// Configuração oficial do Expo para suprimir warnings conhecidos
if (__DEV__) {
  LogBox.ignoreLogs([
    'SafeAreaView has been deprecated', // Warning do React Navigation/Expo
    'Require cycle:', // Warnings de ciclos de require
    'VirtualizedLists should never be nested', // Warning comum do FlatList
  ]);
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Inicializar o banco de dados
const _initializeApp = async () => {
  try {
    await databaseManager.initDatabase();
    console.log('App initialized successfully');

    // Debug: Mostrar informações do banco de dados
    const dbPath = databaseManager.getDatabasePath();
    console.log('=== DATABASE DEBUG INFO ===');
    console.log('Database Path:', dbPath);

    // Mostrar informações das tabelas
    setTimeout(async () => {
      try {
        await databaseManager.getTableInfo();
      } catch (error) {
        console.error('Error getting table info:', error);
      }
    }, 1000);
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

// Stack Navigator para a seção Home
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AdminScreen" component={AdminScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator para a seção de medicamentos
function MedicinesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="MedicinesList" component={MedicinesScreen} />
      <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
      <Stack.Screen name="EditMedicine" component={EditMedicineScreen} />
      <Stack.Screen name="AddSchedule" component={AddScheduleScreen} />
    </Stack.Navigator>
  );
}

// Componentes de ícones
const HomeIcon = ({ color }: { color: string; size?: number }) => (
  <Ionicons name="home" size={22} color={color} />
);

const MedicineIcon = ({ color }: { color: string; size?: number }) => (
  <Ionicons name="medical" size={22} color={color} />
);

// Tab Navigator principal
function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ff6b35',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 8,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowColor: '#000',
          paddingBottom: Math.max(insets.bottom + 8, 16),
          paddingTop: 12,
          paddingHorizontal: 16,
          height: 65 + Math.max(insets.bottom, 16),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Medicines"
        component={MedicinesStack}
        options={{
          tabBarLabel: 'Remédios',
          tabBarIcon: MedicineIcon,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Histórico',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="time" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Config',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator principal que contém as abas e telas modais
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Inicializar banco de dados e notificações
    const initApp = async () => {
      try {
        // Inicializar banco de dados
        await databaseManager.initDatabase();
        console.log('Database initialized successfully');

        // Configurar sistema de notificações
        const notificationsEnabled =
          await NotificationService.setupNotifications();
        if (notificationsEnabled) {
          console.log('✅ Notification system initialized successfully');
        } else {
          console.log('⚠️ Notifications not enabled - user denied permission');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
