export class NodoArbol<T> {
  public valor: T;
  public clave: number;
  public izquierdo: NodoArbol<T> | null = null;
  public derecho: NodoArbol<T> | null = null;

  constructor(clave: number, valor: T) {
    this.clave = clave;
    this.valor = valor;
  }
}