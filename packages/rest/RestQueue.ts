import { Queue } from "../util/Queue";
import RestManager, { RequestData } from "./RestManager";

export class RestQueue extends Queue<RequestData> {
  /** The simplified form of the url which this queue handles. For example, /channels/ID/messages */
  id: string;
  /** The RestManager instance that this queue is attached to. */
  manager: RestManager;

  /** The timestamp when this queue is no longer rate limited. */
  rateLimitedUntil: number | undefined;
  /** The available requests to make at the moment. */
  available: { amount?: number; resetAt?: number; max?: number } = {
    /** The amount of requests that are available at the moment. */
    amount: undefined,
    /** The timestamp when the amount of requests will be reset. */
    resetAt: undefined,
    /** The maximum amount of requests that can be made at the moment. */
    max: undefined,
  };

  /** The timeout ID of the timeout that is set to process this queue. */
  timeoutID: number | undefined;

  constructor(manager: RestManager, id: string) {
    super();

    this.manager = manager;
    this.id = id;
  }

  /** Whether or not this queue is rate limited. */
  get isRateLimited(): boolean {
    if (!this.rateLimitedUntil) return false;

    // Check if the rate limit has expired.
    const remaining = this.rateLimitedUntil - Date.now();
    // If the remaining time is less than 0, then remove the rate limit timestamp.
    if (remaining <= 0) this.rateLimitedUntil = undefined;

    return remaining > 0;
  }

  async process() {
    // If the queue is processing, return.
    if (this.processing) return;

    // If this queue has a timeout set already to process queue its rate limited.
    if (this.timeoutID) return;

    // Check if globally rate limited.
    if (this.manager.isGloballyRateLimited) {
      this.timeoutID = setTimeout(() => {
        this.timeoutID = undefined;
        this.process();
      }, this.manager.globallyRateLimitedUntil! - Date.now());
      return;
    }

    // Check if this queue is rate limited.
    if (this.isRateLimited) {
      this.timeoutID = setTimeout(() => {
        this.timeoutID = undefined;
        this.process();
      }, this.rateLimitedUntil! - Date.now());
      return;
    }

    // Set the queue to processing.
    this.processing = true;

    // If available requests is undefined then we fetch a single request.
    if (this.available.amount === undefined) {
      const item = this.next();
      if (!item) {
        // TODO: Close this queue.
        this.processing = false;
        // Delete this queue since no more items.
        this.manager.queues.delete(this.id);
        return;
      }

      await this.sendRequest(item);
    }

    // Since we know how many requests is available, we can fetch them all at once.
    await Promise.all(
      this.items
        .splice(0, this.available.amount)
        .map((item) => this.sendRequest(item))
    );

    // Attempt 2: Not happy with this
    // While there are items in the queue, process them.
    // while (this.items.length) {
    //   // Get the next item in the queue.
    //   const item = this.next();
    //   // If the item is undefined, continue.
    //   if (!item) break;

    //   // TODO: bucket rate limit.

    //   // Check if there is an available request left to make.

    //   // Make a request to the url.
    //   fetch(item.url, {
    //     method: item.method,
    //     headers: {
    //       Authorization: this.manager.authorization,
    //       "Content-Type": ["GET", "DELETE"].includes(item.method)
    //         ? ""
    //         : "application/json",
    //       "X-Audit-Log-Reason": item.reason ?? "",
    //       ...(item.headers ?? {}),
    //     },
    //     body: item.body ? JSON.stringify(item.body) : undefined,
    //   })
    //     // TODO: change this to await style
    //     .then((res) => res.json())
    //     .then((res) => {
    //       item.resolve?.(res);
    //       return res;
    //     })
    //     // TODO: error handling
    //     .catch((err) => {
    //       console.log("errored");
    //     });
    // }

    // Delete this queue if there are no more items in queue.
    if (!this.items.length) {
      // Set the queue to not processing.
      this.processing = false;

      this.manager.queues.delete(this.id);
      return;
    } else if (this.available.resetAt)
      this.timeoutID = setTimeout(() => {
        this.timeoutID = undefined;
        this.process();
      }, this.available.resetAt - Date.now());
  }

  async sendRequest(item: RequestData) {
    // Remove one from the amount of available requests.
    if (this.available.amount) this.available.amount--;

    const response = await fetch(item.url, {
      method: item.method,
      headers: {
        Authorization: this.manager.authorization,
        "Content-Type": ["GET", "DELETE"].includes(item.method)
          ? ""
          : "application/json",
        "X-Audit-Log-Reason": item.reason ?? "",
        ...(item.headers ?? {}),
      },
      body: item.body ? JSON.stringify(item.body) : undefined,
    });

    // TODO: Process headers

    // TODO: Set bucket id if available.

    // TODO: error handling

    // TODO: handle 204 undefined response

    return await response.json();
  }
}
