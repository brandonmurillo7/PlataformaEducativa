import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { AppProvider } from './src/context/AppDataContext';

export default function App() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎓 Campus Virtual ED</Text>
          <Text style={styles.subtitle}>Estructuras de Datos Manuales</Text>
        </View>
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#003366',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 4,
  },
});