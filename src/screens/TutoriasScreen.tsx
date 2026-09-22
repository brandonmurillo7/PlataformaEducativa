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
import { Tutorias } from '../models/Tutorias';
import { supabase } from '../lib/supabase';

export const TutoriasScreen = () => {
  const { colaTutorias, refreshState } = useAppData();

  const [estudiante, setEstudiante] = useState('');
  const [materia, setMateria] = useState('');
  const [tema, setTema] = useState('');

  useEffect(() => {
    const cargarTutorias = async () => {
      let { data, error } = await supabase
        .from('tutorias')
        .select('id_estudiante, nombre_estudiante, materia, tema, fecha')
        .order('created_at', { ascending: true });

      if (error?.message.toLowerCase().includes('materia')) {
        const respuestaAnterior = await supabase
          .from('tutorias')
          .select('id_estudiante, nombre_estudiante, tema, fecha')
          .order('created_at', { ascending: true });
        data = respuestaAnterior.data?.map((item) => ({ ...item, materia: 'No especificada' })) ?? null;
        error = respuestaAnterior.error;
      }

      if (error) {
        Alert.alert('Error de conexión', `No se pudieron cargar las tutorías: ${error.message}`);
        return;
      }
      colaTutorias.clear();
      data?.forEach((item) => colaTutorias.enqueue(new Tutorias(
        item.id_estudiante,
        item.nombre_estudiante,
        item.materia,
        item.tema,
        new Date(item.fecha),
      )));
      refreshState();
    };
    void cargarTutorias();
  }, [colaTutorias, refreshState]);

  // Encolar una nueva solicitud de tutoría (Enqueue)
  const handleEnqueue = async () => {
    if (!estudiante.trim() || !materia.trim() || !tema.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos de la tutoría.');
      return;
    }

    const nuevaTutoria = new Tutorias(
      estudiante.trim(),
      estudiante.trim(),
      materia.trim(),
      tema.trim()
    );

    let { error } = await supabase.from('tutorias').insert({
      id_estudiante: nuevaTutoria.idEstudiante,
      nombre_estudiante: nuevaTutoria.nombreEstudiante,
      materia: nuevaTutoria.materia,
      tema: nuevaTutoria.tema,
    });

    if (error?.message.toLowerCase().includes('materia')) {
      const respuestaAnterior = await supabase.from('tutorias').insert({
        id_estudiante: nuevaTutoria.idEstudiante,
        nombre_estudiante: nuevaTutoria.nombreEstudiante,
        tema: nuevaTutoria.tema,
      });
      error = respuestaAnterior.error;
    }

    if (error) {
      Alert.alert('Error', `No se pudo guardar la tutoría: ${error.message}`);
      return;
    }
    colaTutorias.enqueue(nuevaTutoria);

    setEstudiante('');
    setMateria('');
    setTema('');
    refreshState();
  };

  // Desencolar / Atender la primera tutoría en espera (Dequeue)
  const handleDequeue = async () => {
    if (colaTutorias.isEmpty()) {
      Alert.alert('Sin solicitudes', 'No hay solicitudes de tutoría pendientes.');
      return;
    }

    const tutoriaAtendida = colaTutorias.dequeue();
        if (tutoriaAtendida) {
          const { data } = await supabase
            .from('tutorias')
            .select('id')
            .eq('id_estudiante', tutoriaAtendida.idEstudiante)
            .eq('tema', tutoriaAtendida.tema)
            .order('created_at', { ascending: true })
            .limit(1);
          if (data?.[0]) await supabase.from('tutorias').delete().eq('id', data[0].id);
        }
    refreshState();
    
    if (tutoriaAtendida) {
      Alert.alert(
        'Tutoría Atendida',
        `Se atendió a ${tutoriaAtendida.nombreEstudiante} sobre ${tutoriaAtendida.tema}.`
      );
    }
  };

  const tutoriasArray = colaTutorias.toArray();
  const proximaTutoria = colaTutorias.peek();

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
      <Text style={styles.title}>Solicitudes de tutoría</Text>
      <Text style={styles.subtitle}>Las solicitudes se atienden por orden de llegada</Text>

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
            <Text style={styles.buttonText}>Agregar solicitud</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.dequeueButton]} onPress={handleDequeue}>
            <Text style={styles.buttonText}>Atender siguiente solicitud</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador del Primero en la Fila */}
      {proximaTutoria && (
        <View style={styles.headCard}>
          <Text style={styles.headLabel}>SIGUIENTE SOLICITUD:</Text>
          <Text style={styles.headValue}>{proximaTutoria.nombreEstudiante}</Text>
          <Text style={styles.headSubtext}>Tema: {proximaTutoria.tema}</Text>
        </View>
      )}

      {/* Visualización de la Cola */}
      <Text style={styles.sectionHeader}>
        Estudiantes en Espera ({tutoriasArray.length})
      </Text>

      <View>
        {tutoriasArray.length > 0 ? tutoriasArray.map((item, index) => (
          <View key={`${item.idEstudiante}-${index}`} style={[styles.card, index === 0 && styles.cardHead]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {index === 0 ? 'TURNO 1' : `Turno #${index + 1}`}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.itemName}>{item.nombreEstudiante}</Text>
              <Text style={styles.itemMateria}>Solicitud de tutoría</Text>
              <Text style={styles.itemTema}>Tema: {item.tema}</Text>
            </View>
          </View>
        )) : (
          <Text style={styles.emptyText}>No hay solicitudes de tutoría pendientes.</Text>
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
    alignItems: 'center',
    flex: 1,
    height: 58,
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
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
    textAlign: 'center',
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