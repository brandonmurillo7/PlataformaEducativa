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
import { Asignatura } from '../models/Asignatura';

export const AsignaturasScreen = () => {
  const { listaAsignaturas, refreshState } = useAppData();

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [uv, setUv] = useState('');

  const handleAgregar = () => {
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
    
    // Insertar en la Lista Enlazada
    listaAsignaturas.add(nuevaAsignatura);
    
    // Limpiar campos y refrescar el estado global
    setCodigo('');
    setNombre('');
    setUv('');
    refreshState();
  };

  // Obtener arreglo de la lista para el FlatList
  const asignaturasArray = listaAsignaturas.toArray ? listaAsignaturas.toArray() : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Asignaturas</Text>
      <Text style={styles.subtitle}>Estructura: Lista Enlazada (LinkedList)</Text>

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
          <Text style={styles.buttonText}>Agregar a Lista Enlazada</Text>
        </TouchableOpacity>
      </View>

      {/* Visualización del Estado de la Lista */}
      <Text style={styles.sectionHeader}>
        Asignaturas Enlazadas ({asignaturasArray.length})
      </Text>

      <FlatList
        data={asignaturasArray}
        keyExtractor={(item) => item.codigo}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.nodeBadge}>
              <Text style={styles.nodeText}>Nodo #{index + 1}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.itemCode}>{item.codigo}</Text>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemUv}>{item.uv} UV</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay asignaturas en la lista enlazada.</Text>
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
    color: '#38BDF8',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
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