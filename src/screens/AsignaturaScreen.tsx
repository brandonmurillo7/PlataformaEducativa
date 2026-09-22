import React, { useEffect, useState } from 'react';
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
import { Asignatura } from '../models/Asignatura';
import { supabase } from '../lib/supabase';

export const AsignaturasScreen = () => {
  const { listaAsignaturas, refreshState } = useAppData();

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [uv, setUv] = useState('');
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [asignaturaEncontrada, setAsignaturaEncontrada] = useState<Asignatura | null>(null);

  useEffect(() => {
    const cargarAsignaturas = async () => {
      const { data, error } = await supabase
        .from('asignaturas')
        .select('codigo, nombre, uv')
        .order('created_at', { ascending: true });

      if (error) {
        Alert.alert('Error de conexión', 'No se pudieron cargar las asignaturas.');
        return;
      }

      listaAsignaturas.clear();
      data.forEach((item) => listaAsignaturas.add(new Asignatura(item.codigo, item.nombre, item.uv)));
      refreshState();
    };

    void cargarAsignaturas();
  }, [listaAsignaturas, refreshState]);

  const handleAgregar = async () => {
    if (!codigo.trim() || !nombre.trim() || !uv.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const numUv = parseInt(uv, 10);
    if (isNaN(numUv) || numUv <= 0) {
      Alert.alert('Error', 'Las Unidades Valorativas (UV) deben ser un número válido.');
      return;
    }

    const nuevaAsignatura = new Asignatura(codigo.toUpperCase().trim(), nombre.trim(), numUv);

    const { error } = await supabase.from('asignaturas').upsert({
      codigo: nuevaAsignatura.codigo,
      nombre: nuevaAsignatura.nombre,
      uv: nuevaAsignatura.uv,
    });

    if (error) {
      Alert.alert('Error', `No se pudo guardar la asignatura: ${error.message}`);
      return;
    }
    
    // Insertar en la Lista Enlazada
    listaAsignaturas.add(nuevaAsignatura);
    
    // Limpiar campos y refrescar el estado global
    setCodigo('');
    setNombre('');
    setUv('');
    refreshState();
  };

  const handleBuscar = () => {
    const codigoBuscado = codigoBusqueda.trim().toUpperCase();
    if (!codigoBuscado) {
      Alert.alert('Error', 'Ingresa un código para buscar.');
      return;
    }

    const resultado = listaAsignaturas.find((item) => item.codigo === codigoBuscado);
    setAsignaturaEncontrada(resultado);
    if (!resultado) Alert.alert('No encontrada', 'No existe una asignatura con ese código.');
  };

  const handleEliminar = async (codigoAEliminar: string) => {
    Alert.alert('Eliminar materia', 'También se eliminarán sus calificaciones. ¿Deseas continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const { error: gradesError } = await supabase
            .from('calificaciones')
            .delete()
            .eq('codigo_asignatura', codigoAEliminar);
          if (gradesError) {
            Alert.alert('Error', `No se pudieron eliminar sus calificaciones: ${gradesError.message}`);
            return;
          }

          const { error } = await supabase.from('asignaturas').delete().eq('codigo', codigoAEliminar);
          if (error) {
            Alert.alert('Error', `No se pudo eliminar la materia: ${error.message}`);
            return;
          }

          if (listaAsignaturas.remove((item) => item.codigo === codigoAEliminar)) {
            if (asignaturaEncontrada?.codigo === codigoAEliminar) setAsignaturaEncontrada(null);
            refreshState();
          }
        },
      },
    ]);
  };

  // Obtener arreglo de la lista para el FlatList
  const asignaturasArray = listaAsignaturas.toArray ? listaAsignaturas.toArray() : [];

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
      <Text style={styles.title}>Gestión de Asignaturas</Text>
      <Text style={styles.subtitle}>Materias registradas en orden</Text>

      {/* Formulario de Registro */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Código (ej. MM201)"
          placeholderTextColor="#888"
          value={codigo}
          onChangeText={setCodigo}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre de la Asignatura"
          placeholderTextColor="#888"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Unidades Valorativas (UV)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={uv}
          onChangeText={setUv}
        />

        <TouchableOpacity style={styles.button} onPress={handleAgregar}>
          <Text style={styles.buttonText}>Agregar materia</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchTitle}>Buscar materia</Text>
        <TextInput
          style={styles.input}
          placeholder="Código de asignatura"
          placeholderTextColor="#888"
          value={codigoBusqueda}
          onChangeText={setCodigoBusqueda}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleBuscar}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
        {asignaturaEncontrada && (
          <Text style={styles.resultText}>
            Encontrada: {asignaturaEncontrada.nombre} ({asignaturaEncontrada.uv} UV)
          </Text>
        )}
      </View>

      {/* Visualización del Estado de la Lista */}
      <Text style={styles.sectionHeader}>
        Asignaturas Enlazadas ({asignaturasArray.length})
      </Text>

      <View>
        {asignaturasArray.length > 0 ? asignaturasArray.map((item, index) => (
          <View key={item.codigo} style={styles.card}>
            <View style={styles.nodeBadge}>
              <Text style={styles.nodeText}>Materia #{index + 1}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.itemCode}>{item.codigo}</Text>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemUv}>{item.uv} UV</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleEliminar(item.codigo)}
            >
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )) : (
          <Text style={styles.emptyText}>No hay materias registradas.</Text>
        )}
      </View>
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
    color: '#38BDF8',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  searchContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  searchTitle: {
    color: '#E2E8F0',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#0891B2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultText: {
    color: '#A5F3FC',
    marginTop: 10,
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
    backgroundColor: '#2563EB',
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
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  nodeBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  nodeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#991B1B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemCode: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  itemUv: {
    color: '#38BDF8',
    fontSize: 13,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
  },
});