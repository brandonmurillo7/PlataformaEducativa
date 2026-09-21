import { Node } from './node';

export class LinkedList<T> {
  private head: Node<T> | null;
  private size: number;

  constructor() {
    this.head = null;
    this.size = 0;
  }

  // 1. Insertar al final de la lista
  public insert(data: T): void {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next !== null) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
  }

  // 2. Buscar un elemento mediante una función de comparación (predicado)
  public search(predicate: (data: T) => boolean): T | null {
    let current = this.head;
    while (current !== null) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  // 3. Eliminar un elemento mediante un predicado
  public delete(predicate: (data: T) => boolean): boolean {
    if (!this.head) return false;

    // Si el elemento a eliminar es la cabeza (head)
    if (predicate(this.head.data)) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let current = this.head;
    while (current.next !== null) {
      if (predicate(current.next.data)) {
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }

    return false;
  }

  // 4. Recorrer la lista y retornar todos los elementos como un array (para renderizar en React Native)
  public traverse(): T[] {
    const elements: T[] = [];
    let current = this.head;
    while (current !== null) {
      elements.push(current.data);
      current = current.next;
    }
    return elements;
  }

  public getSize(): number {
    return this.size;
  }

  public isEmpty(): boolean {
    return this.head === null;
  }
}