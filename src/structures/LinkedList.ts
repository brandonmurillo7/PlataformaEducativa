import { Node } from './node';

export class LinkedList<T> {
  private head: Node<T> | null = null;
  private size: number = 0;

  public add(value: T): void {
    const newNode = new Node(value);
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

  public remove(predicate: (value: T) => boolean): boolean {
    if (!this.head) return false;

    if (predicate(this.head.value)) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let current = this.head;
    while (current.next !== null) {
      if (predicate(current.next.value)) {
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }

    return false;
  }

  public find(predicate: (value: T) => boolean): T | null {
    let current = this.head;
    while (current !== null) {
      if (predicate(current.value)) return current.value;
      current = current.next;
    }
    return null;
  }

  public traverse(): T[] {
    const elements: T[] = [];
    let current = this.head;
    while (current !== null) {
      elements.push(current.value);
      current = current.next;
    }
    return elements;
  }

  public toArray(): T[] {
    return this.traverse();
  }
}