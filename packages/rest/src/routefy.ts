import { snowflakeCreatedAt } from "@buncordorg/util";
import { RequestMethod } from "./RestManager.js";

/**
 * https://github.com/abalabahaha/eris/blob/dev/lib/rest/RequestHandler.js#L405
 * 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016-2021 abalabahaha
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
export function routefy(url: string, method: RequestMethod): string {
  let route = url
    .replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, function (match, p) {
      return p === "channels" || p === "guilds" || p === "webhooks"
        ? match
        : `/${p}/:id`;
    })
    .replace(/\/reactions\/[^/]+/g, "/reactions/:id")
    .replace(/\/reactions\/:id\/[^/]+/g, "/reactions/:id/:userID")
    .replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, "/webhooks/$1/:token");

  if (method === "DELETE" && route.endsWith("/messages/:id")) {
    const messageID = url.slice(url.lastIndexOf("/") + 1);
    const age = Date.now() - snowflakeCreatedAt(messageID);
    if (age >= 1000 * 60 * 60 * 24 * 14) method += "_OLD";
    else if (age <= 1000 * 10) method += "_NEW";

    route = method + route;
  } else if (method === "GET" && /\/guilds\/[0-9]+\/channels$/.test(route)) {
    route = "/guilds/:id/channels";
  }

  if (method === "PUT" || method === "DELETE") {
    const index = route.indexOf("/reactions");
    if (index !== -1) {
      route = "MODIFY" + route.slice(0, index + 10);
    }
  }

  return route;
}
