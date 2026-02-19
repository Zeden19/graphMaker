import http = require("node:http");
import * as z from "zod";

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";

export interface RouteObject<
  B extends z.ZodTypeAny | undefined = undefined,
  P extends ReadonlyArray<string> | undefined = undefined> {
  body?: B;
  params?: P;
  method: (ctx: RouteContext & {
    body: B extends z.ZodTypeAny ? z.output<B> : undefined,
    params: P extends string[] ? Record<P[number], string> : undefined
  }) => void | Promise<void>
}


export interface RouteContext {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  url: string
}

export type RouteCaller = ((context: RouteContext) => void | Promise<void>)

export type RouteHandler = RouteCaller | RouteObject;

type RouteEntry = Partial<Record<RequestMethod, RouteHandler | RouteObject<z.ZodTypeAny | undefined, ReadonlyArray<string> | undefined>>> | RouteCaller;

export interface Routes {
  hostname: string;
  routes: Record<string, RouteEntry>
}