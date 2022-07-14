export class Queue<T> {
  /** The items that are queued. */
  items: T[] = [];

  /** Whether or not the queue is currently being processed. */
  processing = false;

  constructor() {}

  /** Returns whether the queue is empty. */
  get isEmpty(): boolean {
    return !this.items.length;
  }

  /** Returns whether the queue is NOT empty. */
  get isNotEmpty(): boolean {
    return !this.isEmpty;
  }

  /** Returns the length of the queue. */
  get length(): number {
    return this.items.length;
  }

  /** Adds an item to the queue. */
  add(item: T): void {
    this.items.push(item);
  }

  /** Removes an item from the queue. */
  remove(item: T): void {

  }

  /** Returns the next item in the queue. */
  next(): T | undefined {
    return this.items.shift();
  }
}
