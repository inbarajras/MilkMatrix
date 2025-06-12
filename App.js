// Import polyfills first
import 'react-native-get-random-values';

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/components/SplashScreen';
import IsolatedSplashScreen from './src/components/IsolatedSplashScreen';

// Theme configuration - using MD3LightTheme as base
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4FC3F7',           // Pale blue as primary
    secondary: '#81C8E6',         // Light blue instead of green
    tertiary: '#2196F3',          // Blue instead of green
    surface: '#FFFFFF',
    background: '#E3F2FD',        // Light blue background instead of green
    error: '#F44336',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#1C1B1F',
    onBackground: '#1C1B1F',
  },
};

// Main App Component
const AppContent = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <IsolatedSplashScreen />;
  }

  return user ? <AppNavigator /> : <LoginScreen />;
};

// Isolated Splash Component outside of Paper Provider
const SplashWrapper = ({ onFinish }) => {
  return <IsolatedSplashScreen onFinish={onFinish} />;
};

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  // Show splash screen outside of any provider context to avoid React warnings
  if (initialLoading) {
    return (
      <SafeAreaProvider>
        <SplashWrapper onFinish={() => setInitialLoading(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor="#4FC3F7" />
            <AppContent />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
