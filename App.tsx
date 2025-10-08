import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { LogBox, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { databaseManager } from './src/database/DatabaseManager';

// Screens
import AddMedicineScreen from './src/screens/AddMedicineScreen';
import AddScheduleScreen from './src/screens/AddScheduleScreen';
import HomeScreen from './src/screens/HomeScreen';
import MedicinesScreen from './src/screens/MedicinesScreen';

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
const initializeApp = async () => {
  try {
    await databaseManager.initDatabase();
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

// Stack Navigator para a seção de medicamentos
function MedicinesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MedicinesList" component={MedicinesScreen} />
      <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
      <Stack.Screen name="AddSchedule" component={AddScheduleScreen} />
    </Stack.Navigator>
  );
}

// Componentes de ícones
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="home" size={size} color={color} />
);

const MedicineIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="medical" size={size} color={color} />
);

// Tab Navigator principal
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Hoje',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Medicines"
        component={MedicinesStack}
        options={{
          tabBarLabel: 'Medicamentos',
          tabBarIcon: MedicineIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Inicializar banco de dados
    const initDB = async () => {
      try {
        await databaseManager.initDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDB();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
