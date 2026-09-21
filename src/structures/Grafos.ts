import { NodoGrafo } from './NodoGrafo';

export class Grafos<T> {
  private vertices: Map<string, NodoGrafo<T>> = new Map();

  // Agregar un nuevo vértice al grafo
  public agregarVertice(id: string, valor: T): void {
    if (!this.vertices.has(id)) {
      this.vertices.set(id, new NodoGrafo(valor));
    }
  }

  // Agregar una arista no dirigida entre dos vértices
  public agregarArista(id1: string, id2: string): void {
    const nodo1 = this.vertices.get(id1);
    const nodo2 = this.vertices.get(id2);

    if (nodo1 && nodo2) {
      if (!nodo1.vecinos.includes(nodo2)) nodo1.vecinos.push(nodo2);
      if (!nodo2.vecinos.includes(nodo1)) nodo2.vecinos.push(nodo1);
    }
  }

  // Obtener todos los nodos para su renderizado
  public obtenerVertices(): T[] {
    const resultado: T[] = [];
    this.vertices.forEach((nodo) => resultado.push(nodo.valor));
    return resultado;
  }

  // Recorrido en Anchura (BFS)
  public bfs(idInicio: string): T[] {
    const nodoInicio = this.vertices.get(idInicio);
    if (!nodoInicio) return [];

    const visitados = new Set<NodoGrafo<T>>();
    const cola: NodoGrafo<T>[] = [nodoInicio];
    const resultado: T[] = [];

    visitados.add(nodoInicio);

    while (cola.length > 0) {
      const actual = cola.shift()!;
      resultado.push(actual.valor);

      for (const vecino of actual.vecinos) {
        if (!visitados.has(vecino)) {
          visitados.add(vecino);
          cola.push(vecino);
        }
      }
    }
    return resultado;
  }

  // Recorrido en Profundidad (DFS)
  public dfs(idInicio: string): T[] {
    const nodoInicio = this.vertices.get(idInicio);
    if (!nodoInicio) return [];

    const visitados = new Set<NodoGrafo<T>>();
    const resultado: T[] = [];

    const dfsRecursivo = (nodo: NodoGrafo<T>) => {
      visitados.add(nodo);
      resultado.push(nodo.valor);

      for (const vecino of nodo.vecinos) {
        if (!visitados.has(vecino)) {
          dfsRecursivo(vecino);
        }
      }
    };

    dfsRecursivo(nodoInicio);
    return resultado;
  }
}