import { Queue } from "../util/Queue";
import RestManager, { RequestData } from "./RestManager";

export class RestQueue extends Queue<RequestData> {
  /** The simplified form of the url which this queue handles. For example, /channels/ID/messages */
  id: string;
  /** The RestManager instance that this queue is attached to. */
  manager: RestManager;

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
    if (!this.available.resetAt) return false;

    // Check if the rate limit has expired.
    const remaining = this.available.resetAt - Date.now();
    // If the remaining time is less than 0, then remove the rate limit timestamp.
    if (remaining <= 0) this.available.resetAt = undefined;

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
      }, this.available.resetAt! - Date.now());
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

    // Process headers
    this.processHeaders(item, response.headers);

    // Handle any errors
    if (response.status < 200 || response.status >= 400)
      return this.handleError(item, response);

    // handle 204 undefined response
    return response.status !== 204 ? await response.json() : undefined;
  }

  processHeaders(item: RequestData, headers: Headers) {
    // The number of requests that can be made
    const limit = headers.get("X-RateLimit-Limit");
    this.available.max = limit ? Number(limit) : undefined;

    // The number of remaining requests that can be made
    const remaining = headers.get("X-RateLimit-Remaining");
    this.available.amount = remaining ? Number(remaining) : undefined;

    // The timestamp when the amount of requests will be reset.
    const resetAt = headers.get("X-RateLimit-Reset-After");
    this.available.resetAt = resetAt ? Number(resetAt) * 1000 : undefined;

    // A unique string denoting the rate limit being encountered (non-inclusive of top-level resources in the path)
    const bucketID = headers.get("X-RateLimit-Bucket");
    if (bucketID) item.bucketID = bucketID;

    // Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route)
    const global = headers.get("X-RateLimit-Global");
    if (global) {
      // Returned only on HTTP 429 responses. Value can be user (per bot or user limit), global (per bot or user global limit), or shared (per resource limit)
      const scope = headers.get("X-RateLimit-Scope");
      // Shared 429 do not effect invalid counter
      if (scope && scope !== "shared") {
        this.manager.invalid.count++;
        // If necessary, create a timeout which will reset the invalid counter.
        if (!this.manager.invalid.timeoutID)
          this.manager.invalid.timeoutID = setTimeout(() => {
            this.manager.invalid.count = 0;
            this.manager.invalid.timeoutID = 0;
          }, this.manager.invalid.interval);
      } else {
        // The number of seconds until the rate limit will be reset.
        const resetAfter = headers.get("Reset-After");
        if (resetAfter)
          this.manager.globallyRateLimitedUntil = Number(resetAfter) * 1000;
      }
    }
  }

  async handleError(item: RequestData, response: Response) {
    // Handle rate limited errors
    if (response.status === 429) {
      if (!item.retries) item.retries = 0;
      // This request should now be deleted.
      else if (item.retries >= this.manager.maxRetries) {
        // TODO: alert the user that this request has been deleted.
        return item.reject?.(
          `[RestFailedMaxRetries] This request reached the max amount of retries. ${JSON.stringify(
            item
          )}`
        );
      }

      item.retries++;
      // TODO: add back to queue
      return;
    }

    // Handle other errors
    item.reject?.({
      status: response.status,
      error: response.type ? JSON.stringify(await response.json()) : undefined,
    });
  }
}
