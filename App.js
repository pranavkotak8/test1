import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { initDatabase } from './src/services/database';
import { registerForPushNotificationsAsync, scheduleAllPendingNotifications } from './src/services/notificationService';

import HomeScreen from './src/screens/HomeScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import ReceiptScanScreen from './src/screens/ReceiptScanScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 88,
          paddingBottom: 24,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 4 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'SettingsTab') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Pantry' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function prepare() {
      const errors = [];

      try {
        console.log('[APP] Initializing database...');
        await initDatabase();
        console.log('[APP] Database ready');
      } catch (err) {
        console.error('[APP] Database init failed:', err);
        errors.push('Database: ' + (err?.message || 'Unknown'));
      }

      try {
        console.log('[APP] Setting up notifications...');
        await registerForPushNotificationsAsync();
        console.log('[APP] Notifications ready');
      } catch (err) {
        console.error('[APP] Notification init failed:', err);
        errors.push('Notifications: ' + (err?.message || 'Unknown'));
      }

      try {
        await scheduleAllPendingNotifications();
      } catch (err) {
        console.error('[APP] Schedule notifications failed:', err);
      }

      if (errors.length > 0) {
        setError(errors.join('\n'));
      } else {
        setReady(true);
      }
    }
    prepare();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient colors={['#fef2f2', '#f8fafc']} style={styles.errorGradient}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Startup Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setError(null); setReady(false); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#f0fdf4', '#f8fafc']} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Setting up your pantry...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="AddItem" component={AddItemScreen} />
        <Stack.Screen name="ReceiptScan" component={ReceiptScanScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1 },
  loadingGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748b', fontWeight: '600' },
  errorContainer: { flex: 1 },
  errorGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorTitle: { fontSize: 22, fontWeight: '800', color: '#ef4444', marginTop: 16, marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  retryButton: { backgroundColor: '#ef4444', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
