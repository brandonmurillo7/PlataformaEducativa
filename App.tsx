import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppDataContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { supabase } from './src/lib/supabase';
import { Usuario } from './src/models/Usuario';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  };

  return (
    <SafeAreaProvider>
      <AppProvider>
        {usuario ? (
          <AppNavigator usuario={usuario} onLogout={handleLogout} />
        ) : (
          <LoginScreen onLogin={setUsuario} />
        )}
      </AppProvider>
    </SafeAreaProvider>
  );
}