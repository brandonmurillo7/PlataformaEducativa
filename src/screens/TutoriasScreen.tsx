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
import { Tutorias } from '../models/Tutorias';

export const TutoriasScreen = () => {
  const { colaTutorias, refreshState } = useAppData();

  const [estudiante, setEstudiante] = useState('');
  const [materia, setMateria] = useState('');
  const [tema, setTema] = useState('');

  // Encolar una nueva solicitud de tutoría (Enqueue)
  const handleEnqueue = () => {
    if (!estudiante.trim() || !materia.trim() || !tema.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos de la tutoría.');
      return;
    }

    const nuevaTutoria = new Tutorias(
      estudiante.trim(),
      materia.trim(),
      tema.trim()
    );

    colaTutorias.enqueue(nuevaTutoria);

    setEstudiante('');
    setMateria('');
    setTema('');
    refreshState();
  };

  // Desencolar / Atender la primera tutoría en espera (Dequeue)
  const handleDequeue = () => {
    if (colaTutorias.isEmpty()) {
      Alert.alert('Cola Vacía', 'No hay estudiantes en la cola de tutorías.');
      return;
    }

    const tutoriaAtendida = colaTutorias.dequeue();
    refreshState();
    
    if (tutoriaAtendida) {
      Alert.alert(
        'Tutoría Atendida',
        `Se atendió a ${tutoriaAtendida.estudiante} en la materia ${tutoriaAtendida.materia}.`
      );
    }
  };

  const tutoriasArray = colaTutorias.toArray();
  const proximaTutoria = colaTutorias.peek();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cola de Tutorías</Text>
      <Text style={styles.subtitle}>Estructura: Cola (Queue - FIFO)</Text>

      {/* Formulario de Encolar */}
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
          placeholder="Materia / Asignatura"
          placeholderTextColor="#888"
          value={materia}
          onChangeText={setMateria}
        />
        <TextInput
          style={styles.input}
          placeholder="Tema de Consulta"
          placeholderTextColor="#888"
          value={tema}
          onChangeText={setTema}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.enqueueButton]} onPress={handleEnqueue}>
            <Text style={styles.buttonText}>Encolar (Enqueue)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.dequeueButton]} onPress={handleDequeue}>
            <Text style={styles.buttonText}>Atender (Dequeue)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador del Primero en la Fila */}
      {proximaTutoria && (
        <View style={styles.headCard}>
          <Text style={styles.headLabel}>SIGUIENTE EN ATENDER (PEEK):</Text>
          <Text style={styles.headValue}>{proximaTutoria.estudiante} - {proximaTutoria.materia}</Text>
          <Text style={styles.headSubtext}>Tema: {proximaTutoria.tema}</Text>
        </View>
      )}

      {/* Visualización de la Cola */}
      <Text style={styles.sectionHeader}>
        Estudiantes en Espera ({tutoriasArray.length})
      </Text>

      <FlatList
        data={tutoriasArray}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.card, index === 0 && styles.cardHead]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {index === 0 ? 'TURNO 1' : `Turno #${index + 1}`}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.itemName}>{item.estudiante}</Text>
              <Text style={styles.itemMateria}>{item.materia}</Text>
              <Text style={styles.itemTema}>Tema: {item.tema}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>La cola está vacía. No hay tutorías pendientes.</Text>
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
    color: '#8B5CF6',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  enqueueButton: {
    backgroundColor: '#8B5CF6',
  },
  dequeueButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headCard: {
    backgroundColor: '#4C1D95',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  headLabel: {
    color: '#DDD6FE',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  headSubtext: {
    color: '#C4B5FD',
    fontSize: 13,
    marginTop: 2,
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
    borderLeftColor: '#64748B',
  },
  cardHead: {
    borderLeftColor: '#8B5CF6',
    backgroundColor: '#334155',
  },
  badge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  badgeText: {
    color: '#8B5CF6',
    fontSize: 11,
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
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '500',
  },
  itemTema: {
    color: '#94A3B8',
    fontSize: 12,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});