const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "graphs.json");

const ROUND_PRECISION = 3;

const roundNumber = (value) => Number.isFinite(value)
  ? Number(value.toFixed(ROUND_PRECISION))
  : value;

const roundDeep = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => roundDeep(item));
  }
  if (value && typeof value === "object") {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = roundDeep(value[key]);
      return acc;
    }, {});
  }
  if (typeof value === "number") {
    return roundNumber(value);
  }
  return value;
};

const stableStringify = (value) => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(",")}}`;
};

const normalizeGraphData = (rawGraph) => {
  // TODO: add schema versioning here when graph data evolves.
  const rounded = roundDeep(rawGraph);
  if (!rounded || !Array.isArray(rounded.shapes)) {
    return null;
  }
  const shapesWithKeys = rounded.shapes.map((shape) => ({
    shape,
    key: stableStringify(shape)
  }));
  shapesWithKeys.sort((a, b) => a.key.localeCompare(b.key));
  return {
    ...rounded,
    shapes: shapesWithKeys.map(({shape}) => shape)
  };
};

const hashGraph = (graphData) => {
  const normalized = normalizeGraphData(graphData);
  if (!normalized) return null;
  const payload = stableStringify(normalized);
  return crypto.createHash("sha256").update(payload).digest("hex");
};

const graphStore = new Map();

const loadGraphs = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([id, graph]) => {
      graphStore.set(id, graph);
    });
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to load graphs", error);
    }
  }
};

const saveGraphs = () => {
  const data = Object.fromEntries(graphStore.entries());
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

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

loadGraphs();

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
      const normalized = normalizeGraphData(body);
      if (!normalized) {
        return sendJson(res, 400, { error: "invalid_graph" });
      }
      const id = hashGraph(normalized);
      if (!id) {
        return sendJson(res, 400, { error: "invalid_graph" });
      }
      if (!graphStore.has(id)) {
        graphStore.set(id, normalized);
        saveGraphs();
      }
      return sendJson(res, 200, { id });
    } catch (error) {
      return sendJson(res, 400, { error: "invalid_json" });
    }
  }

  if (method === "GET" && url.startsWith("/graphs/")) {
    const graphId = url.split("/")[2];
    const graph = graphStore.get(graphId);
    if (!graph) {
      return sendJson(res, 404, { error: "not_found" });
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
