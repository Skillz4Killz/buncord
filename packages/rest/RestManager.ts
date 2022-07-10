import { Buffer } from "fs";

export class RestManager {
  /** The options used to configure this manager. */
  options: RestManagerOptions;

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

  /** Make a request to discords api or the proxy url. */
  async makeRequest<T>(data: RequestData): Promise<T> {
    return await fetch(`${this.baseURL}/${data.url}`, {
      method: data.method,
      headers: {
        Authorization: this.authorization,
        "Content-Type": ["GET", "DELETE"].includes(data.method)
          ? ""
          : "application/json",
        "X-Audit-Log-Reason": data.reason ?? "",
        ...(data.headers ?? {}),
      },
      body: data.body ? JSON.stringify(data.body) : undefined,
    }).then((res) => res.json()) as T;
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
  async delete<T = undefined>(url: string, payload?: { reason?: string }): Promise<T> {
    return await this.makeRequest({
      method: "DELETE",
      url,
      reason: payload?.reason,
    });
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
}

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface FileContent {
  /** The buffer for the file you want to send. */
  buffer: Buffer;
  /** The name of the file attachment. */
  name: string;
}
