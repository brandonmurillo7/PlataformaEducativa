import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Usuario } from '../models/Usuario';

type PerfilScreenProps = {
  usuario: Usuario;
  onLogout: () => void;
};

export default function PerfilScreen({ usuario, onLogout }: PerfilScreenProps) {
  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas salir de la plataforma?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{usuario.nombre.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.title}>Mi perfil</Text>
      <Text style={styles.subtitle}>Información de la cuenta activa</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{usuario.nombre}</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <Text style={styles.value}>{usuario.correo}</Text>

        <Text style={styles.label}>Estado</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Sesión activa</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleLogout}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
  },
  avatar: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginTop: 24,
    width: 96,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 18,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    marginTop: 30,
    padding: 20,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 14,
    textTransform: 'uppercase',
  },
  value: {
    color: '#F8FAFC',
    fontSize: 17,
    marginTop: 5,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  statusDot: {
    backgroundColor: '#10B981',
    borderRadius: 5,
    height: 10,
    marginRight: 8,
    width: 10,
  },
  statusText: {
    color: '#A7F3D0',
    fontSize: 16,
  },
  logoutButton: {
    alignItems: 'center',
    borderColor: '#EF4444',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 24,
    padding: 15,
  },
  pressed: {
    opacity: 0.75,
  },
  logoutText: {
    color: '#FCA5A5',
    fontSize: 15,
    fontWeight: '800',
  },
});
