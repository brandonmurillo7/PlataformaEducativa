export class Node<T> {
  public data: T;
  public next: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}