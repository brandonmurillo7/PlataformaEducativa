export class NodoHash<T> {
  public clave: string;
  public valor: T;
  public siguiente: NodoHash<T> | null = null;

  constructor(clave: string, valor: T) {
    this.clave = clave;
    this.valor = valor;
  }
}