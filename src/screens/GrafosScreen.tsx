import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAppData } from '../context/AppDataContext';

export const GrafosScreen = () => {
  const { redEstudiantes, refreshState } = useAppData();

  const [estudianteOrigen, setEstudianteOrigen] = useState('');
  const [estudianteDestino, setEstudianteDestino] = useState('');
  const [nuevoEstudiante, setNuevoEstudiante] = useState('');

  // Agregar un nodo al grafo
  const handleAgregarNodo = () => {
    if (!nuevoEstudiante.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del estudiante.');
      return;
    }

    (redEstudiantes as any).agregarVertice?.(nuevoEstudiante.trim());
    setNuevoEstudiante('');
    refreshState();
    Alert.alert('Éxito', 'Estudiante agregado a la red.');
  };

  // Conectar dos nodos en el grafo
  const handleConectar = () => {
    if (!estudianteOrigen.trim() || !estudianteDestino.trim()) {
      Alert.alert('Error', 'Ingresa ambos estudiantes para conectar.');
      return;
    }

    if (estudianteOrigen.trim() === estudianteDestino.trim()) {
      Alert.alert('Error', 'No puedes conectar a un estudiante consigo mismo.');
      return;
    }

    (redEstudiantes as any).agregarArista?.(
      estudianteOrigen.trim(),
      estudianteDestino.trim()
    );

    setEstudianteOrigen('');
    setEstudianteDestino('');
    refreshState();
    Alert.alert('Éxito', 'Conexión establecida entre estudiantes.');
  };

  // Mapeo seguro del Map de adyacencia
  const adyacenciaMap = (redEstudiantes as any)?.adyacencia;
  const listaAdyacencia = adyacenciaMap
    ? Array.from(adyacenciaMap.entries()).map(([vertice, vecinos]: any) => ({
        vertice: typeof vertice === 'object' ? vertice.nombre || String(vertice) : String(vertice),
        vecinos: Array.from(vecinos || []).map((v: any) =>
          typeof v === 'object' ? v.nombre || String(v) : String(v)
        ),
      }))
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Red de Estudiantes</Text>
      <Text style={styles.subtitle}>
        Estructura: Grafo No Dirigido (Lista de Adyacencia)
      </Text>

      {/* Formulario 1: Agregar Estudiante */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>1. Registrar Estudiante en la Red</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del Estudiante"
          placeholderTextColor="#888"
          value={nuevoEstudiante}
          onChangeText={setNuevoEstudiante}
        />
        <TouchableOpacity style={styles.button} onPress={handleAgregarNodo}>
          <Text style={styles.buttonText}>Agregar Nodo (Vértice)</Text>
        </TouchableOpacity>
      </View>

      {/* Formulario 2: Conectar Estudiantes */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>2. Crear Conexión (Arista)</Text>
        <TextInput
          style={styles.input}
          placeholder="Estudiante 1"
          placeholderTextColor="#888"
          value={estudianteOrigen}
          onChangeText={setEstudianteOrigen}
        />
        <TextInput
          style={styles.input}
          placeholder="Estudiante 2"
          placeholderTextColor="#888"
          value={estudianteDestino}
          onChangeText={setEstudianteDestino}
        />
        <TouchableOpacity
          style={[styles.button, styles.connectButton]}
          onPress={handleConectar}
        >
          <Text style={styles.buttonText}>Conectar Estudiantes</Text>
        </TouchableOpacity>
      </View>

      {/* Visualización de la Red */}
      <Text style={styles.sectionTitle}>Lista de Conexiones</Text>
      <FlatList
        data={listaAdyacencia}
        keyExtractor={(item, index) => `${item.vertice}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nodeName}>👤 {item.vertice}</Text>
            <Text style={styles.connectionsTitle}>Conectado con:</Text>
            {item.vecinos.length > 0 ? (
              <View style={styles.badgesContainer}>
                {item.vecinos.map((vecino: string, index: number) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{vecino}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyConnections}>
                Sin conexiones registradas
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay estudiantes en la red universitaria.
          </Text>
        }
      />
    </View>
  );
};

export default GrafosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#8B5CF6',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  formContainer: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#6D28D9',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  nodeName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  connectionsTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#4C1D95',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#DDD6FE',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyConnections: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});