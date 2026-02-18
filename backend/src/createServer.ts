import http = require("node:http");
import {AppError, errorStatus} from "./errors";
import {Args, requestMethod, RouteContext} from "./types/server";
import {sendJson} from "./sendJson";

const parseBody = (req: http.IncomingMessage): Promise<RouteContext["body"]> => new Promise((resolve, reject) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    if (!body) return resolve({});
    try {
      resolve(JSON.parse(body));
    } catch (error) {
      reject(error);
    }
  });
  req.on("error", reject);
});

const sendNoContent = (res: http.ServerResponse) => {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  });
  res.end();
};

const notFound = (res: http.ServerResponse) => {
  sendJson(res, 404, {error: "not_found"});
};

const handleError = (res: http.ServerResponse, error: AppError) => {
  const code = error?.code ?? "db_error";
  const status = errorStatus[code] ?? 500;
  sendJson(res, status, {error: code});
};

// Inspired from bun: https://bun.com/docs/runtime/http/server#/
export const createServer = ({hostname, routes}: Args) => {
  return http.createServer(async (req, res) => {
    const methodRequest = req.method as requestMethod | undefined;
    
    if (!req.url) {
      return;
    }
    
    const requestUrl = new URL(req.url, `http://${hostname}`);
    let url = requestUrl.pathname;
    
    if (!methodRequest) {
      notFound(res);
      return;
    }
    
    let body: RouteContext["body"]
    try {
      body = await parseBody(req);
    } catch {
      handleError(res, new AppError("invalid_json"));
      return;
    }
    
    let params: RouteContext["params"] = {};
    const foundRoute = Object.entries(routes).find(([endpoint]) => {
      
      const dynamic = endpoint.indexOf(":");
      if (dynamic >= 0) {
        params[endpoint.slice(dynamic + 1)] = url.slice(dynamic)
        endpoint = endpoint.slice(0, dynamic);
        return endpoint === url.replace(url.slice(dynamic), "");
      }
      return endpoint === url;
    });
    
    if (!foundRoute) {
      notFound(res);
      return;
    }
    
    const [_, caller] = foundRoute;
    
    if (methodRequest === "OPTIONS") {
      sendNoContent(res);
      return;
    }
    
    if (typeof caller === "function") {
      try {
        await caller({req, res, body, url, params})
      } catch (error) {
        handleError(res, error as AppError);
      }
      return;
    }
    
    const handler = caller[methodRequest];
    if (!handler) return notFound(res);
    try {
      await handler({req, res, body, url, params});
    } catch (error) {
      handleError(res, error as AppError);
    }
  });
}

module.exports = {createServer};
