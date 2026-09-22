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
import { Calificaciones } from '../models/Calificaciones';
import { supabase } from '../lib/supabase';

export const NotasScreen = () => {
  const { arbolNotas, refreshState } = useAppData();

  const [asignatura, setAsignatura] = useState('');
  const [notaInput, setNotaInput] = useState('');
  const [notaBusqueda, setNotaBusqueda] = useState('');
  const [calificacionEncontrada, setCalificacionEncontrada] = useState<Calificaciones | null>(null);
  const [tipoRecorrido, setTipoRecorrido] = useState<'inOrden' | 'preOrden' | 'postOrden'>('inOrden');

  useEffect(() => {
    const cargarCalificaciones = async () => {
      const { data, error } = await supabase
        .from('calificaciones')
        .select('id, codigo_asignatura, nota')
        .order('created_at', { ascending: true });

      if (error) {
        Alert.alert('Error de conexión', 'No se pudieron cargar las calificaciones.');
        return;
      }

      arbolNotas.clear();
      data.forEach((item) => arbolNotas.insert(
        Number(item.nota),
        new Calificaciones(item.codigo_asignatura, Number(item.nota), item.id),
      ));
      refreshState();
    };

    void cargarCalificaciones();
  }, [arbolNotas, refreshState]);

  const handleAgregar = async () => {
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

    const { error: subjectError } = await supabase.from('asignaturas').upsert({
      codigo: nuevaCalificacion.codigoAsignatura,
      nombre: nuevaCalificacion.codigoAsignatura,
      uv: 1,
    });
    if (subjectError) {
      Alert.alert('Error', `No se pudo preparar la asignatura: ${subjectError.message}`);
      return;
    }

    const { data: calificacionGuardada, error } = await supabase
      .from('calificaciones')
      .insert({
      codigo_asignatura: nuevaCalificacion.codigoAsignatura,
      nota: nuevaCalificacion.nota,
      })
      .select('id')
      .single();
    if (error) {
      Alert.alert('Error', `No se pudo guardar la calificación: ${error.message}`);
      return;
    }

    // Conservar el ID remoto para poder eliminar exactamente esta fila.
    const calificacionConId = new Calificaciones(
      nuevaCalificacion.codigoAsignatura,
      nuevaCalificacion.nota,
      calificacionGuardada.id,
    );
    arbolNotas.insert(valorNota, calificacionConId);
    refreshState();

    setAsignatura('');
    setNotaInput('');
    Alert.alert('Éxito', 'Calificación guardada correctamente.');
  };

  const handleBuscar = () => {
    const clave = parseFloat(notaBusqueda);
    if (isNaN(clave) || clave < 0 || clave > 100) {
      Alert.alert('Error', 'Ingresa una nota válida entre 0 y 100 para buscar.');
      return;
    }

    const resultado = arbolNotas.search(clave);
    setCalificacionEncontrada(resultado);
    if (!resultado) Alert.alert('No encontrada', 'No existe una calificación con esa nota.');
  };

  const handleEliminar = async (calificacion: Calificaciones) => {
    Alert.alert('Eliminar calificación', '¿Deseas eliminar esta calificación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (calificacion.id === undefined) {
            Alert.alert('Error', 'Esta calificación no tiene un identificador válido. Recarga las notas e inténtalo de nuevo.');
            return;
          }

          const { error } = await supabase
            .from('calificaciones')
            .delete()
            .eq('id', calificacion.id);
          if (error) {
            Alert.alert('Error', `No se pudo eliminar la calificación: ${error.message}`);
            return;
          }

          arbolNotas.remove(calificacion.nota);
          if (calificacionEncontrada === calificacion) setCalificacionEncontrada(null);
          refreshState();
        },
      },
    ]);
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

  const mostrarAyudaRecorrido = (titulo: string, descripcion: string) => {
    Alert.alert(titulo, descripcion);
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
      <Text style={styles.title}>Gestión de calificaciones</Text>

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

      <View style={styles.searchCard}>
        <Text style={styles.subTitle}>Buscar en el árbol por nota</Text>
        <TextInput
          style={styles.input}
          placeholder="Nota exacta (0 - 100)"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={notaBusqueda}
          onChangeText={setNotaBusqueda}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleBuscar}>
          <Text style={styles.buttonText}>Buscar calificación</Text>
        </TouchableOpacity>
        {calificacionEncontrada && (
          <Text style={styles.resultText}>
            Encontrada: {calificacionEncontrada.codigoAsignatura} con nota {calificacionEncontrada.nota}
          </Text>
        )}
      </View>

      {/* Recorridos */}
      <Text style={styles.subTitle}>Orden de las calificaciones:</Text>
      <View style={styles.recorridoContainer}>
        <View style={styles.optionWrapper}>
          <TouchableOpacity
            style={[styles.tabButton, tipoRecorrido === 'inOrden' && styles.tabButtonActive]}
            onPress={() => setTipoRecorrido('inOrden')}
          >
            <Text style={[styles.tabText, tipoRecorrido === 'inOrden' && styles.tabTextActive]}>
              InOrden
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Información sobre InOrden"
            onPress={() => mostrarAyudaRecorrido('InOrden', 'Muestra las calificaciones de menor a mayor.')}
            style={styles.infoButton}
          >
            <Text style={styles.infoText}>i</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionWrapper}>
          <TouchableOpacity
            style={[styles.tabButton, tipoRecorrido === 'preOrden' && styles.tabButtonActive]}
            onPress={() => setTipoRecorrido('preOrden')}
          >
            <Text style={[styles.tabText, tipoRecorrido === 'preOrden' && styles.tabTextActive]}>
              PreOrden
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Información sobre PreOrden"
            onPress={() => mostrarAyudaRecorrido('PreOrden', 'Muestra primero la calificación principal y luego sus grupos relacionados.')}
            style={styles.infoButton}
          >
            <Text style={styles.infoText}>i</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionWrapper}>
          <TouchableOpacity
            style={[styles.tabButton, tipoRecorrido === 'postOrden' && styles.tabButtonActive]}
            onPress={() => setTipoRecorrido('postOrden')}
          >
            <Text style={[styles.tabText, tipoRecorrido === 'postOrden' && styles.tabTextActive]}>
              PostOrden
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Información sobre PostOrden"
            onPress={() => mostrarAyudaRecorrido('PostOrden', 'Muestra primero los grupos relacionados y al final la calificación principal.')}
            style={styles.infoButton}
          >
            <Text style={styles.infoText}>i</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      <View>
        {notasProcesadas.length > 0 ? notasProcesadas.map((item, index) => (
          <View key={`${item.codigoAsignatura}-${item.nota}-${index}`} style={styles.card}>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>{item.nota}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.itemName}>
                Asignatura: {item.codigoAsignatura}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleEliminar(item)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )) : (
          <Text style={styles.emptyText}>
            El árbol no tiene calificaciones registradas.
          </Text>
        )}
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  searchCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BE185D',
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
  searchButton: {
    backgroundColor: '#BE185D',
    padding: 13,
    borderRadius: 6,
    alignItems: 'center',
  },
  resultText: {
    color: '#FBCFE8',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#991B1B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  deleteText: {
    color: '#FECACA',
    fontSize: 11,
    fontWeight: '700',
  },
  recorridoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionWrapper: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 2,
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
  infoButton: {
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    marginLeft: 4,
    width: 20,
  },
  infoText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
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