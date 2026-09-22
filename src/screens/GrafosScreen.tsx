import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
import { supabase } from '../lib/supabase';

export const GrafosScreen = () => {
  const { redEstudiantes, refreshState } = useAppData();

  const [estudianteOrigen, setEstudianteOrigen] = useState('');
  const [estudianteDestino, setEstudianteDestino] = useState('');
  const [nuevoEstudiante, setNuevoEstudiante] = useState('');
  const [inicioRecorrido, setInicioRecorrido] = useState('');
  const [modoRecorrido, setModoRecorrido] = useState<'bfs' | 'dfs'>('bfs');
  const [resultadoRecorrido, setResultadoRecorrido] = useState<string[]>([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState<Estudiantes[]>([]);
  const [mostrarEstudiantes, setMostrarEstudiantes] = useState(false);

  useEffect(() => {
    const cargarRed = async () => {
      const [{ data: estudiantes, error: estudiantesError }, { data: conexiones, error: conexionesError }] = await Promise.all([
        supabase.from('estudiantes').select('id, nombre, correo, carrera'),
        supabase.from('conexiones_estudiantes').select('estudiante_origen, estudiante_destino'),
      ]);

      if (estudiantesError || conexionesError) {
        Alert.alert('Error de conexión', 'No se pudo cargar la red de estudiantes.');
        return;
      }

      redEstudiantes.limpiar();
      setEstudiantesDisponibles(
        estudiantes.map((item) => new Estudiantes(item.id, item.nombre, item.correo, item.carrera))
      );
      estudiantes.forEach((item) => {
        redEstudiantes.agregarVertice(item.id, new Estudiantes(item.id, item.nombre, item.correo, item.carrera));
      });
      conexiones.forEach((conexion) => {
        redEstudiantes.agregarArista(conexion.estudiante_origen, conexion.estudiante_destino);
      });
      refreshState();
    };

    void cargarRed();
  }, [redEstudiantes, refreshState]);

  // Agregar un nodo al grafo
  const handleAgregarNodo = async () => {
    if (!nuevoEstudiante.trim()) {
      Alert.alert('Error', 'Selecciona un estudiante registrado.');
      return;
    }

    const nombre = nuevoEstudiante.trim();
    const correoRed = `${nombre.toLowerCase().replace(/\s+/g, '.')}@red.local`;
    const { error: studentError } = await supabase.from('estudiantes').upsert({
      id: nombre,
      nombre,
      correo: correoRed,
      carrera: 'Red de estudiantes',
    });
    if (studentError) {
      Alert.alert('Error', `No se pudo guardar el estudiante: ${studentError.message}`);
      return;
    }

    redEstudiantes.agregarVertice(
      nombre,
      new Estudiantes(nombre, nombre, '', '')
    );
    setNuevoEstudiante('');
    refreshState();
    Alert.alert('Éxito', 'Estudiante agregado a la red.');
  };

  // Conectar dos nodos en el grafo
  const handleConectar = async () => {
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
      Alert.alert('Error', 'Primero agrega ambos estudiantes a la red.');
      return;
    }

    redEstudiantes.agregarArista(origen, destino);
    const { error } = await supabase.from('conexiones_estudiantes').upsert({
      estudiante_origen: origen,
      estudiante_destino: destino,
    });
    if (error) {
      Alert.alert('Error', `No se pudo guardar la conexión: ${error.message}`);
      return;
    }

    setEstudianteOrigen('');
    setEstudianteDestino('');
    refreshState();
    Alert.alert('Éxito', 'Conexión establecida entre estudiantes.');
  };

  const handleEliminarConexion = async (origen: string, destino: string) => {
    const [primeraEliminacion, segundaEliminacion] = await Promise.all([
      supabase
        .from('conexiones_estudiantes')
        .delete()
        .eq('estudiante_origen', origen)
        .eq('estudiante_destino', destino),
      supabase
        .from('conexiones_estudiantes')
        .delete()
        .eq('estudiante_origen', destino)
        .eq('estudiante_destino', origen),
    ]);
    const error = primeraEliminacion.error || segundaEliminacion.error;

    if (error) {
      Alert.alert('Error', `No se pudo eliminar la relación: ${error.message}`);
      return;
    }

    redEstudiantes.eliminarArista(origen, destino);
    refreshState();
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>Red de Estudiantes</Text>
      <Text style={styles.subtitle}>
        Red de colaboración entre estudiantes
      </Text>

      {/* Formulario 1: Agregar Estudiante */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>1. Agregar estudiante a la red</Text>
        <Pressable
          onPress={() => setMostrarEstudiantes(true)}
          style={styles.selectButton}
        >
          <Text style={nuevoEstudiante ? styles.selectText : styles.selectPlaceholder}>
            {nuevoEstudiante || 'Selecciona un estudiante registrado'}
          </Text>
          <Text style={styles.selectArrow}>⌄</Text>
        </Pressable>
        <TouchableOpacity style={styles.button} onPress={handleAgregarNodo}>
          <Text style={styles.buttonText}>Agregar estudiante</Text>
        </TouchableOpacity>
      </View>

      {/* Formulario 2: Conectar Estudiantes */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>2. Conectar estudiantes</Text>
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
        <Text style={styles.sectionTitle}>3. Explorar la red</Text>
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
            <Text style={styles.buttonText}>Por niveles</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, modoRecorrido === 'dfs' && styles.modeButtonActive]}
            onPress={() => setModoRecorrido('dfs')}
          >
            <Text style={styles.buttonText}>En profundidad</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRecorrido}>
          <Text style={styles.buttonText}>Ejecutar recorrido</Text>
        </TouchableOpacity>
        {resultadoRecorrido.length > 0 && (
          <Text style={styles.traversalResult}>
            Recorrido: {resultadoRecorrido.join(' -> ')}
          </Text>
        )}
      </View>

      {/* Visualización de la Red */}
      <Text style={styles.sectionTitle}>Relaciones registradas</Text>
      <View>
        {listaAdyacencia.length > 0 ? listaAdyacencia.map((item) => (
          <View key={item.vertice} style={styles.card}>
            <Text style={styles.nodeName}>👤 {item.vertice}</Text>
            <Text style={styles.connectionsTitle}>Conectado con:</Text>
            {item.vecinos.length > 0 ? (
              <View style={styles.badgesContainer}>
                {item.vecinos.map((vecino: string) => (
                  <View key={vecino} style={styles.connectionRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{vecino}</Text>
                    </View>
                    <TouchableOpacity
                      accessibilityLabel={`Eliminar relación con ${vecino}`}
                      onPress={() => handleEliminarConexion(item.vertice, vecino)}
                      style={styles.deleteConnectionButton}
                    >
                      <Text style={styles.deleteConnectionText}>Eliminar</Text>
                    </TouchableOpacity>
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
      </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent
        visible={mostrarEstudiantes}
        onRequestClose={() => setMostrarEstudiantes(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMostrarEstudiantes(false)}>
          <View style={styles.studentMenu}>
            <Text style={styles.menuTitle}>Selecciona un estudiante</Text>
            {estudiantesDisponibles.length > 0 ? estudiantesDisponibles.map((estudiante) => (
              <Pressable
                key={estudiante.id}
                onPress={() => {
                  setNuevoEstudiante(estudiante.id);
                  setMostrarEstudiantes(false);
                }}
                style={styles.studentOption}
              >
                <Text style={styles.studentOptionName}>{estudiante.nombre}</Text>
                <Text style={styles.studentOptionId}>ID: {estudiante.id}</Text>
              </Pressable>
            )) : (
              <Text style={styles.emptyMenuText}>Primero registra estudiantes en la pestaña Estudiantes.</Text>
            )}
            <Pressable onPress={() => setMostrarEstudiantes(false)} style={styles.closeMenuButton}>
              <Text style={styles.closeMenuText}>Cerrar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  selectButton: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  selectText: {
    color: '#F8FAFC',
    flex: 1,
  },
  selectPlaceholder: {
    color: '#888',
    flex: 1,
  },
  selectArrow: {
    color: '#C4B5FD',
    fontSize: 22,
    marginLeft: 8,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  studentMenu: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '75%',
    padding: 20,
  },
  menuTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  studentOption: {
    borderBottomColor: '#334155',
    borderBottomWidth: 1,
    paddingVertical: 13,
  },
  studentOptionName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  studentOptionId: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
  },
  emptyMenuText: {
    color: '#CBD5E1',
    lineHeight: 20,
    paddingVertical: 16,
  },
  closeMenuButton: {
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 8,
    marginTop: 16,
    padding: 13,
  },
  closeMenuText: {
    color: '#F8FAFC',
    fontWeight: '700',
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
  connectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
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
  deleteConnectionButton: {
    backgroundColor: '#991B1B',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  deleteConnectionText: {
    color: '#FECACA',
    fontSize: 10,
    fontWeight: '700',
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