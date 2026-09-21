import React, { createContext, useContext, useState } from 'react';
import { LinkedList } from '../structures/LinkedList';
import { Stack } from '../structures/Stack';
import { Queue } from '../structures/Queue';
import { BinarySearchTree } from '../structures/BinarySearchTree';
import { HashTable } from '../structures/HashTable';
import { Graph } from '../structures/Graph';

import { Estudiantes } from '../models/Estudiantes';
import { Asignatura } from '../models/Asignatura';
import { Calificaciones } from '../models/Calificaciones';
import { Tutorias } from '../models/Tutorias';

interface AppContextType {
  studentTable: HashTable<Estudiantes>;
  coursesList: LinkedList<Asignatura>;
  submissionStack: Stack<string>;
  tutoringQueue: Queue<Tutorias>;
  gradesTree: BinarySearchTree<Asignatura>;
  studentNetwork: Graph<Estudiantes>;
  refreshState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentTable] = useState(new HashTable<Estudiantes>(10));
  const [coursesList] = useState(new LinkedList<Asignatura>());
  const [submissionStack] = useState(new Stack<string>());
  const [tutoringQueue] = useState(new Queue<Tutorias>());
  const [gradesTree] = useState(new BinarySearchTree<Asignatura>());
  const [studentNetwork] = useState(new Graph<Estudiantes>());

  const [, setTick] = useState(0);
  const refreshState = () => setTick((prev) => prev + 1);

  return (
    <AppContext.Provider
      value={{
        studentTable,
        coursesList,
        submissionStack,
        tutoringQueue,
        gradesTree,
        studentNetwork,
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