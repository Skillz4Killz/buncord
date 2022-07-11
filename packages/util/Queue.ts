export class Queue {
  /** The options that this queue was configured with. */
  options: QueueOptions;
  /** The items that are queued. */
  items = new Map<string, QueueItem>();
  /** The amount of items that are left this minute. */
  available = Infinity;
  /** The timestamp in milliseconds when the available should be reset. */
  resetAvailableAt: number = 0;

  // TODO: Change booleans to a bitmask.
  /** Whether the queue is currently processing. */
  processing = false;
  /** Whether the queue has a priority item. */
  hasPriorityItem = false;

  intervalID?: number;

  constructor(options: QueueOptions) {
    this.options = options ?? {};

    this.resetAvailable();
  }

  /** The max amount of items to process per minute. */
  get maxPerMinute(): number {
    return this.options.maxPerMinute;
  }

  /** Clear everything from the queue. */
  clear(): void {
    this.items.clear();
  }

  /** Adds an item to the queue. */
  add(item: QueueItem): void {
    // If the item has a priority, add it to the front of the queue.
    if (item.priority !== undefined) {
      this.hasPriorityItem = true;
    }

    this.items.set(item.id, item);
  }

  /** Adds an item to the front of the queue by setting the priority to be one less than the lowest priority in the queue. */
  addToFront(item: QueueItem): void {
    // If there are no items in the queue, set the priority to -1.
    if (!this.items.size) {
      // If the item does not have a priority, set it to -1.
      if (!item.priority) item.priority = -1;
      // Add item to the queue, since it's empty it should end up at the front.
      this.add(item);
    }

    // Get the top priority item in the queue.
    const nextItem = this.next();
    // Set the priority of the item to be one less than the lowest priority.
    item.priority = nextItem?.priority ? nextItem.priority - 1 : -1;

    // Add the item to the front of the queue.
    this.add(item);
  }

  /** Replaces an item in the queue. */
  replace(item: QueueItem): void {
    this.add(item);
  }

  /** Removes an item from the queue. */
  remove(item: QueueItem): void {
    this.items.delete(item.id);
  }

  // Not a getter because it has a loop that could cause low performance if used too much.
  /** Get the next item in queue, taking into consideration the items priority. */
  next(): QueueItem | undefined {
    const values = this.items.values();
    // If there is no priority item, return the next item.
    if (!this.hasPriorityItem) {
      return values.next().value;
    }

    let item: QueueItem | undefined;
    for (const value of values) {
      // The first item in the queue should be set as the item immediately.
      if (!item) {
        item = value;
        continue;
      }

      if (value.priority) {
        // The current item had no priority, possibly because it was first in queue. Set this item as next item because it has a priority number.
        if (!item.priority) {
          item = value;
          continue;
        }

        // If this items priority is lower than the current item, set this item as next item.
        if (value.priority < item.priority) item = value;
      }
    }

    // If there is a priority item, return it else return the next item.
    return item ?? values.next().value;
  }

  /** Process the queue. */
  async process(): Promise<void> {
    if (!this.processing) this.processing = true;

    while (this.items.size) {
    // If there are no items to process, pause until it is available.
      if (this.available <= 0) await this.isAvailable();

      // Get the next item to process.
      const item = this.next();
      if (!item) {
        this.processing = false;
        break;
      }

      this.remove(item);

      // Remove one from the available amount.
      this.available--;
      // DO NOT AWAIT HERE.
      this.options.callback(item).catch((error) => {
        if (this.options.retry) {
          // Add back to the queue.
          this.add(item);
          // TODO: retry counter
          this.options.retry(item, error);
        }
      });
    }
  }

  /** Process an item by bypassing the queue entirely. This is useful for things that don't affect the max amount per minute. */
  bypass(item: QueueItem): void {
    this.options.callback(item).catch((error) => {
      if (this.options.retry) {
        // Add back to the queue.
        this.add(item);
        // TODO: retry counter
        this.options.retry(item, error);
      }
    });
  }

  /** Pauses the execution until, there is something available to process the queue. */
  isAvailable(): Promise<void> {
    return new Promise((resolve) => {
      const allowResolve = () => {
        if (this.available > 0) {
          resolve();
        } else {
          const timeLeft = this.resetAvailableAt - Date.now();

          if (timeLeft > 0) {
            setTimeout(allowResolve, timeLeft > 0 ? timeLeft : 100);
          } else allowResolve();
        }
      };

      allowResolve();
    });
  }

  /** Resets the requests available to the max amount per minute. Then sets an interval to run once a minute to reset it. */
  resetAvailable(): void {
    // Remove the interval if it exists.
    if (this.intervalID) clearInterval(this.intervalID);
    // Set the available to the max amount per minute.
    this.available = this.maxPerMinute;
    this.resetAvailableAt = Date.now() + 60000;

    // Set an interval to reset the available to the max amount per minute.
    this.intervalID = setInterval(() => {
      this.available = this.maxPerMinute;
      this.resetAvailableAt += 60000;
    }, 60000);
  }
}

export interface QueueOptions {
  /** The max amount of requests to send per minute. Defaults to Infinity. */
  maxPerMinute: number;
  /** The callback function execute when this item fails. */
  retry?: (item: QueueItem, error: Error) => void;
  /** The callback function to execute when this queue is being processed. */
  callback: (item: QueueItem) => Promise<void>;
  /** The amount of times this item should be retried if it fails. Defaults to Infinity. */
  maxRetries?: number;
}

export interface QueueItem {
  /** Whether this item should ignore the maxPerMinute. Defaults to undefined which is falsy so false. */
  ignoreMaxPerMinute?: boolean;
  /** The id of this item. */
  id: string;
  /** The priority of this request. The lower the number, the higher the priority. For example, priority 1 is done before priority 2. */
  priority?: number;
  /** The amount of times this item has been retried. Defaults to 0. */
  retriesFailed?: number;
}

export default Queue;
