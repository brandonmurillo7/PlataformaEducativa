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

export const EstudiantesScreen = () => {
  const { tablaEstudiantes, refreshState } = useAppData();

  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [carrera, setCarrera] = useState('');

  // Estado para la búsqueda O(1)
  const [searchId, setSearchId] = useState('');
  const [estudianteEncontrado, setEstudianteEncontrado] = useState<Estudiantes | null>(null);

  const handleAgregar = () => {
    if (!id.trim() || !nombre.trim() || !correo.trim() || !carrera.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos del estudiante.');
      return;
    }

    const nuevoEstudiante = new Estudiantes(
      id.trim(),
      nombre.trim(),
      correo.trim(),
      carrera.trim()
    );

    // Insertar/Actualizar en la Tabla Hash usando el ID como clave
    tablaEstudiantes.set(id.trim(), nuevoEstudiante);

    // Limpiar campos y actualizar el estado
    setId('');
    setNombre('');
    setCorreo('');
    setCarrera('');
    refreshState();
  };

  const handleBuscar = () => {
    if (!searchId.trim()) {
      Alert.alert('Error', 'Ingresa un ID para buscar.');
      return;
    }

    // Búsqueda en la Tabla Hash
    const resultado = tablaEstudiantes.get(searchId.trim());
    if (resultado) {
      setEstudianteEncontrado(resultado);
    } else {
      setEstudianteEncontrado(null);
      Alert.alert('No encontrado', `No se encontró ningún estudiante con el ID: ${searchId}`);
    }
  };

  const estudiantesList = tablaEstudiantes.getAll();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      <Text style={styles.title}>Registro de Estudiantes</Text>
      <Text style={styles.subtitle}>Estructura: Tabla Hash (HashTable)</Text>

      {/* Formulario de Registro */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Número de Cuenta / ID"
          placeholderTextColor="#888"
          value={id}
          onChangeText={setId}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre Completo"
          placeholderTextColor="#888"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={correo}
          onChangeText={setCorreo}
        />
        <TextInput
          style={styles.input}
          placeholder="Carrera / Especialidad"
          placeholderTextColor="#888"
          value={carrera}
          onChangeText={setCarrera}
        />

        <TouchableOpacity style={styles.button} onPress={handleAgregar}>
          <Text style={styles.buttonText}>Guardar en Tabla Hash</Text>
        </TouchableOpacity>
      </View>

      {/* Sección de Búsqueda Directa O(1) */}
      <View style={styles.searchContainer}>
        <Text style={styles.sectionHeader}>Búsqueda Rápida por Clave (ID)</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, styles.searchInput]}
            placeholder="Ingrese ID a buscar"
            placeholderTextColor="#888"
            value={searchId}
            onChangeText={setSearchId}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleBuscar}>
            <Text style={styles.buttonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {estudianteEncontrado && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado de la Búsqueda:</Text>
            <Text style={styles.itemText}><Text style={styles.bold}>ID:</Text> {estudianteEncontrado.id}</Text>
            <Text style={styles.itemText}><Text style={styles.bold}>Nombre:</Text> {estudianteEncontrado.nombre}</Text>
            <Text style={styles.itemText}><Text style={styles.bold}>Correo:</Text> {estudianteEncontrado.correo}</Text>
            <Text style={styles.itemText}><Text style={styles.bold}>Carrera:</Text> {estudianteEncontrado.carrera}</Text>
          </View>
        )}
      </View>

      {/* Lista General de Estudiantes */}
      <Text style={styles.sectionHeader}>
        Estudiantes Registrados ({estudiantesList.length})
      </Text>

      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {estudiantesList.length > 0 ? estudiantesList.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.itemCode}>ID: {item.id}</Text>
              <Text style={styles.itemCarrera}>{item.carrera}</Text>
            </View>
            <Text style={styles.itemName}>{item.nombre}</Text>
            <Text style={styles.itemCorreo}>{item.correo}</Text>
          </View>
        )) : (
          <Text style={styles.emptyText}>No hay estudiantes registrados en la tabla hash.</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    color: '#10B981',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  searchContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#059669',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  searchButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  resultCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#064E3B',
    borderRadius: 6,
  },
  resultTitle: {
    color: '#A7F3D0',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#F8FAFC',
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
  listContent: {
    paddingBottom: 120,
  },
  button: {
    backgroundColor: '#10B981',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemCode: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemCarrera: {
    color: '#94A3B8',
    fontSize: 12,
  },
  itemName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCorreo: {
    color: '#64748B',
    fontSize: 13,
  },
  itemText: {
    color: '#D1FAE5',
    fontSize: 13,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});