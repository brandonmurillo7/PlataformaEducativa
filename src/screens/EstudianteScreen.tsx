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

const carrerasDisponibles = [
  'Administración de Empresas',
  'Contaduría Pública',
  'Mercadotecnia',
  'Ingeniería en Computación',
  'Ingeniería Industrial',
  'Ingeniería en Negocios',
  'Diseño Gráfico',
  'Derecho',
  'Psicología',
  'Turismo',
  'Otra carrera',
];

export const EstudiantesScreen = () => {
  const { tablaEstudiantes, refreshState } = useAppData();

  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [carrera, setCarrera] = useState('');
  const [otraCarrera, setOtraCarrera] = useState('');
  const [mostrarCarreras, setMostrarCarreras] = useState(false);

  // Estado para la búsqueda O(1)
  const [searchId, setSearchId] = useState('');
  const [estudianteEncontrado, setEstudianteEncontrado] = useState<Estudiantes | null>(null);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('id, nombre, correo, carrera')
        .order('created_at', { ascending: true });

      if (error) {
        Alert.alert('Error de conexión', 'No se pudieron cargar los estudiantes desde Supabase.');
        return;
      }

      tablaEstudiantes.clear();
      data.forEach((item) => {
        tablaEstudiantes.set(item.id, new Estudiantes(item.id, item.nombre, item.correo, item.carrera));
      });
      refreshState();
    };

    void cargarEstudiantes();
  }, [refreshState, tablaEstudiantes]);

  const handleAgregar = async () => {
    const carreraSeleccionada = carrera === 'Otra carrera' ? otraCarrera.trim() : carrera.trim();
    if (!id.trim() || !nombre.trim() || !correo.trim() || !carreraSeleccionada) {
      Alert.alert('Error', 'Por favor completa todos los campos del estudiante.');
      return;
    }

    const nuevoEstudiante = new Estudiantes(
      id.trim(),
      nombre.trim(),
      correo.trim(),
      carreraSeleccionada
    );

    const { error } = await supabase.from('estudiantes').upsert({
      id: nuevoEstudiante.id,
      nombre: nuevoEstudiante.nombre,
      correo: nuevoEstudiante.correo,
      carrera: nuevoEstudiante.carrera,
    });

    if (error) {
      Alert.alert('Error', `No se pudo guardar el estudiante: ${error.message}`);
      return;
    }

    // Insertar/Actualizar en la Tabla Hash usando el ID como clave
    tablaEstudiantes.set(id.trim(), nuevoEstudiante);

    // Limpiar campos y actualizar el estado
    setId('');
    setNombre('');
    setCorreo('');
    setCarrera('');
    setOtraCarrera('');
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

  const handleEliminar = async (idEstudiante: string) => {
    Alert.alert('Eliminar estudiante', '¿Deseas eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('estudiantes').delete().eq('id', idEstudiante);
          if (error) {
            Alert.alert('Error', `No se pudo eliminar el estudiante: ${error.message}`);
            return;
          }

          tablaEstudiantes.remove(idEstudiante);
          if (estudianteEncontrado?.id === idEstudiante) setEstudianteEncontrado(null);
          refreshState();
        },
      },
    ]);
  };

  const estudiantesList = tablaEstudiantes.getAll();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>Registro de Estudiantes</Text>
      <Text style={styles.subtitle}>Registro y búsqueda de estudiantes</Text>

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
        <Pressable style={styles.selectButton} onPress={() => setMostrarCarreras(true)}>
          <Text style={carrera ? styles.selectText : styles.selectPlaceholder}>
            {carrera || 'Selecciona una carrera'}
          </Text>
          <Text style={styles.selectArrow}>⌄</Text>
        </Pressable>
        {carrera === 'Otra carrera' && (
          <TextInput
            style={styles.input}
            placeholder="Especifica la carrera"
            placeholderTextColor="#888"
            value={otraCarrera}
            onChangeText={setOtraCarrera}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleAgregar}>
          <Text style={styles.buttonText}>Guardar estudiante</Text>
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

      <View>
        {estudiantesList.length > 0 ? estudiantesList.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.itemCode}>ID: {item.id}</Text>
              <Text style={styles.itemCarrera}>{item.carrera}</Text>
            </View>
            <Text style={styles.itemName}>{item.nombre}</Text>
            <Text style={styles.itemCorreo}>{item.correo}</Text>
            <TouchableOpacity
              onPress={() => handleEliminar(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )) : (
          <Text style={styles.emptyText}>No hay estudiantes registrados.</Text>
        )}
      </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent
        visible={mostrarCarreras}
        onRequestClose={() => setMostrarCarreras(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMostrarCarreras(false)}>
          <View style={styles.careerMenu}>
            <Text style={styles.menuTitle}>Selecciona una carrera</Text>
            {carrerasDisponibles.map((opcion) => (
              <Pressable
                key={opcion}
                onPress={() => {
                  setCarrera(opcion);
                  setMostrarCarreras(false);
                }}
                style={styles.careerOption}
              >
                <Text style={styles.careerOptionText}>{opcion}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setMostrarCarreras(false)} style={styles.closeMenuButton}>
              <Text style={styles.closeMenuText}>Cerrar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  selectButton: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    color: '#A7F3D0',
    fontSize: 22,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  careerMenu: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
  },
  menuTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  careerOption: {
    borderBottomColor: '#334155',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  careerOptionText: {
    color: '#F8FAFC',
    fontSize: 15,
  },
  closeMenuButton: {
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 8,
    marginTop: 14,
    padding: 12,
  },
  closeMenuText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#991B1B',
    borderRadius: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  deleteText: {
    color: '#FECACA',
    fontSize: 12,
    fontWeight: '700',
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