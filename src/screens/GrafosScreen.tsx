import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAppData } from '../context/AppDataContext';
import { Estudiantes } from '../models/Estudiantes';

export const GrafosScreen = () => {
  const { redEstudiantes, refreshState } = useAppData();

  const [estudianteOrigen, setEstudianteOrigen] = useState('');
  const [estudianteDestino, setEstudianteDestino] = useState('');
  const [nuevoEstudiante, setNuevoEstudiante] = useState('');
  const [inicioRecorrido, setInicioRecorrido] = useState('');
  const [modoRecorrido, setModoRecorrido] = useState<'bfs' | 'dfs'>('bfs');
  const [resultadoRecorrido, setResultadoRecorrido] = useState<string[]>([]);

  // Agregar un nodo al grafo
  const handleAgregarNodo = () => {
    if (!nuevoEstudiante.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del estudiante.');
      return;
    }

    const nombre = nuevoEstudiante.trim();
    redEstudiantes.agregarVertice(
      nombre,
      new Estudiantes(nombre, nombre, '', '')
    );
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

    const origen = estudianteOrigen.trim();
    const destino = estudianteDestino.trim();
    if (!redEstudiantes.tieneVertice(origen) || !redEstudiantes.tieneVertice(destino)) {
      Alert.alert('Error', 'Primero registra ambos estudiantes como nodos.');
      return;
    }

    redEstudiantes.agregarArista(origen, destino);

    setEstudianteOrigen('');
    setEstudianteDestino('');
    refreshState();
    Alert.alert('Éxito', 'Conexión establecida entre estudiantes.');
  };

  const listaAdyacencia = redEstudiantes.obtenerAdyacencia().map(({ id, vecinos }) => ({
    vertice: id,
    vecinos: vecinos.map((vecino) => vecino.nombre),
  }));

  const handleRecorrido = () => {
    const inicio = inicioRecorrido.trim();
    if (!inicio) {
      Alert.alert('Error', 'Ingresa el nombre del estudiante inicial.');
      return;
    }
    if (!redEstudiantes.tieneVertice(inicio)) {
      Alert.alert('Error', 'El estudiante inicial no está registrado en la red.');
      return;
    }

    const resultado = modoRecorrido === 'bfs'
      ? redEstudiantes.bfs(inicio)
      : redEstudiantes.dfs(inicio);
    setResultadoRecorrido(resultado.map((estudiante) => estudiante.nombre));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
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

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>3. Recorrer la red</Text>
        <TextInput
          style={styles.input}
          placeholder="Estudiante inicial"
          placeholderTextColor="#888"
          value={inicioRecorrido}
          onChangeText={setInicioRecorrido}
        />
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeButton, modoRecorrido === 'bfs' && styles.modeButtonActive]}
            onPress={() => setModoRecorrido('bfs')}
          >
            <Text style={styles.buttonText}>BFS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, modoRecorrido === 'dfs' && styles.modeButtonActive]}
            onPress={() => setModoRecorrido('dfs')}
          >
            <Text style={styles.buttonText}>DFS</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRecorrido}>
          <Text style={styles.buttonText}>Ejecutar recorrido</Text>
        </TouchableOpacity>
        {resultadoRecorrido.length > 0 && (
          <Text style={styles.traversalResult}>
            {modoRecorrido.toUpperCase()}: {resultadoRecorrido.join(' -> ')}
          </Text>
        )}
      </View>

      {/* Visualización de la Red */}
      <Text style={styles.sectionTitle}>Lista de Conexiones</Text>
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {listaAdyacencia.length > 0 ? listaAdyacencia.map((item) => (
          <View key={item.vertice} style={styles.card}>
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
        )) : (
          <Text style={styles.emptyText}>
            No hay estudiantes en la red universitaria.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#6D28D9',
  },
  traversalResult: {
    color: '#DDD6FE',
    fontWeight: '600',
    marginTop: 10,
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