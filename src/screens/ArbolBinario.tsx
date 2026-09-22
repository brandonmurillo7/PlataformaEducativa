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
import { Calificaciones } from '../models/Calificaciones';

export const NotasScreen = () => {
  const { arbolNotas, refreshState } = useAppData();

  const [estudiante, setEstudiante] = useState('');
  const [asignatura, setAsignatura] = useState('');
  const [nota, setNota] = useState('');
  const [tipoRecorrido, setTipoRecorrido] = useState<'in' | 'pre' | 'post'>('in');

  const handleAgregar = () => {
    if (!estudiante.trim() || !asignatura.trim() || !nota.trim()) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }

    const valorNota = parseFloat(nota);
    if (isNaN(valorNota) || valorNota < 0 || valorNota > 100) {
      Alert.alert('Error', 'Ingresa una calificación válida entre 0 y 100.');
      return;
    }

    const nuevaCalificacion = new Calificaciones(
      asignatura.trim(),
      valorNota
    );

    // Insertar en el Árbol Binario usando la nota como clave de ordenamiento
    arbolNotas.insert(valorNota, nuevaCalificacion);

    setEstudiante('');
    setAsignatura('');
    setNota('');
    refreshState();
  };

  // Obtener recorrido según selección del usuario
  const obtenerRecorrido = () => {
    switch (tipoRecorrido) {
      case 'pre':
        return arbolNotas.preOrden();
      case 'post':
        return arbolNotas.postOrden();
      case 'in':
      default:
        return arbolNotas.inOrden();
    }
  };

  const notasProcesadas = obtenerRecorrido();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Calificaciones</Text>
      <Text style={styles.subtitle}>Organización y consulta de calificaciones</Text>

      {/* Formulario de Inserción */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del Estudiante"
          placeholderTextColor="#888"
          value={estudiante}
          onChangeText={setEstudiante}
        />
        <TextInput
          style={styles.input}
          placeholder="Asignatura"
          placeholderTextColor="#888"
          value={asignatura}
          onChangeText={setAsignatura}
        />
        <TextInput
          style={styles.input}
          placeholder="Calificación (0 - 100)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={nota}
          onChangeText={setNota}
        />

        <TouchableOpacity style={styles.button} onPress={handleAgregar}>
          <Text style={styles.buttonText}>Guardar calificación</Text>
        </TouchableOpacity>
      </View>

      {/* Selectores de Recorrido */}
      <Text style={styles.sectionHeader}>Orden de las calificaciones</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tipoRecorrido === 'in' && styles.activeTab]}
          onPress={() => setTipoRecorrido('in')}
        >
          <Text style={[styles.tabText, tipoRecorrido === 'in' && styles.activeTabText]}>
            Inorden (Menor a Mayor)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tipoRecorrido === 'pre' && styles.activeTab]}
          onPress={() => setTipoRecorrido('pre')}
        >
          <Text style={[styles.tabText, tipoRecorrido === 'pre' && styles.activeTabText]}>
            Preorden (Raíz-Izq-Der)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tipoRecorrido === 'post' && styles.activeTab]}
          onPress={() => setTipoRecorrido('post')}
        >
          <Text style={[styles.tabText, tipoRecorrido === 'post' && styles.activeTabText]}>
            Postorden
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Calificaciones según el Recorrido */}
<FlatList
  data={notasProcesadas}
  keyExtractor={(item, index) => `${item.codigoAsignatura}-${item.nota}-${index}`}
  renderItem={({ item }) => (
    <View style={styles.card}>
      <View style={styles.gradeBadge}>
        <Text style={styles.gradeText}>{item.nota}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.itemName}>Asignatura: {item.codigoAsignatura}</Text>
      </View>
    </View>
  )}
  ListEmptyComponent={
    <Text style={styles.emptyText}>
      El árbol no tiene calificaciones registradas.
    </Text>
  }
/>
    </View>
  );
};

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
    color: '#EC4899',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#EC4899',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#BE185D',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  gradeBadge: {
    backgroundColor: '#831843',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  gradeText: {
    color: '#FBCFE8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  itemName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  itemMateria: {
    color: '#F472B6',
    fontSize: 13,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});