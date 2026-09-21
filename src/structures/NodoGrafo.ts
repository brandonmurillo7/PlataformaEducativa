export class NodoGrafo<T> {
  public valor: T;
  public vecinos: NodoGrafo<T>[] = [];

  constructor(valor: T) {
    this.valor = valor;
  }
}