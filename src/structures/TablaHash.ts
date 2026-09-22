import { NodoHash } from './NodoHash';

export class TablaHash<T> {
  private tabla: (NodoHash<T> | null)[];
  private tamano: number;

  constructor(tamano: number = 10) {
    this.tamano = tamano;
    this.tabla = new Array(tamano).fill(null);
  }

  private hash(clave: string): number {
    let hash = 0;
    for (let i = 0; i < clave.length; i++) {
      hash += clave.charCodeAt(i);
    }
    return hash % this.tamano;
  }

  // Insertar o actualizar
  public set(clave: string, valor: T): void {
    const indice = this.hash(clave);
    const nuevoNodo = new NodoHash(clave, valor);

    if (this.tabla[indice] === null) {
      this.tabla[indice] = nuevoNodo;
    } else {
      let actual = this.tabla[indice];
      while (actual) {
        if (actual.clave === clave) {
          actual.valor = valor;
          return;
        }
        if (actual.siguiente === null) break;
        actual = actual.siguiente;
      }
      actual!.siguiente = nuevoNodo; 
    }
  }
  public get(clave: string): T | null {
    const indice = this.hash(clave);
    let actual = this.tabla[indice];

    while (actual) {
      if (actual.clave === clave) {
        return actual.valor;
      }
      actual = actual.siguiente;
    }
    return null;
  }

  public remove(clave: string): boolean {
    const indice = this.hash(clave);
    let actual = this.tabla[indice];
    let anterior: NodoHash<T> | null = null;

    while (actual) {
      if (actual.clave === clave) {
        if (anterior === null) {
          this.tabla[indice] = actual.siguiente;
        } else {
          anterior.siguiente = actual.siguiente;
        }
        return true;
      }
      anterior = actual;
      actual = actual.siguiente;
    }
    return false;
  }

  public getAll(): T[] {
    const elementos: T[] = [];
    for (let i = 0; i < this.tamano; i++) {
      let actual = this.tabla[i];
      while (actual) {
        elementos.push(actual.valor);
        actual = actual.siguiente;
      }
    }
    return elementos;
  }

  public clear(): void {
    this.tabla = new Array(this.tamano).fill(null);
  }
}