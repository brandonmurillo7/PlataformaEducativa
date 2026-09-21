import { Node } from './node';

export class Stack<T> {
  private top: Node<T> | null = null;
  private size: number = 0;

  push(value: T): void {
    const newNode = new Node(value);
    newNode.next = this.top;
    this.top = newNode;
    this.size++;
  }

  pop(): T | null {
    if (!this.top) return null;
    const value = this.top.value;
    this.top = this.top.next;
    this.size--;
    return value;
  }

  peek(): T | null {
    return this.top ? this.top.value : null;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.top;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}