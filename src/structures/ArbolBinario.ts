import { NodoArbol } from './NodoArbol';

export class ArbolBinario<T> {
  private raiz: NodoArbol<T> | null = null;

  // Insertar un nuevo elemento usando una clave numérica (ej. la nota)
  public insert(clave: number, valor: T): void {
    const nuevoNodo = new NodoArbol(clave, valor);
    if (this.raiz === null) {
      this.raiz = nuevoNodo;
    } else {
      this.insertarNodo(this.raiz, nuevoNodo);
    }
  }

  private insertarNodo(nodo: NodoArbol<T>, nuevoNodo: NodoArbol<T>): void {
    if (nuevoNodo.clave < nodo.clave) {
      if (nodo.izquierdo === null) {
        nodo.izquierdo = nuevoNodo;
      } else {
        this.insertarNodo(nodo.izquierdo, nuevoNodo);
      }
    } else {
      if (nodo.derecho === null) {
        nodo.derecho = nuevoNodo;
      } else {
        this.insertarNodo(nodo.derecho, nuevoNodo);
      }
    }
  }

  public search(clave: number): T | null {
    let nodoActual = this.raiz;

    while (nodoActual !== null) {
      if (clave === nodoActual.clave) return nodoActual.valor;
      nodoActual = clave < nodoActual.clave
        ? nodoActual.izquierdo
        : nodoActual.derecho;
    }

    return null;
  }

  // Recorrido Inorden (Izquierda - Raíz - Derecha)
  public inOrden(nodo: NodoArbol<T> | null = this.raiz, resultado: T[] = []): T[] {
    if (nodo !== null) {
      this.inOrden(nodo.izquierdo, resultado);
      resultado.push(nodo.valor);
      this.inOrden(nodo.derecho, resultado);
    }
    return resultado;
  }

  // Recorrido Preorden (Raíz - Izquierda - Derecha)
  public preOrden(nodo: NodoArbol<T> | null = this.raiz, resultado: T[] = []): T[] {
    if (nodo !== null) {
      resultado.push(nodo.valor);
      this.preOrden(nodo.izquierdo, resultado);
      this.preOrden(nodo.derecho, resultado);
    }
    return resultado;
  }

  // Recorrido Postorden (Izquierda - Derecha - Raíz)
  public postOrden(nodo: NodoArbol<T> | null = this.raiz, resultado: T[] = []): T[] {
    if (nodo !== null) {
      this.postOrden(nodo.izquierdo, resultado);
      this.postOrden(nodo.derecho, resultado);
      resultado.push(nodo.valor);
    }
    return resultado;
  }
}