import { RestQueue } from "./RestQueue";
import { routefy } from "./routefy";
// @ts-ignore
import { version } from "../package.json" assert { type: "json" };

export class RestManager {
  /** The options used to configure this manager. */
  options: RestManagerOptions;

  /** Maps the bucketID-queueID(the simple url) for the queue */
  bucketQueueMap = new Map<string, string>();

  /** The queues that are currently being processed. */
  queues = new Map<string, RestQueue>();

  /** The timestamp when the token is no longer rate limited. */
  globallyRateLimitedUntil: number | undefined;

  /** Used to prevent the 1hr ban from discord. */
  invalid = {
    /** The amount of requests that were made in the latest interval which returned one of the invalid request errors.  */
    count: 0,
    /** The amount of time in milliseconds to wait before resetting the count. Defaults to 10 minutes. */
    interval: 1000 * 60 * 10,
    /** The timeout id which is going to reset the counter. */
    timeoutID: 0,
    /** The max amount of requests allowed during an interval. Defaults to 9,999 (one less than 10k which will get you banned). */
    max: 9999,
    /** The error status codes on a response that indicate if it should be considered an invalid request. */
    codes: [401, 403, 429],
  };

  constructor(options: RestManagerOptions) {
    this.options = options;
  }

  /** The token used to configure this manager. */
  get token(): string {
    return this.options.token;
  }

  /** The bot token with the bot prefix */
  get botToken(): string {
    return `Bot ${this.token}`;
  }

  /** The authorization token with the bot prefix */
  get authorization(): string {
    return this.options.proxyAuthorization ?? this.botToken;
  }

  /** The version of the discord api */
  get version(): number {
    return this.options.version ?? 10;
  }

  /** The base url of the discord api or the proxy that was provided with the api and version added on. */
  get baseURL(): string {
    return `${this.options.baseURL ?? "https://discord.com"}/api/v${
      this.version
    }`;
  }

  /** Whether or not this current instance is connected to a proxy rest. */
  get isConnectedToProxy(): boolean {
    return !!this.options.baseURL;
  }

  /** Whether or not this manager is globally rate limited. */
  get isGloballyRateLimited(): boolean {
    if (!this.globallyRateLimitedUntil) return false;

    // Check if the bot is rate limited from invalid requests.
    if (this.invalid.count >= this.invalid.max) return true;

    // Check if the rate limit has expired.
    const remaining = this.globallyRateLimitedUntil - Date.now();
    // If the remaining time is less than 0, then remove the rate limit timestamp.
    if (remaining <= 0) this.globallyRateLimitedUntil = undefined;

    return remaining > 0;
  }

  /** How many times a request should be retried if it errors with a 429(too fast) */
  get maxRetries(): number {
    return this.options.maxRetries ?? 10;
  }

  /** Make a request to discords api or the proxy url. */
  async makeRequest<T>(data: RequestData): Promise<T> {
    if (this.isConnectedToProxy)
      return (await fetch(`${this.baseURL}/${data.url}`, {
        method: data.method,
        headers: {
          Authorization: this.authorization,
          "User-Agent": `DiscordBot (https://github.com/Skillz4Killz/buncord, v${version}})`,
          "Content-Type": ["GET", "DELETE"].includes(data.method)
            ? ""
            : "application/json",
          "X-Audit-Log-Reason": data.reason ?? "",
          ...(data.headers ?? {}),
        },
        body: data.body ? JSON.stringify(data.body) : undefined,
      }).then((res) => res.json())) as T;

    // This request needs to be sent to discord, so we need to queue it properly.
    return new Promise((resolve, reject) => {
      // Attach the resolve and reject functions to the request.
      data.resolve = resolve;
      data.reject = reject;

      // Get the shared route for the request.
      const route = this.getRoute(data);
      // Get the queue for this route.
      let queue = this.queues.get(route);

      if (!queue) {
        // Create a new queue for this route.
        queue = new RestQueue(this, route);
        // Add the queue to cache for future requests.
        this.queues.set(route, queue);
      }

      // Add the request to the queue.
      queue.add(data);
      // Begin processing the queue.
      queue.process();
    });
  }

  getRoute(data: RequestData) {
    return routefy(data.url, data.method);
  }

  /** Sends a GET request */
  async get<T = undefined>(url: string): Promise<T> {
    return await this.makeRequest({ method: "GET", url });
  }

  /** Sends a post request */
  async post<T = undefined>(
    url: string,
    payload?: {
      body?: Record<string, unknown>;
      reason?: string;
      file?: FileContent | FileContent[];
    }
  ): Promise<T> {
    return await this.makeRequest({
      method: "POST",
      url,
      body: payload?.body,
      reason: payload?.reason,
      file: payload?.file,
    });
  }

  /** Sends a patch request */
  async patch<T = undefined>(
    url: string,
    payload?: {
      body?: Record<string, unknown> | null | string | any[];
      reason?: string;
      file?: FileContent | FileContent[];
    }
  ): Promise<T> {
    return await this.makeRequest({
      method: "PATCH",
      url,
      body: payload?.body,
      reason: payload?.reason,
      file: payload?.file,
    });
  }

  /** Sends a put request */
  async put<T = undefined>(
    url: string,
    payload?: {
      body?: Record<string, string | number> | any[];
      reason?: string;
    }
  ): Promise<T> {
    return await this.makeRequest({
      method: "PUT",
      url,
      body: payload?.body,
      reason: payload?.reason,
    });
  }

  /** Sends a delete request. */
  async delete<T = undefined>(
    url: string,
    payload?: { reason?: string }
  ): Promise<T> {
    return await this.makeRequest({
      method: "DELETE",
      url,
      reason: payload?.reason,
    });
  }

  /** Handler that runs when a request fails too many times. Keep async so it can be overriden to customize and send to a webhook on a dev server to alert you. */
  async maxRetriesExceeded(item: RequestData, response: Response) {
    console.log(
      `Max retries exceeded for ${item.url}. Error: ${response.status}`
    );
  }
}

export default RestManager;

export interface RestManagerOptions {
  /** The bot token. */
  token: string;
  /** The base url to send requests to. Useful for Rest proxies. Defaults to https://discord.com  */
  baseURL?: string;
  /** The api version you wish to use. */
  version?: 10;
  /** The authorization token to use for a proxy rest. When using a proxy, this can help identify that requests being sent to your proxy are in fact yours. */
  proxyAuthorization?: string;
  /** The amount of times a request should be retried when it fails by a 429(too fast) error. Defaults to 10 */
  maxRetries?: number;
}

export interface RequestData {
  /** The method to send the request with fetch */
  method: RequestMethod;
  /** The route to make the request to. For example: /channels/ChannelIDHere/messages/MessageIDHere */
  url: string;
  /** Any headers you would like to override or add on. */
  headers?: Record<string, string>;
  /** The reason you wish to add to audit logs. Will not work if you override the X-Audit-Log-Reason header. */
  reason?: string;
  /** The body of the request that is sent */
  body?: Record<string, unknown> | string | null | any[];
  /** The file attachment(s) you wish to send. */
  file?: FileContent | FileContent[];
  /** The resolve function to call when the request is finished. */
  resolve?: (value: any) => void;
  /** The reject function to call when the request fails. */
  reject?: (reason?: any) => void;
  /** Used to determine if this items route is ratelimited from another shared request made previously. */
  bucketID?: string;
  /** The amount of times this request has been retried. */
  retries?: number;
}

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface FileContent {
  /** The buffer for the file you want to send. */
  buffer: Buffer;
  /** The name of the file attachment. */
  name: string;
}
