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

  const [asignatura, setAsignatura] = useState('');
  const [notaInput, setNotaInput] = useState('');
  const [tipoRecorrido, setTipoRecorrido] = useState<'inOrden' | 'preOrden' | 'postOrden'>('inOrden');

  const handleAgregar = () => {
    if (!asignatura.trim() || !notaInput.trim()) {
      Alert.alert('Error', 'Por favor completa el código de asignatura y la nota.');
      return;
    }

    const valorNota = parseFloat(notaInput);
    if (isNaN(valorNota) || valorNota < 0 || valorNota > 100) {
      Alert.alert('Error', 'La nota debe ser un número válido entre 0 y 100.');
      return;
    }

    const nuevaCalificacion = new Calificaciones(
      asignatura.trim(),
      valorNota
    );

    // Insertar directamente en el árbol y refrescar el contexto
    arbolNotas.insert(valorNota, nuevaCalificacion);
    refreshState();

    setAsignatura('');
    setNotaInput('');
    Alert.alert('Éxito', 'Calificación registrada en el árbol binario.');
  };

  const obtenerRecorrido = (): Calificaciones[] => {
    if (!arbolNotas) return [];

    switch (tipoRecorrido) {
      case 'preOrden':
        return arbolNotas.preOrden() as Calificaciones[];
      case 'postOrden':
        return arbolNotas.postOrden() as Calificaciones[];
      case 'inOrden':
      default:
        return arbolNotas.inOrden() as Calificaciones[];
    }
  };

  const notasProcesadas: Calificaciones[] = obtenerRecorrido();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Calificaciones (Árbol Binario)</Text>

      {/* Formulario */}
      <View style={styles.formCard}>
        <Text style={styles.subTitle}>Registrar Nueva Nota</Text>

        <TextInput
          style={styles.input}
          placeholder="Código de Asignatura (ej: INF-101)"
          placeholderTextColor="#999"
          value={asignatura}
          onChangeText={setAsignatura}
        />

        <TextInput
          style={styles.input}
          placeholder="Nota (0 - 100)"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={notaInput}
          onChangeText={setNotaInput}
        />

        <TouchableOpacity style={styles.button} onPress={handleAgregar}>
          <Text style={styles.buttonText}>Agregar al Árbol</Text>
        </TouchableOpacity>
      </View>

      {/* Recorridos */}
      <Text style={styles.subTitle}>Seleccionar Recorrido del Árbol:</Text>
      <View style={styles.recorridoContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            tipoRecorrido === 'inOrden' && styles.tabButtonActive,
          ]}
          onPress={() => setTipoRecorrido('inOrden')}
        >
          <Text
            style={[
              styles.tabText,
              tipoRecorrido === 'inOrden' && styles.tabTextActive,
            ]}
          >
            InOrden
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            tipoRecorrido === 'preOrden' && styles.tabButtonActive,
          ]}
          onPress={() => setTipoRecorrido('preOrden')}
        >
          <Text
            style={[
              styles.tabText,
              tipoRecorrido === 'preOrden' && styles.tabTextActive,
            ]}
          >
            PreOrden
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            tipoRecorrido === 'postOrden' && styles.tabButtonActive,
          ]}
          onPress={() => setTipoRecorrido('postOrden')}
        >
          <Text
            style={[
              styles.tabText,
              tipoRecorrido === 'postOrden' && styles.tabTextActive,
            ]}
          >
            PostOrden
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={notasProcesadas}
        keyExtractor={(item, index) =>
          `${item.codigoAsignatura}-${item.nota}-${index}`
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>{item.nota}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.itemName}>
                Asignatura: {item.codigoAsignatura}
              </Text>
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
    padding: 16,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#F8FAFC',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#E2E8F0',
  },
  formCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#F8FAFC',
  },
  button: {
    backgroundColor: '#EC4899',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  recorridoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#BE185D',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  gradeBadge: {
    backgroundColor: '#831843',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gradeText: {
    color: '#FBCFE8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
    fontSize: 14,
  },
});