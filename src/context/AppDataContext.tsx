import React, { createContext, useCallback, useContext, useState } from 'react';
import { LinkedList } from '../structures/LinkedList';
import { Stack } from '../structures/Stack';
import { Queue } from '../structures/Queue';
import { ArbolBinario } from '../structures/ArbolBinario';
import { TablaHash } from '../structures/TablaHash';
import { Grafos } from '../structures/Grafos';

import { Estudiantes } from '../models/Estudiantes';
import { Asignatura } from '../models/Asignatura';
import { Calificaciones } from '../models/Calificaciones';
import { Tutorias } from '../models/Tutorias';

interface AppContextType {
  tablaEstudiantes: TablaHash<Estudiantes>;
  listaAsignaturas: LinkedList<Asignatura>;
  pilaEntregas: Stack<string>;
  colaTutorias: Queue<Tutorias>;
  arbolNotas: ArbolBinario<Calificaciones>;
  redEstudiantes: Grafos<Estudiantes>;
  refreshState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tablaEstudiantes] = useState(new TablaHash<Estudiantes>(10));
  const [listaAsignaturas] = useState(new LinkedList<Asignatura>());
  const [pilaEntregas] = useState(new Stack<string>());
  const [colaTutorias] = useState(new Queue<Tutorias>());
  const [arbolNotas] = useState(new ArbolBinario<Calificaciones>());
  const [redEstudiantes] = useState(new Grafos<Estudiantes>());

  const [, setTick] = useState(0);
  const refreshState = useCallback(() => setTick((prev) => prev + 1), []);

  return (
    <AppContext.Provider
      value={{
        tablaEstudiantes,
        listaAsignaturas,
        pilaEntregas,
        colaTutorias,
        arbolNotas,
        redEstudiantes,
        refreshState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppData debe usarse dentro de un AppProvider');
  }
  return context;
};