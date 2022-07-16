import { delay } from "../util/delay";
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
    console.log("in isRateLimited 1", remaining);
    // If the remaining time is less than 0, then remove the rate limit timestamp.
    if (remaining <= 0) {
      this.available.amount = this.available.max;
      this.available.resetAt = undefined;
    }

    return remaining > 0;
  }

  /** Delays the process for a short period of time. */
  async delayUntil(milliseconds: number) {
    await delay(milliseconds);
    this.process();
  }

  async process() {
    // If the queue is processing, return.
    if (this.processing) return;
    // console.log("in process 2");
    // If this queue has a timeout set already to process queue its rate limited.
    if (this.timeoutID) return;
    // console.log("in process 3");

    // Check if globally rate limited.
    if (this.manager.isGloballyRateLimited) {
      // console.log("in process 4");
      console.log(
        "MAKING TIMEOUT 1",
        this.manager.globallyRateLimitedUntil! - Date.now()
      );
      await this.delayUntil(
        this.manager.globallyRateLimitedUntil! - Date.now()
      );
      return;
    }

    // Check if this queue is rate limited.
    if (this.isRateLimited) {
      // console.log("in process 5");
      console.log("MAKING TIMEOUT 2", this.available.resetAt! - Date.now());

      await this.delayUntil(this.available.resetAt! - Date.now());

      return;
    }

    // console.log("in process 6");
    // Set the queue to processing.
    this.processing = true;

    while (this.items.length) {
      // console.log("in process 7");
      const item = this.next();
      if (!item) {
        // console.log("in process 8");
        this.processing = false;
        // Delete this queue since no more items.
        this.manager.queues.delete(this.id);
        return;
      }

      console.log("in process 9", this.available.amount);
      if (
        this.available.amount === 0 ||
        (this.available.amount && this.available.amount <= 0)
      ) {
        this.items.unshift(item);
        break;
      }

      // console.log("in process 10");
      await this.sendRequest(item);
      // console.log("in process 11");
    }

    // console.log("in process 12");
    // Set the queue to not processing.
    this.processing = false;
    if (!this.items.length) {
      console.log("in process 13");
      this.manager.queues.delete(this.id);
      return;
    } else if (this.available.resetAt) {
      console.log("MAKING TIMEOUT 3", this.available.resetAt! - Date.now());
      await this.delayUntil(this.available.resetAt! - Date.now());
    }
  }

  async sendRequest(item: RequestData) {
    // Remove one from the amount of available requests.
    if (this.available.amount) this.available.amount--;
    console.log("in sendRequest 1", item.body);

    try {
      const response = await fetch(`${this.manager.baseURL}/${item.url}`, {
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
      console.log("in sendRequest 2");
      // Process headers
      this.processHeaders(item, response.headers);
      console.log("in sendRequest 3");
      // Handle any errors
      if (response.status < 200 || response.status >= 400)
        return this.handleError(item, response);
      console.log("in sendRequest 4");
      // handle 204 undefined response
      return response.status !== 204 ? await response.json() : undefined;
    } catch (error) {
      // TODO: better handling of error
      console.log("in catch", error);
    }
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
    console.log(
      "reset header",
      headers.get("X-RateLimit-Reset-After"),
      headers.get("X-RateLimit-Reset")
    );
    this.available.resetAt = resetAt
      ? Date.now() + Number(resetAt) * 1000
      : undefined;

    // A unique string denoting the rate limit being encountered (non-inclusive of top-level resources in the path)
    const bucketID = headers.get("X-RateLimit-Bucket");
    if (bucketID) item.bucketID = bucketID;

    // Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route)
    const global = headers.get("X-RateLimit-Global");
    const retryAfter = headers.get("Retry-After");

    if (global) {
      // Returned only on HTTP 429 responses. Value can be user (per bot or user limit), global (per bot or user global limit), or shared (per resource limit)
      const scope = headers.get("X-RateLimit-Scope");
      // Shared 429 do not effect invalid counter
      if (scope && scope !== "shared") {
        this.manager.invalid.count++;
        // If necessary, create a timeout which will reset the invalid counter.
        console.log("MAKING TIMEOUT 4", this.manager.invalid.interval);

        if (!this.manager.invalid.timeoutID)
          this.delayUntil(this.manager.invalid.interval);
      } else {
        // The number of seconds until the rate limit will be reset.
        if (retryAfter)
          this.manager.globallyRateLimitedUntil = Number(retryAfter) * 1000;
      }
    }
  }

  async handleError(item: RequestData, response: Response) {
    console.log("in handleError 1");
    // Handle rate limited errors
    if (response.status === 429) {
      console.log("in handleError 2");
      if (!item.retries) item.retries = 0;
      // This request should now be deleted.
      else if (item.retries >= this.manager.maxRetries) {
        console.log("in handleError 3");
        // Alert the user that this request has been deleted.
        await this.manager.maxRetriesExceeded(item, response);
        return item.reject?.(
          `[RestFailedMaxRetries] This request reached the max amount of retries. ${JSON.stringify(
            item
          )}`
        );
      }

      // Increase the amount of retries.
      item.retries++;
      // Add back to queue
      const resetAfter = response.headers.get("Retry-After");
      if (resetAfter) {
        console.log("in handleError 4");
        // Store this id so it can be cancel if necessary.
        console.log("MAKING TIMEOUT 5", Number(resetAfter) * 1000);

        await delay(Number(resetAfter) * 1000);
        // Add to the front of the queue since this request is being retried.
        this.items.unshift(item);
      }
      console.log("in handleError 6");
      return;
    }

    console.log("in handleError 5");
    // Handle other errors
    item.reject?.({
      status: response.status,
      error: response.type ? JSON.stringify(await response.json()) : undefined,
    });
  }
}
