import React from 'react';
import { Text } from 'react-native';
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

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#F8FAFC',
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
        <Tab.Screen
          name="Perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>👤</Text>,
          }}
        >
          {() => <PerfilScreen usuario={usuario} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};