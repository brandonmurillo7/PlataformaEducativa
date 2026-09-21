import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppDataContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <SafeAreaProvider>
      <AppProvider>
        {isAuthenticated ? (
          <AppNavigator />
        ) : (
          <LoginScreen onLogin={() => setIsAuthenticated(true)} />
        )}
      </AppProvider>
    </SafeAreaProvider>
  );
}