const http = require("http");
const {createGraphStore} = require("./graphs");
const {createUserStore} = require("./users");

const PORT = process.env.PORT || 3000;
const graphStore = createGraphStore();
const userStore = createUserStore();

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(JSON.stringify(payload));
};

const notFound = (res) => {
  sendJson(res, 404, { error: "not_found" });
};

const notImplemented = (res) => {
  sendJson(res, 501, { error: "not_implemented" });
};

const parseBody = (req) => new Promise((resolve, reject) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    if (!body) return resolve(null);
    try {
      resolve(JSON.parse(body));
    } catch (error) {
      reject(error);
    }
  });
  req.on("error", reject);
});

const server = http.createServer(async (req, res) => {
  const { method } = req;
  const requestUrl = new URL(req.url, "http://localhost");
  const url = requestUrl.pathname;

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    return res.end();
  }

  if (method === "GET" && url === "/health") {
    return sendJson(res, 200, { status: "ok", service: "graphmaker-backend" });
  }

  // Account endpoints (stubs)
  if (method === "POST" && url === "/accounts/register") {
    return notImplemented(res);
  }

  if (method === "POST" && url === "/accounts/login") {
    return notImplemented(res);
  }

  if (method === "POST" && url === "/accounts/logout") {
    return notImplemented(res);
  }

  if (method === "GET" && url === "/accounts/me") {
    return notImplemented(res);
  }

  // Graph endpoints (stubs)
  if (method === "GET" && url === "/graphs") {
    return notImplemented(res);
  }

  if (method === "POST" && url === "/graphs") {
    try {
      const body = await parseBody(req);
      if (!body) {
        return sendJson(res, 400, { error: "missing_body" });
      }
      const result = await graphStore.createGraph(body);
      if (result.error) {
        return sendJson(res, 400, { error: result.error });
      }
      return sendJson(res, 200, { id: result });
    } catch (error) {
      return sendJson(res, 400, { error: "invalid_json" });
    }
  }

  if (method === "GET" && url.startsWith("/graphs/")) {
    const graphId = url.split("/")[2];
    const graph = await graphStore.getGraph(graphId);
    if (graph.error) {
      return sendJson(res, 404, { error: graph.error });
    }
    return sendJson(res, 200, graph);
  }

  if (method === "PUT" && url.startsWith("/graphs/")) {
    return notImplemented(res);
  }

  if (method === "DELETE" && url.startsWith("/graphs/")) {
    return notImplemented(res);
  }

  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`GraphMaker backend listening on port http://localhost:${PORT}`);
});
