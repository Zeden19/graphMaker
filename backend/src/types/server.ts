import http = require("node:http");

export type requestMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";

type Body = {
  [key: string]: unknown;
};

export interface RouteContext {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  body: Body | undefined;
  url: string
}

type RouteHandler = (context: RouteContext) => void | Promise<void>;

type RouteEntry = Partial<Record<requestMethod, RouteHandler>> | RouteHandler

export interface Args {
  hostname: string;
  routes: Record<string, RouteEntry>
}