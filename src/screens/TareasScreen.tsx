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
import { supabase } from '../lib/supabase';

export const TareasScreen = () => {
  const { pilaEntregas, refreshState } = useAppData();

  const [nombreTarea, setNombreTarea] = useState('');

  useEffect(() => {
    const cargarTareas = async () => {
      const { data, error } = await supabase.from('tareas').select('nombre').order('created_at', { ascending: true });
      if (error) {
        Alert.alert('Error de conexión', 'No se pudieron cargar las tareas.');
        return;
      }
      pilaEntregas.clear();
      data.forEach((item) => pilaEntregas.push(item.nombre));
      refreshState();
    };
    void cargarTareas();
  }, [pilaEntregas, refreshState]);

  // Apilar una nueva entrega (Push)
  const handlePush = async () => {
    if (!nombreTarea.trim()) {
      Alert.alert('Error', 'Ingresa el nombre o código de la tarea enviada.');
      return;
    }

    const { error } = await supabase.from('tareas').insert({ nombre: nombreTarea.trim() });
    if (error) {
      Alert.alert('Error', `No se pudo guardar la tarea: ${error.message}`);
      return;
    }
    pilaEntregas.push(nombreTarea.trim());
    setNombreTarea('');
    refreshState();
  };

  // Desapilar / Procesar la última entrega (Pop)
  const handlePop = async () => {
    if (pilaEntregas.isEmpty()) {
      Alert.alert('Sin entregas', 'No hay entregas pendientes para procesar.');
      return;
    }

    const tareaProcesada = pilaEntregas.pop();
        if (tareaProcesada) {
          const { error } = await supabase
            .from('tareas')
            .delete()
            .eq('nombre', tareaProcesada)
            .limit(1);
          if (error) {
            Alert.alert('Error', `No se pudo actualizar Supabase: ${error.message}`);
          }
        }
    refreshState();
    Alert.alert('Entrega procesada', `Se ha procesado la entrega "${tareaProcesada}".`);
  };

  const tareasArray = pilaEntregas.toArray();
  const topeTarea = pilaEntregas.peek();

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
      <Text style={styles.title}>Entregas de Tareas</Text>
      <Text style={styles.subtitle}>Las últimas entregas se atienden primero</Text>

      {/* Formulario de Apilar */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la Tarea / Archivo"
          placeholderTextColor="#888"
          value={nombreTarea}
          onChangeText={setNombreTarea}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.pushButton]} onPress={handlePush}>
            <Text style={styles.buttonText}>Agregar entrega</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.popButton]} onPress={handlePop}>
            <Text style={styles.buttonText}>Procesar última entrega</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador del Tope */}
      {topeTarea && (
        <View style={styles.topCard}>
          <Text style={styles.topLabel}>ENTREGA MÁS RECIENTE:</Text>
          <Text style={styles.topValue}>{topeTarea}</Text>
        </View>
      )}

      {/* Visualización de la Pila */}
      <Text style={styles.sectionHeader}>
        Entregas pendientes ({tareasArray.length})
      </Text>

      <View>
        {tareasArray.length > 0 ? tareasArray.map((item, index) => (
          <View key={`${item}-${index}`} style={[styles.card, index === 0 && styles.cardTop]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {index === 0 ? 'TOPE' : `Posición #${tareasArray.length - index}`}
              </Text>
            </View>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        )) : (
          <Text style={styles.emptyText}>No hay entregas pendientes. Agrega una nueva entrega.</Text>
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
    color: '#F59E0B',
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
  },
  button: {
    alignItems: 'center',
    flex: 1,
    height: 52,
    justifyContent: 'center',
    borderRadius: 8,
  },
  pushButton: {
    backgroundColor: '#F59E0B',
  },
  popButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topCard: {
    backgroundColor: '#78350F',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  topLabel: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: 'bold',
  },
  topValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  cardTop: {
    borderLeftColor: '#F59E0B',
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
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});