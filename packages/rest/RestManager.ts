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

  /** The base url of the discord api */
  get baseURL(): string {
    return `${this.options.baseURL ?? "https://discordapp.com"}/api/v${
      this.version
    }`;
  }

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

  /** Send a request to discord */
  async get<T>(url: string): Promise<T> {
    return await this.makeRequest({ method: "GET", url });
  }

  async post(
    url: string,
    payload?: {
      body?: Record<string, unknown>;
      reason?: string;
      file?: FileContent | FileContent[];
    }
  ) {
    return await this.makeRequest({
      method: "POST",
      url,
      body: payload?.body,
      reason: payload?.reason,
      file: payload?.file,
    });
  }

  async patch(
    url: string,
    payload?: {
      body?: Record<string, unknown> | null | string | any[];
      reason?: string;
      file?: FileContent | FileContent[];
    }
  ) {
    return await this.makeRequest({
      method: "PATCH",
      url,
      body: payload?.body,
      reason: payload?.reason,
      file: payload?.file,
    });
  }

  async put(
    url: string,
    payload?: {
      body?: Record<string, string | number> | any[];
      reason?: string;
    }
  ) {
    return await this.makeRequest({
      method: "PUT",
      url,
      body: payload?.body,
      reason: payload?.reason,
    });
  }

  async delete(url: string, payload?: { reason?: string }) {
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
  method: RequestMethod;
  url: string;
  headers?: Record<string, string>;
  reason?: string;
  body?: Record<string, unknown> | string | null | any[];
  file?: FileContent | FileContent[];
}

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface FileContent {
  buffer: Buffer;
  name: string;
}
