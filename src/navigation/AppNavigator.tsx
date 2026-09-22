import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AsignaturasScreen } from '../screens/AsignaturaScreen';
import { EstudiantesScreen } from '../screens/EstudianteScreen';
import GrafosScreen from '../screens/GrafosScreen';
import { NotasScreen } from '../screens/NotasScreen';
import { TareasScreen } from '../screens/TareasScreen';
import { TutoriasScreen } from '../screens/TutoriasScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { Usuario } from '../models/Usuario';

const Tab = createBottomTabNavigator();

type AppNavigatorProps = {
  usuario: Usuario;
  onLogout: () => void;
};

export const AppNavigator = ({ usuario, onLogout }: AppNavigatorProps) => {
  const insets = useSafeAreaInsets();
  const [mostrarPerfil, setMostrarPerfil] = React.useState(false);

  return (
    <NavigationContainer>
      {mostrarPerfil ? (
        <View style={styles.profileView}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMostrarPerfil(false)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>‹  Volver al menú</Text>
          </Pressable>
          <PerfilScreen usuario={usuario} onLogout={onLogout} />
        </View>
      ) : (
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#F8FAFC',
          headerRight: () => (
            <Pressable
              accessibilityLabel="Abrir perfil"
              accessibilityRole="button"
              onPress={() => setMostrarPerfil(true)}
              style={styles.profileButton}
            >
              <Text style={styles.profileButtonText}>👤</Text>
            </Pressable>
          ),
          tabBarStyle: {
            backgroundColor: '#1E293B',
            borderTopColor: '#334155',
            height: 62 + insets.bottom,
            paddingBottom: insets.bottom + 6,
            paddingTop: 4,
          },
          tabBarActiveTintColor: '#8B5CF6',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="RedEstudiantes"
          component={GrafosScreen}
          options={{
            title: 'Red',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>🔗</Text>,
          }}
        />
        <Tab.Screen
          name="Estudiantes"
          component={EstudiantesScreen}
          options={{
            title: 'Estudiantes',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>👥</Text>,
          }}
        />
        <Tab.Screen
          name="Asignaturas"
          component={AsignaturasScreen}
          options={{
            title: 'Asignaturas',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>📚</Text>,
          }}
        />
        <Tab.Screen
          name="Notas"
          component={NotasScreen}
          options={{
            title: 'Notas',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>📊</Text>,
          }}
        />
        <Tab.Screen
          name="Tareas"
          component={TareasScreen}
          options={{
            title: 'Tareas',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>📋</Text>,
          }}
        />
        <Tab.Screen
          name="Tutorias"
          component={TutoriasScreen}
          options={{
            title: 'Tutorías',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>🎓</Text>,
          }}
        />
      </Tab.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    marginRight: 16,
    padding: 4,
  },
  profileButtonText: {
    fontSize: 21,
  },
  profileView: {
    backgroundColor: '#0F172A',
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 12,
    padding: 8,
  },
  backButtonText: {
    color: '#C4B5FD',
    fontSize: 15,
    fontWeight: '700',
  },
});